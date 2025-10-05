import http from 'http';
import chalk from 'chalk';
import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 8787;

interface AIInteraction {
  timestamp: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUSD: number;
  taskType?: string;
}

// Helper to resolve dot notation paths
const getValueFromPath = (obj: any, path: string) => {
  if (!path) return 0;
  return path.split('.').reduce((res, prop) => res && res[prop], obj) || 0;
};

export const startProxyServer = async () => {
  // --- Load Provider Config ---
  let providerConfig;
  const configPath = path.resolve(process.cwd(), 'toknxr.config.json');
  if (!fs.existsSync(configPath)) {
      console.error(chalk.red(`[Proxy] Error: 'toknxr.config.json' not found in the current directory.`));
      console.error(chalk.yellow(`[Proxy] Please create one based on the 'ai-config-template.json' in the foundation pack.`));
      process.exit(1);
  }
  try {
    const configFile = fs.readFileSync(configPath, 'utf8');
    providerConfig = JSON.parse(configFile);
    console.log(chalk.green('[Proxy] Successfully loaded provider configuration.'));
  } catch (error) {
    console.error(chalk.red('[Proxy] Error parsing toknxr.config.json:', error));
    process.exit(1);
  }
  // --------------------------

  const server = http.createServer(async (req, res) => {
    console.log(chalk.blue(`[Proxy] Received request: ${req.method} ${req.url}`));

    const matchedProvider = providerConfig.providers.find(p => req.url?.startsWith(p.routePrefix));

    if (req.method === 'POST' && matchedProvider) {
      try {
        console.log(chalk.gray(`[Proxy] Matched provider: ${matchedProvider.name}`));
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const requestBody = Buffer.concat(chunks).toString();
        const requestData = JSON.parse(requestBody);

        // --- Dynamic Request Forwarding ---
        const headers = { 'Content-Type': 'application/json' };
        if (matchedProvider.apiKeyEnvVar) {
          const apiKey = process.env[matchedProvider.apiKeyEnvVar];
          if (!apiKey) {
            throw new Error(`${matchedProvider.apiKeyEnvVar} environment variable not set.`);
          }
          const authHeader = matchedProvider.authHeader || 'Authorization';
          const authScheme = matchedProvider.authScheme ? `${matchedProvider.authScheme} ` : '';
          headers[authHeader] = `${authScheme}${apiKey}`;
        }

        const targetUrl = matchedProvider.targetUrl.replace(/\/$/, '') + req.url.substring(matchedProvider.routePrefix.length);
        console.log(chalk.gray(`[Proxy] Forwarding request to ${targetUrl}`));

        const apiResponse = await axios.post(targetUrl, requestData, { headers });
        const responseData = apiResponse.data;
        // --------------------------------

        // --- Dynamic Data Extraction ---
        console.log(chalk.cyan('[Proxy] Extracting interaction data...'));
        const mapping = matchedProvider.tokenMapping;
        const promptTokens = getValueFromPath(responseData, mapping.prompt);
        const completionTokens = getValueFromPath(responseData, mapping.completion);
        const totalTokens = getValueFromPath(responseData, mapping.total) || promptTokens + completionTokens;

        const interactionData: AIInteraction = {
          timestamp: new Date().toISOString(),
          provider: matchedProvider.name,
          model: responseData.model || 'unknown',
          promptTokens: promptTokens,
          completionTokens: completionTokens,
          totalTokens: totalTokens,
          costUSD: 0, // Implement cost calculation later
          taskType: 'chat',
        };
        // ---------------------------

        // --- Local File Logging ---
        console.log(chalk.cyan('[Proxy] Logging interaction to local file...'));
        const logFilePath = path.resolve(process.cwd(), 'interactions.log');
        fs.appendFileSync(logFilePath, JSON.stringify(interactionData) + '\n');
        console.log(chalk.green(`[Proxy] Interaction successfully logged to ${logFilePath}`));
        // --------------------------

        res.writeHead(apiResponse.status, apiResponse.headers);
        res.end(JSON.stringify(responseData));

        console.log(chalk.magenta('[Proxy] Request successfully proxied and data tracked.'));

      } catch (error: any) {
        console.error(chalk.red('[Proxy] Error:', error.message));
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to proxy request' }));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found. No matching provider route in toknxr.config.json.');
    }
  });

  server.listen(PORT, () => {
    console.log(chalk.yellow(`[Proxy] Server listening on http://localhost:${PORT}`));
    console.log(chalk.yellow('Loaded providers:', providerConfig.providers.map(p => p.name).join(', ')));
  });
};