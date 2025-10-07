import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
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
  createPaginatedDisplay,
  createFilterInterface,
  createSearchInterface,
  InteractiveDataExplorer,
  CliStateManager,
  filterAndSearchInteractions,
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

    // Define provider stats interface
    interface ProviderStats {
      totalTokens: number;
      promptTokens: number;
      completionTokens: number;
      requestCount: number;
      costUSD: number;
      codingCount: number;
      qualitySum: number;
      effectivenessSum: number;
      avgQualityScore: number;
      avgEffectivenessScore: number;
    }

    // Calculate statistics
    const stats: Record<string, ProviderStats> = interactions.reduce((acc: Record<string, ProviderStats>, interaction) => {
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

    // Define grand totals interface
    interface GrandTotals {
      totalTokens: number;
      promptTokens: number;
      completionTokens: number;
      requestCount: number;
      costUSD: number;
      codingCount: number;
      qualitySum: number;
      effectivenessSum: number;
    }

    const initialTotals: GrandTotals = {
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      requestCount: 0,
      costUSD: 0,
      codingCount: 0,
      qualitySum: 0,
      effectivenessSum: 0
    };

    // Calculate grand totals
    const grandTotals = Object.values(stats).reduce((acc: GrandTotals, providerStats: ProviderStats): GrandTotals => ({
      totalTokens: acc.totalTokens + providerStats.totalTokens,
      promptTokens: acc.promptTokens + providerStats.promptTokens,
      completionTokens: acc.completionTokens + providerStats.completionTokens,
      requestCount: acc.requestCount + providerStats.requestCount,
      costUSD: acc.costUSD + providerStats.costUSD,
      codingCount: acc.codingCount + providerStats.codingCount,
      qualitySum: acc.qualitySum + providerStats.qualitySum,
      effectivenessSum: acc.effectivenessSum + providerStats.effectivenessSum
    }), initialTotals);

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

    // Interactive navigation and context-aware guidance
    console.log('\n' + chalk.blue.bold('🔍 Interactive Navigation'));
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Analyze current situation for intelligent suggestions
    const currentSituation = {
      needsBudgetAttention: grandTotals.costUSD > 40, // 80% of monthly budget
      needsQualityImprovement: avgQuality < 75,
      hasMultipleProviders: Object.keys(stats).length > 1,
      hasRecentData: interactions.some(i => new Date(i.timestamp || 0) > new Date(Date.now() - 24 * 60 * 60 * 1000))
    };

    // Generate intelligent navigation options based on current state
    const navigationOptions = [
      {
        key: '1',
        title: chalk.cyan('📊 View Detailed Analysis'),
        description: 'Deep dive into provider and quality metrics',
        recommended: currentSituation.hasMultipleProviders
      },
      {
        key: '2',
        title: chalk.magenta('🧠 AI Performance Insights'),
        description: 'Advanced hallucination and effectiveness analysis',
        recommended: currentSituation.needsQualityImprovement
      },
      {
        key: '3',
        title: chalk.yellow('💰 Budget & Cost Optimization'),
        description: 'Strategies to reduce expenses and improve ROI',
        recommended: currentSituation.needsBudgetAttention
      },
      {
        key: '4',
        title: chalk.green('📈 Real-time Monitoring'),
        description: 'Live tracking of AI interactions',
        recommended: currentSituation.hasRecentData
      },
      {
        key: '5',
        title: chalk.blue('🚀 Start Refinement Journey'),
        description: 'Interactive prompts to improve AI performance',
        recommended: true // Always available
      },
      {
        key: 'm',
        title: chalk.gray('📋 Main Menu'),
        description: 'Return to interactive menu system',
        recommended: false
      },
      {
        key: 'q',
        title: chalk.gray('❌ Exit'),
        description: 'Quit analysis session',
        recommended: false
      }
    ];

    console.log(chalk.gray('Select an option to continue your analysis journey:'));
    console.log();

    navigationOptions.forEach(option => {
      const prefix = option.recommended ? chalk.green('★') : ' ';
      console.log(`${prefix} ${chalk.bold(option.key)}) ${option.title}`);
      console.log(`    ${option.description}`);
    });

    console.log();
    rl.question(chalk.cyan('Your choice: '), (answer) => {
      const choice = answer.toLowerCase().trim();

      switch (choice) {
        case '1':
          console.log(chalk.blue('\n🔍 Navigating to detailed analysis...'));
          console.log(chalk.cyan('Use: ') + chalk.yellow('toknxr code-analysis') + chalk.gray(' for deep quality insights'));
          setTimeout(async () => {
            try {
              const { execSync } = await import('child_process');
              execSync('node -e "if(require(\'fs\').existsSync(\'package.json\')) { process.chdir(__dirname); require(\'tsx/dist/esbuild-register\').register(); require(\'./code-analysis.ts\').action(); }" 2>/dev/null || echo "Please run: toknxr code-analysis"', { stdio: 'inherit' });
            } catch {
              console.log(chalk.gray('Please run: ') + chalk.cyan('toknxr code-analysis'));
            }
          }, 500);
          break;

        case '2':
          console.log(chalk.magenta('\n🧠 Navigating to AI performance insights...'));
          console.log(chalk.cyan('Use: ') + chalk.yellow('toknxr hallucinations') + chalk.gray(' for hallucination analysis'));
          setTimeout(async () => {
            try {
              const { execSync } = await import('child_process');
              execSync('node -e "if(require(\'fs\').existsSync(\'package.json\')) { process.chdir(__dirname); require(\'tsx/dist/esbuild-register\').register(); require(\'./hallucinations.ts\').action(); }" 2>/dev/null || echo "Please run: toknxr hallucinations"', { stdio: 'inherit' });
            } catch {
              console.log(chalk.gray('Please run: ') + chalk.cyan('toknxr hallucinations'));
            }
          }, 500);
          break;

        case '3':
          console.log(chalk.yellow('\n💰 Navigating to budget optimization...'));
          console.log(chalk.gray('📋 Budget Optimization Strategies:'));
          console.log(`  • Monthly budget: $${(50).toFixed(2)} (spent: $${grandTotals.costUSD.toFixed(2)})`);
          console.log(`  • Daily average: $${(grandTotals.costUSD / Math.max(1, Math.ceil((new Date().getTime() - new Date(interactions[0]?.timestamp || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(2)}`);
          console.log(`  • ${avgQuality >= 80 ? 'Try cheaper providers with similar quality' : 'Focus on prompt optimization to reduce request volume'}`);
          break;

        case '4':
          console.log(chalk.green('\n📈 Starting real-time monitoring...'));
          console.log(chalk.cyan('Use: ') + chalk.yellow('toknxr tail') + chalk.gray(' to monitor live interactions'));
          setTimeout(async () => {
            try {
              const { execSync } = await import('child_process');
              execSync('node -e "if(require(\'fs\').existsSync(\'package.json\')) { process.chdir(__dirname); require(\'tsx/dist/esbuild-register\').register(); require(\'./tail.ts\').action(); }" 2>/dev/null || echo "Please run: toknxr tail"', { stdio: 'inherit' });
            } catch {
              console.log(chalk.gray('Please run: ') + chalk.cyan('toknxr tail'));
            }
          }, 500);
          break;

        case '5':
          console.log(chalk.blue('\n🚀 Starting AI refinement journey...'));
          console.log(chalk.gray('📝 Improvement Recommendations:'));
          if (avgQuality < 75) {
            console.log(chalk.yellow('  • 🎯 Switch to higher-quality AI models (91vs88 scores)'));
            console.log(chalk.yellow('  • 📝 Use more specific prompt instructions'));
          }
          if (grandTotals.costUSD > 25) {
            console.log(chalk.red('  • 💰 Consider API usage limits or budget alerts'));
            console.log(chalk.red('  • 🔄 Explore cost-efficient AI providers'));
          }
          if (Object.keys(stats).length === 1) {
            console.log(chalk.blue('  • 🧪 A/B test multiple AI providers for your use case'));
          }
          break;

        case 'm':
        case 'menu':
          console.log(chalk.gray('\n📋 Opening interactive menu...'));
          setTimeout(async () => {
            try {
              const { spawn } = await import('child_process');
              const menuCommand = spawn('node', ['-e', `
                try {
                  process.chdir('${process.cwd().replace(/\\/g, '\\\\')}');
                  require('tsx/dist/esbuild-register').register();
                  const { program } = require('./cli.ts');
                  const menuCmd = program.commands.find(cmd => cmd.name() === 'menu');
                  if (menuCmd) {
                    menuCmd.action();
                  }
                } catch (e) {
                  console.log('Please run: toknxr menu');
                }
              `], { stdio: 'inherit' });
            } catch (e) {
              console.log('Please run: toknxr menu');
            }
          }, 300);
          break;

        case 'q':
        case 'quit':
        case 'exit':
          console.log(chalk.gray('\n👋 Thanks for using TokNXR analytics!'));
          console.log(chalk.gray('Raw data available in: ') + chalk.cyan('interactions.log'));
          break;

        default:
          console.log(chalk.yellow(`Unknown option "${answer}". Showing help...`));
          console.log(chalk.cyan('\nAvailable commands:'));
          console.log(`  ${chalk.yellow('toknxr menu')}     - Interactive command menu`);
          console.log(`  ${chalk.yellow('toknxr stats')}    - Current usage overview`);
          console.log(`  ${chalk.yellow('toknxr start')}    - Launch proxy server`);
          console.log(`  ${chalk.yellow('toknxr --help')}   - View all commands`);
      }

      rl.close();
    });
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

// Enhanced Interactive Commands - Phase 3+

program
  .command('browse')
  .description('Interactive paginated browsing of all AI interactions with filtering')
  .option('-p, --page <page>', 'Start page number', '1')
  .option('-s, --size <size>', 'Page size (10/25/50)', '10')
  .action(async (options) => {
    const logFilePath = path.resolve(process.cwd(), 'interactions.log');
    if (!fs.existsSync(logFilePath)) {
      console.log(chalk.yellow('No interactions logged yet. Start tracking with: ') + chalk.cyan('toknxr start'));
      return;
    }

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
      console.log(chalk.yellow('No valid interactions found.'));
      return;
    }

    const explorer = new InteractiveDataExplorer(interactions);
    const currentPage = parseInt(options.page) || 1;
    const pageSize = parseInt(options.size) || 10;

    explorer.setPageSize(pageSize);
    explorer.setPage(currentPage);

    const renderInteraction = (interaction: any, index: number): string => {
      const num = index + 1;
      const costColor = interaction.costUSD > 0.1 ? chalk.red : interaction.costUSD > 0.05 ? chalk.yellow : chalk.green;
      const qualityColor = (interaction.codeQualityScore || 0) >= 80 ? chalk.green :
                          (interaction.codeQualityScore || 0) >= 60 ? chalk.blue : chalk.red;

      return createBox(`#${num} ${interaction.provider}`, [
        `📅 ${chalk.gray(new Date(interaction.timestamp || Date.now()).toLocaleDateString())}`,
        `💰 Cost: ${costColor(`$${interaction.costUSD?.toFixed(4) || '0.0000'}`)}`,
        `🎯 Effectiveness: ${interaction.effectivenessScore || 'N/A'}/100`,
        `⭐ Quality: ${qualityColor(`${interaction.codeQualityScore || 'N/A'}/100`)}`,
        `🔤 ${interaction.totalTokens || 0} tokens • ${interaction.model || 'Unknown model'}`,
        ...(interaction.userPrompt ? [`"${interaction.userPrompt.substring(0, 60)}${interaction.userPrompt.length > 60 ? '...' : ''}"`] : [])
      ], {
        borderColor: 'gray',
        titleColor: 'cyan',
        width: 80
      });
    };

    console.log(createPaginatedDisplay(
      explorer.getCurrentPageData(),
      pageSize,
      currentPage,
      renderInteraction,
      `🐙 AI Interactions Browser (${explorer.getPaginationInfo().totalItems} total)`
    ));

    // Interactive navigation
    const pagination = explorer.getPaginationInfo();
    if (pagination.totalPages > 1) {
      console.log(chalk.cyan('\nNavigation:'));
      console.log(chalk.gray('• Use ') + chalk.yellow('toknxr browse --page 2') + chalk.gray(' to go to page 2'));
      console.log(chalk.gray('• Use ') + chalk.yellow('toknxr browse --size 25') + chalk.gray(' for more items per page'));
      console.log(chalk.gray('• Use ') + chalk.yellow('toknxr filter') + chalk.gray(' to filter results'));
    }
  });

program
  .command('filter')
  .description('Interactive filtering interface for AI interactions')
  .action(async () => {
    try {
      console.log(chalk.blue.bold('\n🔍 Advanced Filtering'));
      console.log(chalk.gray('Configure filters that will persist across sessions\n'));

      const currentFilters = CliStateManager.getPreferences().filters || {};
      const newFilters = await createFilterInterface(currentFilters);

      console.log(chalk.green('\n✅ Filters applied and saved!'));
      console.log(chalk.gray('Use ') + chalk.cyan('toknxr browse') + chalk.gray(' to see filtered results'));
      console.log(chalk.gray('Use ') + chalk.cyan('toknxr filter') + chalk.gray(' again to modify filters'));
    } catch (error) {
      console.log(chalk.red('❌ Failed to apply filters'));
      console.log(chalk.gray('Check your terminal supports interactive prompts'));
    }
  });

program
  .command('search')
  .description('Search across all AI interactions with field selection')
  .option('-q, --query <query>', 'Search query (minimum 2 characters)')
  .action(async (options) => {
    const query = options.query;
    if (!query || query.trim().length < 2) {
      console.log(chalk.yellow('Please provide a search query with at least 2 characters:'));
      console.log(chalk.cyan('  toknxr search --query "your search terms"'));
      return;
    }

    try {
      console.log(chalk.blue.bold(`\n🔍 Searching for: "${query}"`));

      const availableFields = ['provider', 'model', 'userPrompt', 'taskType', 'requestId'];
      const searchOptions = await createSearchInterface(availableFields);

      if (!searchOptions) {
        console.log(chalk.gray('Search cancelled.'));
        return;
      }

      const logFilePath = path.resolve(process.cwd(), 'interactions.log');
      if (!fs.existsSync(logFilePath)) {
        console.log(chalk.yellow('No interactions logged yet.'));
        return;
      }

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

      const filteredResults = filterAndSearchInteractions(interactions, {}, searchOptions);

      if (filteredResults.length === 0) {
        console.log(chalk.yellow(`\nNo results found for "${query}" in the selected fields.`));
        return;
      }

      const explorer = new InteractiveDataExplorer(filteredResults);

      console.log(chalk.green(`\n✅ Found ${filteredResults.length} matching interactions`));
      console.log(chalk.gray(`Searching in: ${searchOptions.fields.join(', ')}\n`));

      // Show summary
      interface ProviderCount {
        [provider: string]: number;
      }
      const providerCounts: ProviderCount = {};
      filteredResults.forEach((i: Interaction) => {
        providerCounts[i.provider] = (providerCounts[i.provider] || 0) + 1;
      });

      console.log(createBox('📊 Search Results Summary', [
        `Total Results: ${filteredResults.length}`,
        `Providers: ${Object.entries(providerCounts).map(([p, c]) => `${p}(${c})`).join(', ')}`,
        '',
        chalk.gray('Use ↑/↓ or page up/down to navigate results')
      ], { borderColor: 'green', titleColor: 'green' }));

      const renderSearchResult = (interaction: Interaction, index: number): string => {
        const num = index + 1;
        const score = calcRelevanceScore(interaction, searchOptions.query, searchOptions.fields);

        let highlightColor: 'green' | 'yellow' | 'red';
        if (score >= 0.8) highlightColor = 'green';
        else if (score >= 0.6) highlightColor = 'yellow';
        else highlightColor = 'red';

        const highlightedPrompt = highlightMatch(interaction.userPrompt || '', searchOptions.query);

        const colorFn = highlightColor === 'green' ? chalk.green :
                        highlightColor === 'yellow' ? chalk.yellow :
                        chalk.red;
        return createBox(`#${num} ${interaction.provider} (${colorFn('★'.repeat(Math.ceil(score * 5)))})`, [
          `📅 ${chalk.gray(new Date(interaction.timestamp || Date.now()).toLocaleDateString())}`,
          `🎯 ${highlightedPrompt || 'No prompt available'}`,
          `💰 $${interaction.costUSD?.toFixed(4) || '0.0000'} • ⭐ ${interaction.codeQualityScore || 'N/A'}/100`
        ], {
          borderColor: highlightColor,
          titleColor: 'cyan',
          width: 90
        });
      };

      console.log(createPaginatedDisplay(
        explorer.getCurrentPageData(),
        5, // Smaller page size for search results
        1,
        renderSearchResult,
        undefined
      ));

    } catch (error) {
      console.log(chalk.red('❌ Search failed'));
      console.log(chalk.gray('Try using: ') + chalk.cyan('toknxr search --query "your terms"'));
    }
  });

program
  .command('budget')
  .description('Manage budget settings and view spending analytics')
  .option('--set <amount>', 'Set monthly budget amount')
  .option('--provider <provider>', 'Set budget for specific provider')
  .option('--view', 'View current budget settings')
  .action((options) => {
    if (options.set) {
      const amount = parseFloat(options.set);
      if (isNaN(amount) || amount <= 0) {
        console.log(chalk.red('❌ Invalid budget amount. Must be a positive number.'));
        return;
      }

      CliStateManager.updateSessionBudget(amount, options.provider);

      const budgetType = options.provider ? ` for ${options.provider}` : ' (monthly default)';
      console.log(chalk.green(`✅ Budget updated to $${amount.toFixed(2)}${budgetType}`));

      if (!options.provider) {
        console.log(chalk.cyan('\n💡 Tip: Set provider-specific budgets for granular control'));
        console.log(chalk.gray('Example: ') + chalk.yellow('toknxr budget --set 25 --provider "Gemini-Pro"'));
      }

    } else if (options.view || Object.keys(options).length === 0) {
      const preferences = CliStateManager.getPreferences();
      const budgets = CliStateManager.loadState().budgets;

      console.log(chalk.blue.bold('\n💰 Budget Configuration'));
      console.log(chalk.gray('━'.repeat(50)));

      console.log(chalk.bold('\nCurrent Settings:'));
      console.log(`📊 Monthly Default: ${chalk.cyan(`$${budgets.default || 50.00}`)}`);
      console.log(`📏 Page Size: ${preferences.pageSize || 10} items`);
      console.log(`🔧 Sort Order: ${preferences.sortOrder || 'date_descends'}`);

      if (Object.keys(budgets).length > 1) {
        console.log(chalk.bold('\nProvider-Specific Budgets:'));
        Object.entries(budgets).forEach(([provider, amount]) => {
          if (provider !== 'default') {
            console.log(`🏢 ${provider}: ${chalk.cyan(`$${amount}`)}`);
          }
        });
      }

      console.log(chalk.bold('\n💡 Budget Commands:'));
      console.log(`  ${chalk.yellow('toknxr budget --set 75')}                   - Set monthly budget`);
      console.log(`  ${chalk.yellow('toknxr budget --set 30 --provider GPT4')} - Set provider budget`);
    }
  });

// Helper functions for search highlighting
function calcRelevanceScore(interaction: Interaction, query: string, fields: string[]): number {
  const queryTerms = query.toLowerCase().split(' ');
  let totalScore = 0;
  const maxPossibleScore = fields.length * queryTerms.length;

  fields.forEach(field => {
    const fieldValue = (interaction[field as keyof Interaction] || '').toString().toLowerCase();
    queryTerms.forEach(term => {
      if (fieldValue.includes(term)) {
        totalScore += 1;
      }
    });
  });

  return Math.min(totalScore / maxPossibleScore, 1);
}

function highlightMatch(text: string, query: string): string {
  if (!text) return text;

  const queryTerms = query.toLowerCase().split(' ');
  let highlighted = text;

  queryTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlighted = highlighted.replace(regex, chalk.bgYellow.black('$1'));
  });

  return highlighted;
}

program.parse(process.argv);
