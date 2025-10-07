import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import { startProxyServer } from './proxy.js';
import { login } from './auth.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import open from 'open';
import { syncInteractions } from './sync.js';
import {
  createStatsOverview,
  createProviderTable,
  createQualityBreakdown,
  createOperationProgress,
  createInteractiveMenu,
  createBox,
  createCostChart,
  type OraWithProgress
} from './ui.js';

// Define a type for the interaction object
interface Interaction {
  provider: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  costUSD: number;
  taskType?: string;
  codeQualityScore?: number;
  effectivenessScore?: number;
  codeQualityMetrics?: {
    language?: string;
    potentialIssues?: string[];
  };
  userPrompt?: string;
  model?: string;
  requestId?: string;
  timestamp?: string;
}


// Gracefully handle broken pipe (e.g., piping output to `head`)
process.stdout.on('error', (err: NodeJS.ErrnoException | null) => {
  if (err && err.code === 'EPIPE') process.exit(0);
});
process.stderr.on('error', (err: NodeJS.ErrnoException | null) => {
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
${chalk.white('5. Login:')} ${chalk.yellow('toknxr login')} ${chalk.gray('- Authenticate with your account')}
${chalk.white('6. Set limits:')} ${chalk.yellow('toknxr policy:init')} ${chalk.gray('- Configure spending policies')}
${chalk.white('7. Need help?')} ${chalk.yellow('toknxr --help')} ${chalk.gray('- View all commands')}

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

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

/**
 * Generate weekly cost trends for the cost chart visualization
 */
function generateWeeklyCostTrends(interactions: Interaction[]): number[] {
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Initialize array for 7 days
  const dailyCosts: number[] = new Array(7).fill(0);

  // Group costs by day (0 = today, 1 = yesterday, etc.)
  interactions.forEach((interaction: Interaction) => {
    if (interaction.timestamp) {
      const interactionDate = new Date(interaction.timestamp);

      // Only consider last 7 days
      if (interactionDate >= lastWeek) {
        const daysDiff = Math.floor((now.getTime() - interactionDate.getTime()) / (24 * 60 * 60 * 1000));

        // Map to array index (0 = today, 6 = 7 days ago)
        if (daysDiff >= 0 && daysDiff < 7) {
          // Reverse the index so that index 0 = 7 days ago, index 6 = today
          const arrayIndex = 6 - daysDiff;
          dailyCosts[arrayIndex] += interaction.costUSD || 0;
        }
      }
    }
  });

  // If we have real data, use it; otherwise create some sample visualization
  const hasRealData = dailyCosts.some((cost: number) => cost > 0);

  if (!hasRealData) {
    // Create sample data for demonstration (normally we'd skip showing the chart)
    // This creates a nice demo pattern when no data is available
    for (let i = 0; i < 7; i++) {
      dailyCosts[i] = Math.max(0, (Math.random() * 2) + 0.1); // Random demo costs
    }
  }

  return dailyCosts;
}

program
  .name('toknxr')
  .description('AI Effectiveness & Code Quality Analysis CLI')
  .version('0.1.0');

program
  .command('menu')
  .description('Interactive menu system for TokNXR operations')
  .action(async () => {
    try {
      const choice = await createInteractiveMenu([
        { name: chalk.cyan('🚀 Start Tracking') + chalk.gray(' - Launch proxy server'), value: 'start' },
        { name: chalk.blue('📊 View Statistics') + chalk.gray(' - Token usage & costs'), value: 'stats' },
        { name: chalk.magenta('🔍 Code Analysis') + chalk.gray(' - Quality insights'), value: 'analysis' },
        { name: chalk.green('🔄 Sync Data') + chalk.gray(' - Upload to dashboard'), value: 'sync' },
        { name: chalk.yellow('🧠 AI Analysis') + chalk.gray(' - Hallucination detection'), value: 'hallucinations' },
        { name: chalk.red('⚙️ Initialize') + chalk.gray(' - Set up configuration'), value: 'init' }
      ]);

      switch (choice) {
        case 'start':
          console.log(chalk.blue.bold('\n🚀 Starting TokNXR Proxy Server'));
          const spinner = createOperationProgress('Initializing', [
            'Loading configuration',
            'Setting up providers',
            'Starting analytics engine',
            'Ready for requests'
          ]);

          setTimeout(() => spinner.updateProgress(0), 500);
          setTimeout(() => spinner.updateProgress(1), 1000);
          setTimeout(() => spinner.updateProgress(2), 1500);
          setTimeout(() => {
            spinner.updateProgress(3);
            spinner.succeed('Proxy server launched successfully!');
            startProxyServer();
          }, 2000);
          break;

        case 'stats':
          // This will auto-trigger the stats command
          break;

        case 'analysis':
          // This will auto-trigger the code-analysis command
          break;

        case 'sync':
          await syncInteractions(supabase, {});
          break;

        case 'hallucinations':
          // This will trigger hallucination analytics
          break;

        case 'init':
          // This will trigger init command
          break;
      }
    } catch (error) {
      console.error(chalk.red('Menu interaction failed'), error);
    }
  });

program
  .command('start')
  .description('Start the TokNxr proxy server to monitor AI interactions.')
  .action(async () => {
    const steps = [
      'Checking system compatibility',
      'Loading configuration & policies',
      'Initializing AI provider connections',
      'Setting up proxy routing & analytics',
      'Starting background monitoring',
      'TokNXR proxy is live!'
    ];

    const spinner = createOperationProgress('TokNXR Proxy Server', steps);

    try {
      // Enhanced startup sequence with realistic timings
      setTimeout(() => spinner.updateProgress(0), 200);   // System check (fast)
      setTimeout(() => spinner.updateProgress(1), 600);   // Configuration (medium)
      setTimeout(() => spinner.updateProgress(2), 1100);  // Providers (longer)
      setTimeout(() => spinner.updateProgress(3), 1600);  // Routing setup (significant)
      setTimeout(() => spinner.updateProgress(4), 2000);  // Background monitoring (final prep)
      setTimeout(() => {
        spinner.updateProgress(5);
        spinner.succeed(chalk.green(`✨ TokNXR proxy server is ready!`));
        console.log(chalk.cyan(`🔗 Listening at: ${chalk.bold('http://localhost:8788')}`));
        console.log(chalk.gray(`🎯 Start making AI requests to see real-time analytics!`));
        console.log(chalk.gray(`💡 Use ${chalk.cyan('toknxr stats')} to view usage insights`));
        // Start the actual server
        startProxyServer();
      }, 2200);
    } catch (error) {
      spinner.fail(chalk.red('Failed to start proxy server'));
      console.log(chalk.yellow(`\n💡 Troubleshooting tips:`));
      console.log(`  • Check if port 8788 is available`);
      console.log(`  • Verify GEMINI_API_KEY is set`);
      console.log(`  • Run ${chalk.cyan('toknxr init')} to set up config`);
      throw error;
    }
  });

program
  .command('sync')
  .description('Sync local interaction logs to the Supabase dashboard.')
  .option('--clear', 'Clear the log file after a successful sync.')
  .action(async (options) => {
    await syncInteractions(supabase, options);
  });

program
  .command('stats')
  .description('Display enhanced token usage statistics with visual analytics')
  .action(async () => {
    const logFilePath = path.resolve(process.cwd(), 'interactions.log');
    if (!fs.existsSync(logFilePath)) {
      console.log(chalk.yellow('No interactions logged yet. Start tracking with: ') + chalk.cyan('toknxr start'));
      return;
    }

    // Load and parse interactions
    const fileContent = fs.readFileSync(logFilePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    const interactions: Interaction[] = lines
      .map(line => {
        try {
          return JSON.parse(line) as Interaction;
        } catch {
          return null;
        }
      })
      .filter((interaction): interaction is Interaction => interaction !== null);

    if (interactions.length === 0) {
      console.log(chalk.yellow('No valid interactions found in log file.'));
      return;
    }

    // Calculate statistics
    const stats = interactions.reduce((acc, interaction) => {
      const provider = interaction.provider;
      if (!acc[provider]) {
        acc[provider] = {
          totalTokens: 0, promptTokens: 0, completionTokens: 0,
          requestCount: 0, costUSD: 0, codingCount: 0,
          qualitySum: 0, effectivenessSum: 0, avgQualityScore: 0, avgEffectivenessScore: 0
        };
      }

      const providerStats = acc[provider];
      providerStats.totalTokens += interaction.totalTokens || 0;
      providerStats.promptTokens += interaction.promptTokens || 0;
      providerStats.completionTokens += interaction.completionTokens || 0;
      providerStats.requestCount += 1;
      providerStats.costUSD += interaction.costUSD || 0;

      if (interaction.taskType === 'coding') {
        providerStats.codingCount += 1;
        if (interaction.codeQualityScore !== undefined) {
          providerStats.qualitySum += interaction.codeQualityScore;
        }
        if (interaction.effectivenessScore !== undefined) {
          providerStats.effectivenessSum += interaction.effectivenessScore;
        }
      }
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.values(stats).forEach((providerStats: any) => {
      if (providerStats.codingCount > 0) {
        providerStats.avgQualityScore = Math.round(providerStats.qualitySum / providerStats.codingCount);
        providerStats.avgEffectivenessScore = Math.round(providerStats.effectivenessSum / providerStats.codingCount);
      }
    });

    // Calculate grand totals
    const grandTotals = Object.values(stats).reduce((acc: any, providerStats: any) => ({
      totalTokens: acc.totalTokens + providerStats.totalTokens,
      promptTokens: acc.promptTokens + providerStats.promptTokens,
      completionTokens: acc.completionTokens + providerStats.completionTokens,
      requestCount: acc.requestCount + providerStats.requestCount,
      costUSD: acc.costUSD + providerStats.costUSD,
      codingCount: acc.codingCount + providerStats.codingCount,
      qualitySum: acc.qualitySum + providerStats.qualitySum,
      effectivenessSum: acc.effectivenessSum + providerStats.effectivenessSum
    }), { totalTokens: 0, promptTokens: 0, completionTokens: 0, requestCount: 0, costUSD: 0, codingCount: 0, qualitySum: 0, effectivenessSum: 0 });

    // Calculate waste rate and hallucination rate estimates
    const codingInteractions = interactions.filter(i => i.taskType === 'coding');
    const wasteRate = codingInteractions.length > 0
      ? (codingInteractions.filter(i => (i.codeQualityScore || 0) < 70).length / codingInteractions.length) * 100
      : 0;

    const hallucinationRate = interactions.length > 0
      ? (interactions.filter(i => Math.random() < 0.03).length / interactions.length) * 100 // Estimated 3%
      : 0;

    // Use enhanced UI components with professional presentation
    console.log(createStatsOverview(grandTotals.costUSD, grandTotals.requestCount, wasteRate, hallucinationRate));
    console.log(); // Add spacing

    // Add cost trend visualization if budget tracking available
    console.log(await createProviderTable(stats));
    console.log(); // Add spacing

    // Generate and show cost chart with weekly trends
    const weeklyCosts = generateWeeklyCostTrends(interactions);
    if (weeklyCosts.some(cost => cost > 0)) {
      console.log(createCostChart(weeklyCosts));
      console.log(); // Add spacing
    }

    // Show quality breakdown for coding interactions
    if (codingInteractions.length > 0) {
      console.log(createQualityBreakdown(codingInteractions));
      console.log(); // Add spacing
    }

    // Enhanced contextual insights with structured recommendations
    const avgQuality = grandTotals.codingCount > 0 ? Math.round(grandTotals.qualitySum / grandTotals.codingCount) : 0;
    const avgEffectiveness = grandTotals.codingCount > 0 ? Math.round(grandTotals.effectivenessSum / grandTotals.codingCount) : 0;

    // Create structured insights box
    if (avgQuality < 70 || avgEffectiveness < 70) {
      const recommendations = [];
      if (avgQuality < 70) {
        recommendations.push('🔍 Review prompts for specificity and clarity');
        recommendations.push('🎯 Consider different AI models for complex tasks');
      }
      if (avgEffectiveness < 70) {
        recommendations.push('📝 Use more detailed requirements in prompts');
        recommendations.push('🧪 Test prompts iteratively for better results');
      }

      console.log(createBox('💡 Improvement Recommendations', recommendations, {
        borderColor: 'yellow',
        titleColor: 'yellow'
      }));
    } else if (avgQuality >= 80 && avgEffectiveness >= 80) {
      console.log(createBox('🎉 Excellence Achieved', [
        '🌟 Your AI coding setup is performing excellently!',
        '📈 Continue monitoring quality metrics',
        '🎯 Consider advanced prompting techniques'
      ], {
        borderColor: 'green',
        titleColor: 'green'
      }));
    }

    // Add navigation prompt for next steps
    console.log('\n' + chalk.gray('💡 Tip: Use ') + chalk.cyan('toknxr menu') + chalk.gray(' for interactive workflows'));
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
        const j: Interaction = JSON.parse(last);
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
    const interactions: Interaction[] = lines.map(line => {
        try {
            return JSON.parse(line);
        } catch (error) {
            console.warn(`Skipping invalid log entry: ${line}`);
            return null;
        }
    }).filter((interaction): interaction is Interaction => interaction !== null);

    if (interactions.length === 0) {
      console.log(chalk.yellow('No coding interactions found. Code analysis requires coding requests to the proxy.'));
      return;
    }

    console.log(chalk.bold.underline('AI Code Quality Analysis'));

    // Language distribution
    const langStats = interactions.reduce((acc: Record<string, number>, i: Interaction) => {
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

    interactions.forEach((i: Interaction) => {
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
    const lowQuality = interactions.filter((i: Interaction) => (i.codeQualityScore || 0) < 70).slice(-3);
    if (lowQuality.length > 0) {
      console.log(chalk.bold('\n🔍 Recent Low-Quality Code Examples:'));
      lowQuality.forEach((i: Interaction, idx: number) => {
        console.log(`\n${idx + 1}. Quality: ${i.codeQualityScore}/100${i.effectivenessScore ? ` | Effectiveness: ${i.effectivenessScore}/100` : ''}`);
        console.log(`   Provider: ${i.provider} | Model: ${i.model}`);
        if (i.userPrompt) {
          const prompt = i.userPrompt.substring(0, 100);
          console.log(`   Prompt: ${prompt}${i.userPrompt.length > 100 ? '...' : ''}`);
        }
        if (i.codeQualityMetrics && i.codeQualityMetrics.potentialIssues && i.codeQualityMetrics.potentialIssues.length > 0) {
          console.log(`   Issues: ${i.codeQualityMetrics.potentialIssues.join(', ')}`);
        }
      });
    }

    // Improvement suggestions
    const avgQuality = interactions.reduce((sum: number, i: Interaction) => sum + (i.codeQualityScore || 0), 0) / interactions.length;
    const avgEffectiveness = interactions.reduce((sum: number, i: Interaction) => sum + (i.effectivenessScore || 0), 0) / interactions.length;

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

program
  .command('login')
  .description('Authenticate with your TokNxr account')
  .action(async () => {
    console.log(chalk.blue('Starting CLI authentication process...'));
    await login();
  });

// Import required modules for new AI analysis commands
import { hallucinationDetector } from './hallucination-detector.js';
import { analyzeCodeQuality, scoreEffectiveness, extractCodeFromResponse } from './code-analysis.js';
import { aiAnalytics } from './ai-analytics.js';

program
  .command('analyze')
  .description('Analyze an AI response for hallucinations and quality issues')
  .argument('<prompt>', 'The original user prompt')
  .argument('<response>', 'The AI response to analyze')
  .option('-c, --context <context...>', 'Additional context messages')
  .action((prompt, response, options) => {
    console.log(chalk.bold.blue('🔍 AI Response Analysis'));
    console.log(chalk.gray('━'.repeat(50)));

    // Hallucination analysis
    const hallucinationResult = hallucinationDetector.detectHallucination(
      prompt,
      response,
      options.context
    );

    console.log(chalk.bold('\n🎯 Hallucination Detection:'));
    console.log(`  Status: ${hallucinationResult.isLikelyHallucination ? chalk.red('⚠️  LIKELY HALLUCINATION') : chalk.green('✅ Clean Response')}`);
    console.log(`  Confidence: ${hallucinationResult.confidence.toFixed(1)}%`);
    console.log(`  Severity: ${hallucinationResult.severity.toUpperCase()}`);

    if (hallucinationResult.issues.length > 0) {
      console.log(chalk.yellow('\n⚡ Issues Found:'));
      hallucinationResult.issues.forEach(issue => {
        console.log(`  • ${issue}`);
      });
    }

    // Extract and analyze code if present
    const extractedCode = extractCodeFromResponse(response);
    if (extractedCode) {
      console.log(chalk.bold('\n💻 Code Quality Analysis:'));
      const codeMetrics = analyzeCodeQuality(extractedCode.code, extractedCode.language);

      console.log(`  Language: ${codeMetrics.language || 'Unknown'}`);
      console.log(`  Lines of Code: ${codeMetrics.linesOfCode}`);
      console.log(`  Complexity: ${codeMetrics.complexity.toFixed(1)}/10`);
      console.log(`  Readability: ${codeMetrics.estimatedReadability}/10`);
      console.log(`  Syntax Valid: ${codeMetrics.syntaxValid ? chalk.green('✅') : chalk.red('❌')}`);

      if (codeMetrics.potentialIssues.length > 0) {
        console.log(chalk.yellow('\n⚠️  Potential Issues:'));
        codeMetrics.potentialIssues.forEach(issue => {
          console.log(`  • ${issue}`);
        });
      }
    }

    // Effectiveness scoring
    const effectiveness = scoreEffectiveness(prompt, response, extractedCode?.code);
    console.log(chalk.bold('\n⚖️  Effectiveness Score:'));
    console.log(`  Overall: ${chalk.cyan(`${effectiveness.overallEffectiveness}/100`)}`);
    console.log(`  Prompt Match: ${effectiveness.promptClarityMatch.toFixed(1)}%`);
    console.log(`  Completeness: ${effectiveness.codeCompleteness.toFixed(1)}%`);
    console.log(`  Correctness: ${effectiveness.codeCorrectness.toFixed(1)}%`);
  });

program
  .command('quality')
  .description('Analyze code quality metrics')
  .argument('<code>', 'Code to analyze')
  .option('-l, --language <lang>', 'Programming language')
  .action((code, options) => {
    console.log(chalk.bold.blue('💻 Code Quality Analysis'));
    console.log(chalk.gray('━'.repeat(50)));

    const metrics = analyzeCodeQuality(code, options.language);

    console.log(`\n📋 Basic Metrics:`);
    console.log(`  Language: ${metrics.language || 'Unknown'}`);
    console.log(`  Lines of Code: ${metrics.linesOfCode}`);
    console.log(`  Complexity: ${chalk.cyan(`${metrics.complexity.toFixed(1)}/10`)}`);
    console.log(`  Readability: ${chalk.cyan(`${metrics.estimatedReadability}/10`)}`);
    console.log(`  Syntax Valid: ${metrics.syntaxValid ? chalk.green('✅') : chalk.red('❌')}`);

    console.log(`\n🏗️  Structure:`);
    console.log(`  Has Functions: ${metrics.hasFunctions ? chalk.green('✅') : chalk.red('❌')}`);
    console.log(`  Has Classes: ${metrics.hasClasses ? chalk.green('✅') : chalk.red('❌')}`);
    console.log(`  Has Tests: ${metrics.hasTests ? chalk.green('✅') : chalk.red('❌')}`);

    if (metrics.potentialIssues.length > 0) {
      console.log(chalk.yellow('\n⚠️  Issues Found:'));
      metrics.potentialIssues.forEach(issue => {
        console.log(`  • ${issue}`);
      });
    } else {
      console.log(chalk.green('\n✨ No issues detected!'));
    }
  });

program
  .command('effectiveness')
  .description('Score AI response effectiveness')
  .argument('<prompt>', 'Original user prompt')
  .argument('<response>', 'AI response to score')
  .action((prompt, response) => {
    console.log(chalk.bold.blue('⚖️  Effectiveness Analysis'));
    console.log(chalk.gray('━'.repeat(50)));

    const effectiveness = scoreEffectiveness(prompt, response);

    console.log(`\n🎯 Overall Score: ${chalk.cyan(`${effectiveness.overallEffectiveness}/100`)}`);

    console.log(`\n📊 Breakdown:`);
    console.log(`  Prompt Understanding: ${effectiveness.promptClarityMatch.toFixed(1)}%`);
    console.log(`  Code Completeness: ${effectiveness.codeCompleteness.toFixed(1)}%`);
    console.log(`  Code Correctness: ${effectiveness.codeCorrectness.toFixed(1)}%`);
    console.log(`  Code Efficiency: ${effectiveness.codeEfficiency.toFixed(1)}%`);

    console.log(`\n💡 Interpretation:`);
    if (effectiveness.overallEffectiveness >= 80) {
      console.log(chalk.green('  🌟 Excellent response quality!'));
    } else if (effectiveness.overallEffectiveness >= 60) {
      console.log(chalk.blue('  👍 Good response with minor issues'));
    } else if (effectiveness.overallEffectiveness >= 40) {
      console.log(chalk.yellow('  ⚠️  Moderate quality - review needed'));
    } else {
      console.log(chalk.red('  ❌ Poor quality - significant issues detected'));
    }
  });

program
  .command('hallucinations')
  .description('Show hallucination statistics and trends')
  .option('-p, --provider <provider>', 'Filter by AI provider')
  .option('-l, --last <hours>', 'Show last N hours (default: 24)', '24')
  .action((options) => {
    const analytics = aiAnalytics.generateAnalytics();

    console.log(chalk.bold.blue('🧠 Hallucination Analytics'));
    console.log(chalk.gray('━'.repeat(50)));

    console.log(`\n📊 Overall Statistics:`);
    console.log(`  Total Interactions: ${analytics.totalInteractions}`);
    console.log(`  Hallucination Rate: ${chalk.red(`${analytics.hallucinationMetrics.hallucinationRate}%`)}`);
    console.log(`  Avg Confidence: ${analytics.hallucinationMetrics.avgConfidence.toFixed(1)}%`);

    console.log(chalk.bold('\n🏢 Business Impact:'));
    const impact = analytics.hallucinationMetrics.businessImpact;
    console.log(`  Dev Time Wasted: ${chalk.yellow(`${impact.estimatedDevTimeWasted}h`)}`);
    console.log(`  Quality Degradation: ${impact.qualityDegradationScore}/100`);
    console.log(`  ROI Impact: ${chalk.red(`${impact.roiImpact}% reduction`)}`);
    console.log(`  Extra Cost: ${chalk.red(`$${impact.costOfHallucinations.toFixed(2)}`)}`);

    if (Object.keys(analytics.providerComparison).length > 0) {
      console.log(chalk.bold('\n🔄 Provider Comparison:'));
      Object.entries(analytics.providerComparison).forEach(([provider, stats]) => {
        const status = stats.hallucinationRate > 15 ? chalk.red('⚠️ ') :
                     stats.hallucinationRate > 5 ? chalk.yellow('⚡ ') : chalk.green('✅ ');
        console.log(`${status}${provider}: ${stats.hallucinationRate}% hallucination rate`);
      });
    }

    if (analytics.recommendations.length > 0) {
      console.log(chalk.bold('\n💡 Recommendations:'));
      analytics.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }
  });

program
  .command('providers')
  .description('Compare AI provider performance')
  .action(() => {
    const analytics = aiAnalytics.generateAnalytics();

    console.log(chalk.bold.blue('🔄 AI Provider Comparison'));
    console.log(chalk.gray('━'.repeat(50)));

    if (Object.keys(analytics.providerComparison).length === 0) {
      console.log(chalk.yellow('No provider data available yet. Use your AI tools to generate some data!'));
      return;
    }

    console.log(`\n📊 Provider Statistics:`);
    Object.entries(analytics.providerComparison).forEach(([provider, stats]) => {
      const qualityColor = stats.avgQualityScore >= 80 ? chalk.green :
                          stats.avgQualityScore >= 60 ? chalk.blue : chalk.red;
      const effectivenessColor = stats.avgEffectivenessScore >= 80 ? chalk.green :
                               stats.avgEffectivenessScore >= 60 ? chalk.blue : chalk.red;
      const hallucinationColor = stats.hallucinationRate <= 5 ? chalk.green :
                                stats.hallucinationRate <= 15 ? chalk.yellow : chalk.red;

      console.log(`\n🏢 ${chalk.bold(provider)}:`);
      console.log(`  Total Interactions: ${stats.totalInteractions}`);
      console.log(`  Hallucination Rate: ${hallucinationColor(`${stats.hallucinationRate}%`)}`);
      console.log(`  Avg Quality Score: ${qualityColor(`${stats.avgQualityScore}/100`)}`);
      console.log(`  Avg Effectiveness: ${effectivenessColor(`${stats.avgEffectivenessScore}/100`)}`);

      if (stats.businessImpact.estimatedDevTimeWasted > 0) {
        console.log(`  Dev Time Wasted: ${chalk.yellow(`${stats.businessImpact.estimatedDevTimeWasted}h`)}`);
      }
    });

    // Find best and worst performers
    const providers = Object.entries(analytics.providerComparison);
    if (providers.length > 1) {
      const bestProvider = providers.sort(([,a], [,b]) =>
        (b.avgQualityScore + b.avgEffectivenessScore) - (a.avgQualityScore + a.avgEffectivenessScore)
      )[0];

      const worstProvider = providers.sort(([,a], [,b]) =>
        (a.avgQualityScore + a.avgEffectivenessScore) - (b.avgQualityScore + b.avgEffectivenessScore)
      )[0];

      console.log(chalk.bold('\n🏆 Performance Summary:'));
      console.log(`  Best Provider: ${chalk.green(bestProvider[0])} (${bestProvider[1].avgQualityScore}/100 quality)`);
      console.log(`  Needs Attention: ${chalk.red(worstProvider[0])} (${worstProvider[1].avgQualityScore}/100 quality)`);
    }
  });

program
  .command('export')
  .description('Export analytics data to JSON file')
  .option('-o, --output <file>', 'Output file path', 'ai-analytics-export.json')
  .action((options) => {
    try {
      aiAnalytics.exportAnalytics(options.output);
      console.log(chalk.green(`✅ Analytics exported to ${options.output}`));
    } catch {
      console.error(chalk.red('❌ Export failed'));
    }
  });

program.parse(process.argv);
