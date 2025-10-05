import http from 'http';
import chalk from 'chalk';
import axios from 'axios';

const PORT = 8787;
const OLLAMA_API_URL = 'http://localhost:11434';

export const startProxyServer = () => {
  const server = http.createServer(async (req, res) => {
    console.log(chalk.blue(`[Proxy] Received request: ${req.method} ${req.url}`));

    if (req.method === 'POST' && req.url?.startsWith('/api/chat')) {
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const requestBody = Buffer.concat(chunks).toString();
        const requestData = JSON.parse(requestBody);

        console.log(chalk.gray('[Proxy] Forwarding request to Ollama...'));

        const ollamaResponse = await axios.post(`${OLLAMA_API_URL}${req.url}`, requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const responseData = ollamaResponse.data;

        // --- Data Extraction Logic ---
        console.log(chalk.cyan('[Proxy] Extracting interaction data...'));
        const interactionData = {
          promptTokens: responseData.prompt_eval_count,
          completionTokens: responseData.eval_count,
          totalTokens: responseData.prompt_eval_count + responseData.eval_count,
        };
        console.log(interactionData);
        // ---------------------------

        res.writeHead(ollamaResponse.status, ollamaResponse.headers);
        res.end(JSON.stringify(responseData));

        console.log(chalk.magenta('[Proxy] Request successfully proxied and data extracted.'));

      } catch (error: any) {
        console.error(chalk.red('[Proxy] Error:', error.message));
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to proxy request to Ollama' }));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.listen(PORT, () => {
    console.log(chalk.yellow(`[Proxy] Server listening on http://localhost:${PORT}`));
  });
};