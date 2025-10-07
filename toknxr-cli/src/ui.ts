/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from 'chalk';
import boxen from 'boxen';
import ora, { type Ora } from 'ora';


// Enhanced UI Components for Series A CLI Experience

export interface UiOptions {
  theme?: 'default' | 'minimal' | 'bold';
  width?: number;
  interactive?: boolean;
}

/**
 * Creates a colorful progress bar with provider-specific styling
 */
export function createCostProgressBar(totalCost: number, monthlyBudget: number): string {
  const percentage = Math.min((totalCost / monthlyBudget) * 100, 100);
  const barLength = 30;
  const filledBars = Math.round((percentage / 100) * barLength);
  const emptyBars = barLength - filledBars;

  const status = percentage >= 95 ? chalk.red
                 : percentage >= 75 ? chalk.yellow
                 : chalk.green;

  const filled = '█'.repeat(filledBars);
  const empty = '░'.repeat(emptyBars);

  return `${status(filled)}${chalk.gray(empty)} ${percentage.toFixed(0)}%`;
}

/**
 * Creates a boxed section with title and content
 */
export function createBox(title: string, content: string | string[], options: any = {}): string {
  const opts = {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    titleColor: 'cyan',
    ...options
  };

  const contentArray = Array.isArray(content) ? content : [content];
  return boxen(contentArray.join('\n'), {
    ...opts,
    title,
    titleAlignment: 'left'
  });
}

/**
 * Creates a formatted stats overview with progress visualization
 */
export function createStatsOverview(
  totalCost: number,
  totalRequests: number,
  wasteRate: number,
  hallucinationRate?: number
): string {
  const costFormatted = totalCost.toFixed(4);
  const budget = 50.00; // Default monthly budget
  const remaining = Math.max(0, budget - totalCost);

  let status = chalk.green;
  let statusText = 'UNDER BUDGET';

  if (totalCost >= budget * 0.95) {
    status = chalk.red;
    statusText = 'NEAR LIMIT';
  } else if (totalCost >= budget * 0.75) {
    status = chalk.yellow;
    statusText = 'APPROACHING';
  }

  const wasteIcon = wasteRate > 10 ? '🟡' : '🟢';
  const hallucinationIcon = hallucinationRate && hallucinationRate > 5 ? '🟠' : '🟢';

  return createBox('📊 Usage Overview', [
    `💰 Total Cost: $${costFormatted} (${status(`${statusText}`)})`,
    `📊 Requests: ${totalRequests} this month`,
    `${wasteIcon} Waste Rate: ${wasteRate.toFixed(1)}%`,
    ...(hallucinationRate ? [`${hallucinationIcon} Hallucination Rate: ${hallucinationRate.toFixed(1)}%`] : []),
    `🎯 Budget Remaining: $${remaining.toFixed(2)}`
  ], {
    borderColor: totalCost >= budget * 0.9 ? 'red' : 'green',
    titleColor: 'blue'
  });
}

/**
 * Creates a provider comparison table with visual indicators
 */
export async function createProviderTable(providerStats: Record<string, any>): Promise<string> {
  const Table = (await import('cli-table3')).default;

  const table = new Table({
    head: [
      chalk.bold('🏢 Provider'),
      chalk.bold('💰 Cost'),
      chalk.bold('📊 Requests'),
      chalk.bold('⭐ Quality'),
      chalk.bold('🎯 Effectiveness')
    ],
    colWidths: [15, 12, 12, 10, 15],
    style: {
      head: ['cyan'],
      border: ['gray']
    }
  });

  Object.entries(providerStats).forEach(([provider, stats]) => {
    const qualityColor = stats.avgQualityScore >= 80 ? chalk.green
                      : stats.avgQualityScore >= 60 ? chalk.blue
                      : chalk.red;

    const effectivenessColor = stats.avgEffectivenessScore >= 80 ? chalk.green
                          : stats.avgEffectivenessScore >= 60 ? chalk.blue
                          : chalk.red;

    table.push([
      chalk.bold(provider),
      chalk.cyan(`$${stats.costUSD?.toFixed(4) || '0.0000'}`),
      stats.requestCount || 0,
      `${qualityColor(stats.avgQualityScore?.toFixed(0) || 0)}/100`,
      `${effectivenessColor(stats.avgEffectivenessScore?.toFixed(0) || 0)}/100`
    ]);
  });

  return table.toString();
}

/**
 * Creates an interactive menu system using inquirer
 */
export async function createInteractiveMenu(choices: Array<{name: string, value: string, short?: string}>): Promise<string> {
  const inquirer = (await import('inquirer')).default;

  const answer = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: chalk.cyan('🧠 TokNXR Analytics Dashboard'),
    choices: [
      ...choices,
      {name: chalk.red('🚪 Exit'), value: 'exit', short: 'Exit'}
    ]
  }]);

  return answer.action;
}

/**
 * Extended Ora type with progress tracking
 */
export interface OraWithProgress extends Ora {
  updateProgress: (stepIndex?: number) => void;
  progressSteps: string[];
}

/**
 * Enhanced progress indicator for operations with animated status
 */
export function createOperationProgress(operation: string, steps: string[]): OraWithProgress {
  const spinner = ora({
    text: chalk.blue(`🚀 ${operation}`),
    spinner: 'dots',
    color: 'cyan'
  });

  spinner.start();

  // Visual status icons that change during progress
  const getStepIcon = (stepIndex: number, totalSteps: number): string => {
    const progressRatio = stepIndex / totalSteps;

    if (progressRatio < 0.25) return '🔍';      // Starting/Looking
    if (progressRatio < 0.5) return '🔗';       // Connecting/Setting up
    if (progressRatio < 0.75) return '🔄';      // Processing/Configuring
    if (progressRatio < 0.95) return '⚡';       // Finalizing
    return '✨';                                // Ready/Complete
  };

  let currentStep = 0;
  const updateProgress = (stepIndex?: number) => {
    if (stepIndex !== undefined) {
      currentStep = stepIndex;
    }
    const progress = Math.floor((currentStep / steps.length) * 100);
    const icon = getStepIcon(currentStep, steps.length);
    const stepText = steps[currentStep] || `Step ${currentStep + 1}/${steps.length}`;

    spinner.text = `${icon} ${chalk.cyan(operation)} ${chalk.gray(`[${currentStep}/${steps.length}] ${stepText}`)}`;

    // Add ETA estimate
    const eta = steps.length - currentStep - 1;
    if (eta > 0 && currentStep > 0) {
      const avgTime = 500 * currentStep; // Estimate based on current completion
      const etaTime = (avgTime / currentStep) * eta;
      const etaSeconds = Math.ceil(etaTime / 1000);
      spinner.text += chalk.dim(` (~${etaSeconds}s)`);
    }
  };

  // Create extended spinner with progress tracking
  const extendedSpinner = spinner as OraWithProgress;
  extendedSpinner.updateProgress = updateProgress;
  extendedSpinner.progressSteps = steps;

  return extendedSpinner;
}

/**
 * Creates a visual quality score breakdown
 */
export function createQualityBreakdown(interactions: any[]): string {
  let excellent = 0, good = 0, fair = 0, poor = 0;

  interactions.forEach((interaction: any) => {
    const score = interaction.codeQualityScore || 0;
    if (score >= 90) excellent++;
    else if (score >= 75) good++;
    else if (score >= 60) fair++;
    else poor++;
  });

  const total = interactions.length;

  return createBox('⭐ Code Quality Analysis', [
    `🌟 Excellent (90-100): ${excellent} ${chalk.green(createMiniBar(excellent / total))}`,
    `✅ Good (75-89): ${good} ${chalk.blue(createMiniBar(good / total))}`,
    `⚖️  Fair (60-74): ${fair} ${chalk.yellow(createMiniBar(fair / total))}`,
    `❌ Poor (0-59): ${poor} ${chalk.red(createMiniBar(poor / total))}`,
    `${chalk.gray('Total interactions analyzed:')} ${total}`
  ], {
    borderColor: excellent > fair ? 'green' : fair > excellent ? 'yellow' : 'blue'
  });
}

/**
 * Creates a mini ASCII progress bar
 */
function createMiniBar(percentage: number, length: number = 15): string {
  const filled = Math.round(percentage * length);
  const empty = length - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

/**
 * Enhanced error handling with suggestions
 */
export function createErrorWithSuggestions(error: string, suggestions: string[]): string {
  return createBox('❌ Error', [
    chalk.red(error),
    '',
    chalk.cyan('💡 Quick fixes:'),
    ...suggestions.map(suggestion => `  • ${suggestion}`)
  ], {
    borderColor: 'red',
    titleColor: 'red'
  });
}

/**
 * Success message with next steps
 */
export function createSuccessWithNextSteps(message: string, nextSteps: string[]): string {
  return createBox('✅ Success', [
    chalk.green(message),
    '',
    chalk.cyan('📋 Next steps:'),
    ...nextSteps.map(step => `  • ${step}`)
  ], {
    borderColor: 'green',
    titleColor: 'green'
  });
}

/**
 * Creates an ASCII chart for cost trends with color-coding
 */
export function createCostChart(weeklyCosts: number[]): string {
  const maxCost = Math.max(...weeklyCosts, 1);
  const height = 6;
  const chartWidth = weeklyCosts.length * 2 - 1;

  let chart = 'Last 7 days │\n';
  chart += '─────────────┼' + '─'.repeat(chartWidth) + '\n';

  // Get dynamic color and budget zone for each day
  const getCostColorAndZone = (cost: number) => {
    const budget = 50.00; // Monthly budget
    const dailyAverage = budget / 30;

    if (cost >= dailyAverage * 2) return { color: chalk.red, zone: '🚨' }; // Danger
    if (cost >= dailyAverage * 1.5) return { color: chalk.yellow, zone: '⚠️' }; // Warning
    if (cost >= dailyAverage) return { color: chalk.blue, zone: 'ℹ️' }; // Elevated
    return { color: chalk.green, zone: '✅' }; // Safe
  };

  for (let row = height; row > 0; row--) {
    const label = row === height ? chalk.cyan('$5.00 ') :
                 row === Math.floor(height*(2/3)) ? chalk.cyan('$3.40 ') :
                 row === Math.floor(height/2) ? chalk.cyan('$1.70 ') :
                 row === Math.floor(height/3) ? chalk.cyan('$0.80 ') : '';
    chart += `${label}│`;

    weeklyCosts.forEach((cost, idx) => {
      const barHeight = Math.round((cost / maxCost) * height);
      const { color } = getCostColorAndZone(cost);
      const char = row <= barHeight ? color('█') : ' ';
      chart += idx < weeklyCosts.length - 1 ? char + ' ' : char;
    });
    chart += '\n';
  }

  // Add budget zone summary at bottom
  const averageCost = weeklyCosts.reduce((sum, cost) => sum + cost, 0) / weeklyCosts.length;
  const { color, zone } = getCostColorAndZone(averageCost);

  chart += '\n💰 Daily Average: ' + color(`$${averageCost.toFixed(2)}`) + ` ${zone}`;

  return createBox('📈 Weekly Cost Trends', chart, {padding: 0});
}

/**
 * Renders ASCII art with status indicators
 */
export function createStatusIndicator(status: 'loading' | 'success' | 'warning' | 'error', message: string): string {
  const icons = {
    loading: chalk.cyan('⏳'),
    success: chalk.green('✅'),
    warning: chalk.yellow('⚠️ '),
    error: chalk.red('❌')
  };

  return `${icons[status]} ${message}`;
}
