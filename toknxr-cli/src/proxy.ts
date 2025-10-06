import * as http from 'http';
import 'dotenv/config';
import chalk from 'chalk';
import axios from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { estimateCostUSD } from './pricing.js';
import { loadPolicy, currentMonthKey, computeMonthlySpend, sendBudgetAlert } from './policy.js';
import { analyzeCodeQuality, scoreEffectiveness, extractCodeFromResponse, CodeQualityMetrics } from './code-analysis.js';
import { hallucinationDetector, HallucinationDetection } from './hallucination-detector.js';

const PORT = 8788;

interface AIInteraction {
  timestamp: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUSD: number;
  taskType?: string;
  // New code quality analysis fields
  userPrompt?: string;
  aiResponse?: string;
  extractedCode?: string;
  codeQualityScore?: number;
  codeQualityMetrics?: CodeQualityMetrics;
  effectivenessScore?: number;
  // Hallucination detection
  hallucinationDetection?: HallucinationDetection;
}

// Helper to resolve dot notation paths
const getValueFromPath = (obj: unknown, path: string): number => {
  if (!path || !obj) return 0;
  try {
    const result = path.split('.').reduce((res: unknown, prop: string) =>
      res && typeof res === 'object' && prop in res ? (res as Record<string, unknown>)[prop] : undefined,
      obj
    );
    return Number(result) || 0;
  } catch {
    return 0;
  }
};

interface ProviderConfig {
  providers: Array<{
    name: string;
    routePrefix: string;
    targetUrl: string;
    apiKeyEnvVar: string;
    authHeader: string;
    authScheme?: string;
    tokenMapping: {
      prompt: string;
      completion: string;
      total: string;
    };
  }>;
}

export const startProxyServer = async () => {
  // --- Load Provider Config ---
  let providerConfig: ProviderConfig;
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
    const requestId = randomUUID();
    console.log(chalk.blue(`[Proxy] Received request: ${req.method} ${req.url}`));

    // Health check endpoint
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    // Redirect root to dashboard for convenience
    if (req.method === 'GET' && (req.url === '/' || req.url === '')) {
      res.writeHead(302, { Location: '/dashboard' });
      res.end();
      return;
    }

    // Enhanced stats API for dashboard
    if (req.method === 'GET' && req.url === '/api/stats') {
      const logFilePath = path.resolve(process.cwd(), 'interactions.log');
      const monthKey = currentMonthKey();
      const sums = computeMonthlySpend(logFilePath, monthKey);

      // Read recent interactions for the dashboard
      interface RecentInteraction {
        timestamp: string;
        provider: string;
        model: string;
        cost: number;
        taskType?: string;
        qualityScore?: number;
        effectivenessScore?: number;
      }

      let recentInteractions: RecentInteraction[] = [];
      if (fs.existsSync(logFilePath)) {
        try {
          const fileContent = fs.readFileSync(logFilePath, 'utf8');
          const lines = fileContent.trim().split('\n');
          recentInteractions = lines.slice(-20) // Last 20 interactions
            .map(line => JSON.parse(line))
            .map((interaction: unknown) => ({
              timestamp: (interaction as { timestamp: string }).timestamp,
              provider: (interaction as { provider: string }).provider,
              model: (interaction as { model: string }).model,
              cost: (interaction as { costUSD: number }).costUSD || 0,
              taskType: (interaction as { taskType?: string }).taskType,
              qualityScore: (interaction as { codeQualityScore?: number }).codeQualityScore,
              effectivenessScore: (interaction as { effectivenessScore?: number }).effectivenessScore
            }))
            .reverse(); // Most recent first
        } catch (error) {
          console.error('Error reading recent interactions:', error);
        }
      }

      // Calculate waste rate based on quality scores
      const codingInteractions = recentInteractions.filter(i => i.taskType === 'coding');
      const wasteRate = codingInteractions.length > 0
        ? (codingInteractions.filter(i => (i.qualityScore || 0) < 70).length / codingInteractions.length) * 100
        : 0;

      // Count total interactions from recent interactions for this month
      const monthInteractions = recentInteractions.filter(i => {
        const interactionDate = new Date(i.timestamp);
        const interactionMonth = currentMonthKey(interactionDate);
        return interactionMonth === monthKey;
      });

      const enhancedStats = {
        monthKey,
        totals: sums,
        recentInteractions,
        wasteRate,
        summary: {
          totalCost: sums.total || 0,
          totalInteractions: monthInteractions.length,
          avgCostPerTask: monthInteractions.length ? (sums.total / monthInteractions.length) : 0,
          wasteRate
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(enhancedStats));
      return;
    }

    // Enhanced React Dashboard
    if (req.method === 'GET' && req.url === '/dashboard') {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TokNXR Dashboard - AI Analytics</title>
  <style>
    /* Inline critical CSS for better loading experience */
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    #dashboard-root { min-height: 100vh; }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-size: 18px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div id="dashboard-root">
    <div class="loading">Loading TokNXR Dashboard...</div>
  </div>
  <script>
    // Inline the dashboard script
    ${fs.readFileSync(path.resolve(process.cwd(), 'src/dashboard.tsx'), 'utf8').replace(/export default function Dashboard/, 'function Dashboard').replace(/import React.*$/m, '').replace(/import { createRoot }.*$/m, '')}
  </script>
</body>
</html>`;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
      return;
    }

    const matchedProvider = providerConfig.providers.find((p: ProviderConfig['providers'][0]) => req.url?.startsWith(p.routePrefix));

    if (req.method === 'POST' && matchedProvider) {
      try {
        console.log(chalk.gray(`[Proxy] Matched provider: ${matchedProvider.name} | requestId=${requestId}`));
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const requestBody = Buffer.concat(chunks).toString();
        const requestData = JSON.parse(requestBody);

        // --- Hard budget enforcement (pre-flight) ---
        const prePolicy = loadPolicy(process.cwd());
        if (prePolicy) {
          const preLogPath = path.resolve(process.cwd(), 'interactions.log');
          const preMonth = currentMonthKey();
          const preSums = computeMonthlySpend(preLogPath, preMonth);
          let overCap = false;
          const reasons: string[] = [];
          if (prePolicy.monthlyUSD && preSums.total > prePolicy.monthlyUSD) {
            overCap = true; reasons.push(`total>${prePolicy.monthlyUSD}`);
          }
          if (prePolicy.perProviderMonthlyUSD) {
            const cap = prePolicy.perProviderMonthlyUSD[matchedProvider.name];
            if (typeof cap === 'number') {
              const spent = (preSums.byProvider[matchedProvider.name] || 0);
              if (spent > cap) { overCap = true; reasons.push(`${matchedProvider.name}>${cap}`); }
            }
          }
          if (overCap) {
            console.log(chalk.red(`[Proxy] Hard budget enforcement: blocking request | reasons=${reasons.join(', ')} | requestId=${requestId}`));
            res.writeHead(429, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Budget exceeded', reasons, requestId }));
            return;
          }
        }

        // --- Dynamic Request Forwarding ---
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (matchedProvider.apiKeyEnvVar) {
          const apiKey = process.env[matchedProvider.apiKeyEnvVar];
          if (!apiKey) {
            throw new Error(`${matchedProvider.apiKeyEnvVar} environment variable not set.`);
          }
          const authHeader = matchedProvider.authHeader || 'Authorization';
          const authScheme = matchedProvider.authScheme ? `${matchedProvider.authScheme} ` : '';
          headers[authHeader as string] = `${authScheme}${apiKey}`;
        }

        const targetUrl = matchedProvider.targetUrl.replace(/\/$/, '') + (req.url || '').substring(matchedProvider.routePrefix.length);
        console.log(chalk.gray(`[Proxy] Forwarding request to ${targetUrl} | requestId=${requestId}`));

        const apiResponse = await axios.post(targetUrl, requestData, {
          headers,
          timeout: 20000,
          validateStatus: () => true,
        });
        if (apiResponse.status >= 500) {
          // simple retry with exponential backoff
          const backoffs = [300, 600, 1200];
          for (const ms of backoffs) {
            await new Promise(r => setTimeout(r, ms));
            const retry = await axios.post(targetUrl, requestData, { headers, timeout: 20000, validateStatus: () => true });
            if (retry.status < 500) {
              apiResponse.status = retry.status;
              (apiResponse as { data: unknown }).data = retry.data;
              break;
            }
          }
        }
        if (apiResponse.status >= 400) {
          throw new Error(`Upstream error ${apiResponse.status}`);
        }
        const responseData = apiResponse.data;
        // --------------------------------

        // --- Extract User Prompt and AI Response for Analysis ---
        console.log(chalk.cyan(`[Proxy] Extracting request/response content for analysis... | requestId=${requestId}`));

        // Extract user prompt from request (Gemini format)
        let userPrompt = '';
        if (requestData.contents && requestData.contents[0]?.parts?.[0]?.text) {
          userPrompt = requestData.contents[0].parts[0].text;
        }

        // Extract AI response text (Gemini format)
        let aiResponseText = '';
        if (responseData.candidates && responseData.candidates[0]?.content?.parts?.[0]?.text) {
          aiResponseText = responseData.candidates[0].content.parts[0].text;
        }

        // Check if this appears to be a coding request
        const isCodeRequest = /code|function|script|program|algorithm|implement/i.test(userPrompt) ||
                             /```.*\n[\s\S]*```/.test(aiResponseText);

        // --- Dynamic Data Extraction ---
        console.log(chalk.cyan(`[Proxy] Extracting interaction data... | requestId=${requestId}`));
        const mapping = matchedProvider.tokenMapping;
        const promptTokens = getValueFromPath(responseData, mapping.prompt);
        const completionTokens = getValueFromPath(responseData, mapping.completion);
        const totalTokens = getValueFromPath(responseData, mapping.total) || promptTokens + completionTokens;

        const interactionData: AIInteraction = {
          timestamp: new Date().toISOString(),
          provider: matchedProvider.name,
          model: responseData.model || 'gemini-2.5-flash',
          promptTokens: promptTokens,
          completionTokens: completionTokens,
          totalTokens: totalTokens,
          costUSD: estimateCostUSD(responseData.model || 'gemini-2.5-flash', promptTokens, completionTokens),
          taskType: isCodeRequest ? 'coding' : 'chat',
        };

        // --- Enhanced AI Analysis (for all requests) ---
        if (userPrompt && aiResponseText) {
          console.log(chalk.cyan(`[Proxy] Running AI analysis pipeline... | requestId=${requestId}`));

          // Store original texts for analysis
          interactionData.userPrompt = userPrompt;
          interactionData.aiResponse = aiResponseText;

          // Run hallucination detection on all interactions
          const hallucinationDetection = hallucinationDetector.detectHallucination(
            userPrompt,
            aiResponseText
          );

          // Add hallucination data to interaction (will be serialized to JSON)
          interactionData.hallucinationDetection = hallucinationDetection;

          console.log(chalk.cyan(`[Proxy] Hallucination detection complete - Confidence: ${hallucinationDetection.confidence}%, Likely: ${hallucinationDetection.isLikelyHallucination} | requestId=${requestId}`));

          // Code Quality Analysis (if this is a coding request)
          if (isCodeRequest) {
            console.log(chalk.cyan(`[Proxy] Running code quality analysis... | requestId=${requestId}`));

            // Extract code from response
            const extractedCodeResult = extractCodeFromResponse(aiResponseText);
            if (extractedCodeResult) {
              interactionData.extractedCode = extractedCodeResult.code;

              // Analyze code quality
              const qualityMetrics = analyzeCodeQuality(extractedCodeResult.code, extractedCodeResult.language);
              interactionData.codeQualityMetrics = qualityMetrics;

              // Calculate overall quality score (0-100)
              let qualityScore = 50; // Base
              if (qualityMetrics.syntaxValid) qualityScore += 20;
              qualityScore += Math.round(qualityMetrics.estimatedReadability * 2); // 0-20
              if (qualityMetrics.hasFunctions || qualityMetrics.hasClasses) qualityScore += 15;
              if (qualityMetrics.potentialIssues.length === 0) qualityScore += 10;
              if (qualityMetrics.linesOfCode > 20) qualityScore += 5; // Substantial implementation
              interactionData.codeQualityScore = Math.min(100, qualityScore);

              // Score effectiveness (how well the AI understood and fulfilled the request)
              const effectiveness = scoreEffectiveness(userPrompt, aiResponseText, extractedCodeResult.code);
              interactionData.effectivenessScore = effectiveness.overallEffectiveness;

              console.log(chalk.green(`[Proxy] Code analysis complete - Quality: ${qualityScore}/100, Effectiveness: ${effectiveness.overallEffectiveness}/100 | requestId=${requestId}`));
            }
          }
        }
        // ---------------------------

        // --- Local File Logging ---
        console.log(chalk.cyan(`[Proxy] Logging interaction to local file... | requestId=${requestId}`));
        const logFilePath = path.resolve(process.cwd(), 'interactions.log');
        const logLine = JSON.stringify({ requestId, ...interactionData });
        try {
          const stats = fs.existsSync(logFilePath) ? fs.statSync(logFilePath) : null;
          if (stats && stats.size > 5 * 1024 * 1024) {
            const rotated = `${logFilePath.replace(/\.log$/, '')}.${Date.now()}.log`;
            fs.renameSync(logFilePath, rotated);
            console.log(chalk.gray(`[Proxy] Rotated log to ${rotated}`));
          }
        } catch {}
        fs.appendFileSync(logFilePath, logLine + '\n');
        console.log(chalk.green(`[Proxy] Interaction successfully logged to ${logFilePath} | requestId=${requestId}`));

        // --- Budgets and Alerts ---
        const policy = loadPolicy(process.cwd());
        if (policy) {
          const monthKey = currentMonthKey();
          const sums = computeMonthlySpend(logFilePath, monthKey);
          const breached: string[] = [];
          if (policy.monthlyUSD && sums.total > policy.monthlyUSD) {
            breached.push(`total>${policy.monthlyUSD}`);
          }
          if (policy.perProviderMonthlyUSD) {
            for (const p in policy.perProviderMonthlyUSD) {
              const cap = policy.perProviderMonthlyUSD[p];
              const spent = sums.byProvider[p] || 0;
              if (spent > cap) breached.push(`${p}>${cap}`);
            }
          }
          if (breached.length && policy.webhookUrl) {
            await sendBudgetAlert(policy.webhookUrl, {
              requestId,
              monthKey,
              breaches: breached,
              totals: sums,
            });
            console.log(chalk.red(`[Proxy] Budget breach detected (${breached.join(', ')}) | requestId=${requestId}`));
          }
        }
        // --------------------------

        res.writeHead(apiResponse.status, apiResponse.headers as Record<string, string>);
        res.end(JSON.stringify(responseData));

        console.log(chalk.magenta(`[Proxy] Request successfully proxied and data tracked. | requestId=${requestId}`));

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(chalk.red(`[Proxy] Error: ${errorMessage} | requestId=${requestId}`));
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to proxy request', requestId }));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found. No matching provider route in toknxr.config.json.');
    }
  });

  server.listen(PORT, () => {
    console.log(chalk.yellow(`[Proxy] Server listening on http://localhost:${PORT}`));
    console.log(chalk.yellow('Loaded providers:', providerConfig.providers.map((p: ProviderConfig['providers'][0]) => p.name).join(', ')));
  });
};
