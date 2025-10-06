import { Command } from 'commander';
import chalk from 'chalk';
import { startProxyServer } from './proxy.js';
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import open from 'open';

// Gracefully handle broken pipe (e.g., piping output to `head`)
process.stdout.on('error', (err: any) => {
  if (err && err.code === 'EPIPE') process.exit(0);
});
process.stderr.on('error', (err: any) => {
  if (err && err.code === 'EPIPE') process.exit(0);
});

const program = new Command();

// ASCII Art Welcome Screen with gradient colors
const asciiArt = `
${chalk.blue('  ████████╗')}${chalk.hex('#6B5BED')('  ██████╗ ')}${chalk.hex('#9B5BED')(' ██╗  ██╗')}${chalk.hex('#CB5BED')(' ███╗   ██╗')}${chalk.hex('#ED5B9B')(' ██╗  ██╗')}${chalk.hex('#ED5B6B')(' ██████╗ ')}
${chalk.blue('  ╚══██╔══╝')}${chalk.hex('#6B5BED')(' ██╔═══██╗')}${chalk.hex('#9B5BED')(' ██║ ██╔╝')}${chalk.hex('#CB5BED')(' ████╗  ██║')}${chalk.hex('#ED5B9B')(' ╚██╗██╔╝')}${chalk.hex('#ED5B6B')(' ██╔══██╗')}
${chalk.blue('     ██║   ')}${chalk.hex('#6B5BED')(' ██║   ██║')}${chalk.hex('#9B5BED')(' █████╔╝ ')}${chalk.hex('#CB5BED')(' ██╔██╗ ██║')}${chalk.hex('#ED5B9B')('  ╚███╔╝ ')}${chalk.hex('#ED5B6B')(' ██████╔╝')}
${chalk.blue('     ██║   ')}${chalk.hex('#6B5BED')(' ██║   ██║')}${chalk.hex('#9B5BED')(' ██╔═██╗ ')}${chalk.hex('#CB5BED')(' ██║╚██╗██║')}${chalk.hex('#ED5B9B')('  ██╔██╗ ')}${chalk.hex('#ED5B6B')(' ██╔══██╗')}
${chalk.blue('     ██║   ')}${chalk.hex('#6B5BED')(' ╚██████╔╝')}${chalk.hex('#9B5BED')(' ██║  ██╗')}${chalk.hex('#CB5BED')(' ██║ ╚████║')}${chalk.hex('#ED5B9B')(' ██╔╝ ██╗')}${chalk.hex('#ED5B6B')(' ██║  ██║')}
${chalk.blue('     ╚═╝   ')}${chalk.hex('#6B5BED')('  ╚═════╝ ')}${chalk.hex('#9B5BED')(' ╚═╝  ╚═╝')}${chalk.hex('#CB5BED')(' ╚═╝  ╚═══╝')}${chalk.hex('#ED5B9B')(' ╚═╝  ╚═╝')}${chalk.hex('#ED5B6B')(' ╚═╝  ╚═╝')}

${chalk.cyan('Tips for getting started:')}
${chalk.white('1. Start tracking:')} ${chalk.yellow('toknxr start')} ${chalk.gray('- Launch the proxy server')}
${chalk.white('2. View analytics:')} ${chalk.yellow('toknxr stats')} ${chalk.gray('- See token usage and code quality')}
${chalk.white('3. Deep dive:')} ${chalk.yellow('toknxr code-analysis')} ${chalk.gray('- Detailed quality insights')}
${chalk.white('4. Code review:')} ${chalk.yellow('toknxr review')} ${chalk.gray('- Review AI-generated code')}
${chalk.white('5. Set limits:')} ${chalk.yellow('toknxr policy:init')} ${chalk.gray('- Configure spending policies')}
${chalk.white('6. Need help?')} ${chalk.yellow('toknxr --help')} ${chalk.gray('- View all commands')}

${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}

${chalk.hex('#FFD700')('🐑 Powered by Golden Sheep AI')}

`;

console.log(asciiArt);

// --- Supabase Client ---
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error(chalk.red('Error: Supabase URL or Key not found in environment variables.'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

program
  .name('toknxr')
  .description('AI Effectiveness & Code Quality Analysis CLI')
  .version('0.1.0');

program
  .command('start')
  .description('Start the TokNxr proxy server to monitor AI interactions.')
  .action(() => {
    console.log(chalk.green('Starting TokNxr proxy server...'));
    startProxyServer();
  });

program
  .command('sync')
  .description('Sync local interaction logs to the Supabase dashboard.')
  .option('--clear', 'Clear the log file after a successful sync.')
  .action(async (options) => {
    console.log(chalk.blue('Syncing local analytics with the cloud dashboard...'));

    const logFilePath = path.resolve(process.cwd(), 'interactions.log');
    if (!fs.existsSync(logFilePath)) {
      console.log(chalk.yellow('No interactions.log file found. Nothing to sync.'));
      return;
    }

    const fileContent = fs.readFileSync(logFilePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) {
        console.log(chalk.yellow('Log file is empty. Nothing to sync.'));
        return;
    }

    const logs = [];
    for (const line of lines) {
      try {
        const log = JSON.parse(line);
        logs.push(log);
      } catch (error) {
        console.warn(`Skipping invalid log entry: ${line}`);
      }
    }

    if (logs.length === 0) {
      console.log('No valid interactions to sync.');
      return;
    }

    // Map logs to interactions
    const interactions = [];
    for (const log of logs) {
      // Find ai_service_id by provider and model
      const { data: aiService, error: aiError } = await supabase
        .from('ai_services')
        .select('id')
        .eq('provider', log.provider)
        .eq('name', log.model)
        .single();

      if (aiError || !aiService) {
        console.warn(`AI service not found for provider: ${log.provider}, model: ${log.model}`);
        continue;
      }

      // Assume project_id - for now, use a default or query user's projects
      // TODO: Add project selection or default project
      const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('id')
        .limit(1);

      if (projError || !projects || projects.length === 0) {
        console.error('No projects found for user.');
        continue;
      }

      const projectId = projects[0].id;

      const interaction = {
        project_id: projectId,
        ai_service_id: aiService.id,
        tokens_used: log.totalTokens,
        cost_in_cents: Math.round(log.costUSD * 100),
        timestamp: new Date(log.timestamp).toISOString(),
        request_details: log.userPrompt || '',
        response_details: log.aiResponse || log.extractedCode || '',
      };

      interactions.push(interaction);
    }

    if (interactions.length === 0) {
      console.log('No interactions to insert.');
      return;
    }

    // Insert interactions
    const { error: insertError } = await supabase
      .from('interactions')
      .insert(interactions);

    if (insertError) {
      console.error('Error syncing interactions:', insertError);
    } else {
      console.log(`Successfully synced ${interactions.length} interactions.`);
    }

    if (options.clear) {
      fs.writeFileSync(logFilePath, '');
      console.log(chalk.gray('Local interactions.log has been cleared.'));
    }
  });

program
  .command('stats')
  .description('Display token usage statistics from the local log.')
  .action(() => {
    const logFilePath = path.resolve(process.cwd(), 'interactions.log');
    if (!fs.existsSync(logFilePath)) {
      console.log(chalk.yellow('No interactions logged yet. Use the `start` command to begin tracking.'));
      return;
    }

    const fileContent = fs.readFileSync(logFilePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    const interactions = lines.map(line => JSON.parse(line));

    const stats = interactions.reduce((acc: any, interaction: any) => {
      if (!acc[interaction.provider]) {
        acc[interaction.provider] = {
          totalTokens: 0, promptTokens: 0, completionTokens: 0, requestCount: 0, costUSD: 0,
          codingCount: 0, avgQualityScore: 0, avgEffectivenessScore: 0, qualitySum: 0, effectivenessSum: 0
        };
      }
      acc[interaction.provider].totalTokens += interaction.totalTokens;
      acc[interaction.provider].promptTokens += interaction.promptTokens;
      acc[interaction.provider].completionTokens += interaction.completionTokens;
      acc[interaction.provider].requestCount += 1;
      acc[interaction.provider].costUSD += interaction.costUSD || 0;

      if (interaction.taskType === 'coding') {
        acc[interaction.provider].codingCount += 1;
        if (interaction.codeQualityScore !== undefined) {
          acc[interaction.provider].qualitySum += interaction.codeQualityScore;
        }
        if (interaction.effectivenessScore !== undefined) {
          acc[interaction.provider].effectivenessSum += interaction.effectivenessScore;
        }
      }
      return acc;
    }, {} as any);

    // Calculate averages
    for (const provider in stats) {
      const p = stats[provider];
      if (p.codingCount > 0) {
        p.avgQualityScore = Math.round(p.qualitySum / p.codingCount);
        p.avgEffectivenessScore = Math.round(p.effectivenessSum / p.codingCount);
      }
    }

    const grandTotals: any = Object.values(stats as any).reduce((acc: any, s: any) => {
      acc.totalTokens += s.totalTokens;
      acc.promptTokens += s.promptTokens;
      acc.completionTokens += s.completionTokens;
      acc.requestCount += s.requestCount;
      acc.costUSD += s.costUSD;
      acc.codingCount += s.codingCount;
      acc.qualitySum += s.qualitySum;
      acc.effectivenessSum += s.effectivenessSum;
      return acc;
    }, { totalTokens: 0, promptTokens: 0, completionTokens: 0, requestCount: 0, costUSD: 0, codingCount: 0, qualitySum: 0, effectivenessSum: 0 });

    // Calculate grand averages
    const codingTotal = grandTotals.codingCount;
    const avgQuality = codingTotal > 0 ? Math.round(grandTotals.qualitySum / codingTotal) : 0;
    const avgEffectiveness = codingTotal > 0 ? Math.round(grandTotals.effectivenessSum / codingTotal) : 0;

    console.log(chalk.bold.underline('Token Usage Statistics'));
    for (const provider in stats) {
      console.log(chalk.bold(`\nProvider: ${provider}`));
      console.log(`  Total Requests: ${stats[provider].requestCount}`);
      console.log(chalk.cyan(`  Total Tokens: ${stats[provider].totalTokens}`));
      console.log(`    - Prompt Tokens: ${stats[provider].promptTokens}`);
      console.log(`    - Completion Tokens: ${stats[provider].completionTokens}`);
      console.log(chalk.green(`  Cost (USD): $${(stats[provider].costUSD).toFixed(4)}`));

      if (stats[provider].codingCount > 0) {
        console.log(chalk.blue(`  Code Quality: ${stats[provider].avgQualityScore}/100 (avg)`));
        console.log(chalk.magenta(`  Effectiveness: ${stats[provider].avgEffectivenessScore}/100 (avg, ${stats[provider].codingCount} coding requests)`));
      }
    }

    console.log(chalk.bold(`\nGrand Totals`));
    console.log(`  Requests: ${grandTotals.requestCount}`);
    console.log(chalk.cyan(`  Tokens: ${grandTotals.totalTokens}`));
    console.log(`    - Prompt: ${grandTotals.promptTokens}`);
    console.log(`    - Completion: ${grandTotals.completionTokens}`);
    console.log(chalk.green(`  Cost (USD): $${(grandTotals.costUSD).toFixed(4)}`));

    if (codingTotal > 0) {
      console.log(`\n${chalk.bold('Code Quality Insights:')}`);
      console.log(chalk.blue(`  Coding Requests: ${codingTotal}`));
      console.log(chalk.blue(`  Avg Code Quality: ${avgQuality}/100`));
      console.log(chalk.magenta(`  Avg Effectiveness: ${avgEffectiveness}/100`));

      if (avgQuality < 70) {
        console.log(chalk.red('  ⚠️  Low code quality - consider reviewing AI-generated code more carefully'));
      }
      if (avgEffectiveness < 70) {
        console.log(chalk.red('  ⚠️  Low effectiveness - prompts may need improvement or different AI model'));
      }
    }
  });

program
  .command('init')
  .description('Scaffold .env and toknxr.config.json in the current directory')
  .action(() => {
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, 'GEMINI_API_KEY=\n');
      console.log(chalk.green(`Created ${envPath}`));
    } else {
      console.log(chalk.yellow(`Skipped ${envPath} (exists)`));
    }

    const configPath = path.resolve(process.cwd(), 'toknxr.config.json');
    if (!fs.existsSync(configPath)) {
      const config = {
        providers: [
          {
            name: 'Gemini-Pro',
            routePrefix: '/gemini',
            targetUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
            apiKeyEnvVar: 'GEMINI_API_KEY',
            authHeader: 'x-goog-api-key',
            tokenMapping: {
              prompt: 'usageMetadata.promptTokenCount',
              completion: 'usageMetadata.candidatesTokenCount',
              total: 'usageMetadata.totalTokenCount'
            }
          }
        ]
      };
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(chalk.green(`Created ${configPath}`));
    } else {
      console.log(chalk.yellow(`Skipped ${configPath} (exists)`));
    }

    const policyPath = path.resolve(process.cwd(), 'toknxr.policy.json');
    if (!fs.existsSync(policyPath)) {
      const policy = {
        version: '1',
        monthlyUSD: 50,
        perProviderMonthlyUSD: { 'Gemini-Pro': 30 },
        webhookUrl: ''
      };
      fs.writeFileSync(policyPath, JSON.stringify(policy, null, 2));
      console.log(chalk.green(`Created ${policyPath}`));
    } else {
      console.log(chalk.yellow(`Skipped ${policyPath} (exists)`));
    }
  });





program
  .command('tail')
  .description('Follow interactions.log and pretty-print new lines')
  .action(() => {
    const logFilePath = path.resolve(process.cwd(), 'interactions.log');
    if (!fs.existsSync(logFilePath)) {
      console.log(chalk.yellow('No interactions.log found. Start the proxy first.'));
      return;
    }
    console.log(chalk.gray(`Tailing ${logFilePath}... (Ctrl+C to stop)`));
    fs.watchFile(logFilePath, { interval: 500 }, () => {
      const content = fs.readFileSync(logFilePath, 'utf8').trim();
      const lines = content.split('\n');
      const last = lines[lines.length - 1];
      try {
        const j = JSON.parse(last);
        console.log(`${chalk.bold(j.provider)} ${chalk.gray(j.timestamp)} id=${j.requestId} model=${j.model} tokens=${j.totalTokens} cost=$${(j.costUSD||0).toFixed(4)}`);
      } catch {
        console.log(last);
      }
    });
  });

program
  .command('dashboard')
  .description('Open the minimal dashboard served by the proxy (/dashboard)')
  .action(async () => {
    const url = 'http://localhost:3000/dashboard'; // Assuming Next.js app serves the dashboard
    console.log(chalk.gray(`Opening ${url}...`));
    await open(url);
  });

program
  .command('policy:init')
  .description('Scaffold toknxr.policy.json from the foundation starter pack if missing')
  .action(() => {
    const dest = path.resolve(process.cwd(), 'toknxr.policy.json');
    if (fs.existsSync(dest)) {
      console.log(chalk.yellow(`Skipped ${dest} (exists)`));
      return;
    }
    // Fallback scaffold using sensible defaults if starter pack path is unavailable
    const fallback = {
      version: '1',
      monthlyUSD: 50,
      perProviderMonthlyUSD: { 'Gemini-Pro': 30 },
      webhookUrl: ''
    };
    fs.writeFileSync(dest, JSON.stringify(fallback, null, 2));
    console.log(chalk.green(`Created ${dest}`));
  });

program
  .command('code-analysis')
  .description('Show detailed code quality analysis from coding interactions')
  .action(() => {
    const logFilePath = path.resolve(process.cwd(), 'interactions.log');
    if (!fs.existsSync(logFilePath)) {
      console.log(chalk.yellow('No interactions logged yet. Use the `start` command to begin tracking.'));
      return;
    }

    const fileContent = fs.readFileSync(logFilePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    const interactions = lines.map(line => JSON.parse(line)).filter(i => i.taskType === 'coding');

    if (interactions.length === 0) {
      console.log(chalk.yellow('No coding interactions found. Code analysis requires coding requests to the proxy.'));
      return;
    }

    console.log(chalk.bold.underline('AI Code Quality Analysis'));

    // Language distribution
    const langStats = interactions.reduce((acc: any, i: any) => {
      const lang = i.codeQualityMetrics?.language || 'unknown';
      if (!acc[lang]) acc[lang] = 0;
      acc[lang]++;
      return acc;
    }, {});

    console.log(chalk.bold('\nLanguage Distribution:'));
    for (const [lang, count] of Object.entries(langStats)) {
      console.log(`  ${lang}: ${count} requests`);
    }

    // Quality score distribution
    const qualityRanges = { excellent: 0, good: 0, fair: 0, poor: 0 };
    const effectivenessRanges = { excellent: 0, good: 0, fair: 0, poor: 0 };

    interactions.forEach((i: any) => {
      const q = i.codeQualityScore || 0;
      const e = i.effectivenessScore || 0;

      if (q >= 90) qualityRanges.excellent++;
      else if (q >= 75) qualityRanges.good++;
      else if (q >= 60) qualityRanges.fair++;
      else qualityRanges.poor++;

      if (e >= 90) effectivenessRanges.excellent++;
      else if (e >= 75) effectivenessRanges.good++;
      else if (e >= 60) effectivenessRanges.fair++;
      else effectivenessRanges.poor++;
    });

    console.log(chalk.bold('\nCode Quality Scores:'));
    console.log(chalk.green(`  Excellent (90-100): ${qualityRanges.excellent}`));
    console.log(chalk.blue(`  Good (75-89): ${qualityRanges.good}`));
    console.log(chalk.yellow(`  Fair (60-74): ${qualityRanges.fair}`));
    console.log(chalk.red(`  Poor (0-59): ${qualityRanges.poor}`));

    console.log(chalk.bold('\nEffectiveness Scores (Prompt ↔ Result):'));
    console.log(chalk.green(`  Excellent (90-100): ${effectivenessRanges.excellent}`));
    console.log(chalk.blue(`  Good (75-89): ${effectivenessRanges.good}`));
    console.log(chalk.yellow(`  Fair (60-74): ${effectivenessRanges.fair}`));
    console.log(chalk.red(`  Poor (0-59): ${effectivenessRanges.poor}`));

    // Recent examples with low scores
    const lowQuality = interactions.filter((i: any) => (i.codeQualityScore || 0) < 70).slice(-3);
    if (lowQuality.length > 0) {
      console.log(chalk.bold('\n🔍 Recent Low-Quality Code Examples:'));
      lowQuality.forEach((i: any, idx: number) => {
        console.log(`\n${idx + 1}. Quality: ${i.codeQualityScore}/100${i.effectivenessScore ? ` | Effectiveness: ${i.effectivenessScore}/100` : ''}`);
        console.log(`   Provider: ${i.provider} | Model: ${i.model}`);
        if (i.userPrompt) {
          const prompt = i.userPrompt.substring(0, 100);
          console.log(`   Prompt: ${prompt}${i.userPrompt.length > 100 ? '...' : ''}`);
        }
        if (i.codeQualityMetrics?.potentialIssues?.length > 0) {
          console.log(`   Issues: ${i.codeQualityMetrics.potentialIssues.join(', ')}`);
        }
      });
    }

    // Improvement suggestions
    const avgQuality = interactions.reduce((sum: number, i: any) => sum + (i.codeQualityScore || 0), 0) / interactions.length;
    const avgEffectiveness = interactions.reduce((sum: number, i: any) => sum + (i.effectivenessScore || 0), 0) / interactions.length;

    console.log(chalk.bold('\n💡 Improvement Suggestions:'));
    if (avgQuality < 70) {
      console.log('  • Consider reviewing AI-generated code more carefully before use');
      console.log('  • Try more specific, detailed prompts for complex tasks');
    }
    if (avgEffectiveness < 70) {
      console.log('  • Improve prompt clarity - be more specific about requirements');
      console.log('  • Consider using different AI models for different types of tasks');
      console.log('  • Break complex requests into smaller, focused prompts');
    }
    if (avgQuality >= 80 && avgEffectiveness >= 80) {
      console.log('  • Great! Your AI coding setup is working well');
      console.log('  • Consider establishing code review processes for edge cases');
    }

    console.log(`\n${chalk.gray('Total coding interactions analyzed: ' + interactions.length)}`);
  });

program.parse(process.argv);
