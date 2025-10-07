 
/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from 'chalk';
import boxen from 'boxen';
import ora, { type Ora } from 'ora';
import os from 'os';
import fs from 'fs';
import path from 'path';

// Enhanced UI Components for Series A CLI Experience

// State management for cross-session persistence
export class CliStateManager {
  private static readonly CONFIG_DIR = path.join(os.homedir(), '.toknxr');
  private static readonly STATE_FILE = path.join(CliStateManager.CONFIG_DIR, 'cli-state.json');

  static ensureConfigDir(): void {
    if (!fs.existsSync(this.CONFIG_DIR)) {
      fs.mkdirSync(this.CONFIG_DIR, { recursive: true });
    }
  }

  static loadState(): any {
    try {
      this.ensureConfigDir();
      if (fs.existsSync(this.STATE_FILE)) {
        const data = fs.readFileSync(this.STATE_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not load CLI state, starting fresh'));
    }
    return {
      budgets: {},
      preferences: {
        pageSize: 10,
        sortOrder: 'date_descends',
        filters: {},
      },
      sessionData: {},
      lastUpdated: new Date().toISOString(),
    };
  }

  static saveState(state: any): void {
    try {
      this.ensureConfigDir();
      state.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.STATE_FILE, JSON.stringify(state, null, 2));
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not save CLI state'));
    }
  }

  static getSessionBudget(provider?: string): number {
    const state = this.loadState();
    if (provider && state.budgets[provider]) {
      return state.budgets[provider];
    }
    return state.budgets.default || 50.0;
  }

  static updateSessionBudget(amount: number, provider?: string): void {
    const state = this.loadState();
    const key = provider || 'default';
    state.budgets[key] = amount;
    this.saveState(state);
  }

  static getPreferences(): any {
    const state = this.loadState();
    return state.preferences;
  }

  static updatePreferences(preferences: any): void {
    const state = this.loadState();
    state.preferences = { ...state.preferences, ...preferences };
    this.saveState(state);
  }
}

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

  const status = percentage >= 95 ? chalk.red : percentage >= 75 ? chalk.yellow : chalk.green;

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
    ...options,
  };

  const contentArray = Array.isArray(content) ? content : [content];
  return boxen(contentArray.join('\n'), {
    ...opts,
    title,
    titleAlignment: 'left',
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
  const budget = CliStateManager.getSessionBudget(); // Use persistent budget
  const remaining = Math.max(0, budget - totalCost);

  let status, statusText;

  if (totalCost >= budget * 0.95) {
    status = chalk.red;
    statusText = 'NEAR LIMIT';
  } else if (totalCost >= budget * 0.75) {
    status = chalk.yellow;
    statusText = 'APPROACHING';
  } else {
    status = chalk.green;
    statusText = 'UNDER BUDGET';
  }

  const wasteIcon = wasteRate > 10 ? '🟡' : '🟢';
  const hallucinationIcon = hallucinationRate && hallucinationRate > 5 ? '🟠' : '🟢';

  return createBox(
    '📊 Usage Overview',
    [
      `💰 Total Cost: $${costFormatted} (${status(`${statusText}`)})`,
      `📊 Requests: ${totalRequests} this month`,
      `${wasteIcon} Waste Rate: ${wasteRate.toFixed(1)}%`,
      ...(hallucinationRate
        ? [`${hallucinationIcon} Hallucination Rate: ${hallucinationRate.toFixed(1)}%`]
        : []),
      `🎯 Budget Remaining: $${remaining.toFixed(2)}`,
    ],
    {
      borderColor: totalCost >= budget * 0.9 ? 'red' : 'green',
      titleColor: 'blue',
    }
  );
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
      chalk.bold('🎯 Effectiveness'),
    ],
    colWidths: [15, 12, 12, 10, 15],
    style: {
      head: ['cyan'],
      border: ['gray'],
    },
  });

  Object.entries(providerStats).forEach(([provider, stats]) => {
    const qualityColor =
      stats.avgQualityScore >= 80
        ? chalk.green
        : stats.avgQualityScore >= 60
          ? chalk.blue
          : chalk.red;

    const effectivenessColor =
      stats.avgEffectivenessScore >= 80
        ? chalk.green
        : stats.avgEffectivenessScore >= 60
          ? chalk.blue
          : chalk.red;

    table.push([
      chalk.bold(provider),
      chalk.cyan(`$${stats.costUSD?.toFixed(4) || '0.0000'}`),
      stats.requestCount || 0,
      `${qualityColor(stats.avgQualityScore?.toFixed(0) || 0)}/100`,
      `${effectivenessColor(stats.avgEffectivenessScore?.toFixed(0) || 0)}/100`,
    ]);
  });

  return table.toString();
}

/**
 * Creates an interactive menu system using inquirer
 */
export async function createInteractiveMenu(
  choices: Array<{ name: string; value: string; short?: string }>
): Promise<string> {
  const inquirer = (await import('inquirer')).default;

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.cyan('🧠 TokNXR Analytics Dashboard'),
      choices: [...choices, { name: chalk.red('🚪 Exit'), value: 'exit', short: 'Exit' }],
    },
  ]);

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
    color: 'cyan',
  });

  spinner.start();

  // Visual status icons that change during progress
  const getStepIcon = (stepIndex: number, totalSteps: number): string => {
    const progressRatio = stepIndex / totalSteps;

    if (progressRatio < 0.25) return '🔍'; // Starting/Looking
    if (progressRatio < 0.5) return '🔗'; // Connecting/Setting up
    if (progressRatio < 0.75) return '🔄'; // Processing/Configuring
    if (progressRatio < 0.95) return '⚡'; // Finalizing
    return '✨'; // Ready/Complete
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
  let excellent = 0,
    good = 0,
    fair = 0,
    poor = 0;

  interactions.forEach((interaction: any) => {
    const score = interaction.codeQualityScore || 0;
    if (score >= 90) excellent++;
    else if (score >= 75) good++;
    else if (score >= 60) fair++;
    else poor++;
  });

  const total = interactions.length;

  return createBox(
    '⭐ Code Quality Analysis',
    [
      `🌟 Excellent (90-100): ${excellent} ${chalk.green(createMiniBar(excellent / total))}`,
      `✅ Good (75-89): ${good} ${chalk.blue(createMiniBar(good / total))}`,
      `⚖️  Fair (60-74): ${fair} ${chalk.yellow(createMiniBar(fair / total))}`,
      `❌ Poor (0-59): ${poor} ${chalk.red(createMiniBar(poor / total))}`,
      `${chalk.gray('Total interactions analyzed:')} ${total}`,
    ],
    {
      borderColor: excellent > fair ? 'green' : fair > excellent ? 'yellow' : 'blue',
    }
  );
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
  return createBox(
    '❌ Error',
    [
      chalk.red(error),
      '',
      chalk.cyan('💡 Quick fixes:'),
      ...suggestions.map(suggestion => `  • ${suggestion}`),
    ],
    {
      borderColor: 'red',
      titleColor: 'red',
    }
  );
}

/**
 * Success message with next steps
 */
export function createSuccessWithNextSteps(message: string, nextSteps: string[]): string {
  return createBox(
    '✅ Success',
    [
      chalk.green(message),
      '',
      chalk.cyan('📋 Next steps:'),
      ...nextSteps.map(step => `  • ${step}`),
    ],
    {
      borderColor: 'green',
      titleColor: 'green',
    }
  );
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
    const budget = CliStateManager.getSessionBudget();
    const dailyAverage = budget / 30;

    if (cost >= dailyAverage * 2) return { color: chalk.red, zone: '🚨' }; // Danger
    if (cost >= dailyAverage * 1.5) return { color: chalk.yellow, zone: '⚠️' }; // Warning
    if (cost >= dailyAverage) return { color: chalk.blue, zone: 'ℹ️' }; // Elevated
    return { color: chalk.green, zone: '✅' }; // Safe
  };

  for (let row = height; row > 0; row--) {
    const label =
      row === height
        ? chalk.cyan('$5.00 ')
        : row === Math.floor(height * (2 / 3))
          ? chalk.cyan('$3.40 ')
          : row === Math.floor(height / 2)
            ? chalk.cyan('$1.70 ')
            : row === Math.floor(height / 3)
              ? chalk.cyan('$0.80 ')
              : '';
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

  return createBox('📈 Weekly Cost Trends', chart, { padding: 0 });
}

/**
 * Renders ASCII art with status indicators
 */
export function createStatusIndicator(
  status: 'loading' | 'success' | 'warning' | 'error',
  message: string
): string {
  const icons = {
    loading: chalk.cyan('⏳'),
    success: chalk.green('✅'),
    warning: chalk.yellow('⚠️ '),
    error: chalk.red('❌'),
  };

  return `${icons[status]} ${message}`;
}

// Enhanced Interactivity Components - Phase 3+

export interface PaginationOptions {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  showInfo?: boolean;
}

export interface FilterOptions {
  provider?: string[];
  dateRange?: { start: Date; end: Date };
  qualityRange?: { min: number; max: number };
  costRange?: { min: number; max: number };
  sortBy?: 'date' | 'cost' | 'quality' | 'effectiveness';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchOptions {
  query: string;
  fields: string[];
}

/**
 * Creates pagination controls
 */
export function createPaginationControls(options: PaginationOptions): string {
  const { currentPage, totalPages, pageSize, totalItems, showInfo = true } = options;

  if (totalPages <= 1) return '';

  let controls = '';

  // Page info
  if (showInfo) {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    controls += chalk.gray(
      `📄 Page ${currentPage}/${totalPages} • Items ${startItem}-${endItem} of ${totalItems}\n`
    );
  }

  // Navigation controls
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  controls += '┌─ ';
  controls += prevDisabled ? chalk.gray('⬅️ Prev') : chalk.cyan('⬅️ Prev');
  controls += ' ─ ';

  // Page numbers (show max 5 pages centered on current)
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);

  if (startPage > 1) {
    controls += chalk.gray('1... ');
  }

  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      controls += chalk.bold.yellow(`[${i}]`) + ' ';
    } else {
      controls += chalk.cyan(`${i} `);
    }
  }

  if (endPage < totalPages) {
    controls += chalk.gray(`...${totalPages} `);
  }

  controls += '─ ';
  controls += nextDisabled ? chalk.gray('Next ➡️') : chalk.cyan('Next ➡️');
  controls += ' ─┐';

  return controls;
}

/**
 * Creates an interactive filtering interface
 */
export async function createFilterInterface(currentFilters: FilterOptions): Promise<FilterOptions> {
  const inquirer = (await import('inquirer')).default;

  console.log(
    createBox(
      '🔍 Filter & Sort Options',
      [
        'Configure your data view preferences',
        '',
        chalk.gray('Current filters will be preserved if not modified'),
      ],
      { borderColor: 'magenta', titleColor: 'magenta' }
    )
  );

  const providersAnswer = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'providers',
      message: 'Select providers to include:',
      choices: ['Gemini-Pro', 'GPT-4', 'Claude', 'Other'],
      default: currentFilters.provider || [],
    },
  ]);

  const sortAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'sortBy',
      message: 'Sort results by:',
      choices: [
        { name: '📅 Date (newest first)', value: 'date_desc' },
        { name: '📅 Date (oldest first)', value: 'date_asc' },
        { name: '💰 Cost (highest first)', value: 'cost_desc' },
        { name: '💰 Cost (lowest first)', value: 'cost_asc' },
        { name: '⭐ Quality (highest first)', value: 'quality_desc' },
        { name: '⭐ Quality (lowest first)', value: 'quality_asc' },
        { name: '🎯 Effectiveness (highest first)', value: 'effectiveness_desc' },
        { name: '🎯 Effectiveness (lowest first)', value: 'effectiveness_asc' },
      ],
      default: currentFilters.sortBy
        ? `${currentFilters.sortBy}_${currentFilters.sortOrder || 'desc'}`
        : 'date_desc',
    },
  ]);

  const applyAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'applyFilters',
      message: 'Apply these filter settings?',
      default: true,
    },
  ]);

  if (!applyAnswer.applyFilters) {
    return currentFilters;
  }

  const [sortBy, sortOrder] = (sortAnswer.sortBy as string).split('_');

  return {
    ...currentFilters,
    provider: providersAnswer.providers,
    sortBy: sortBy as any,
    sortOrder: sortOrder as 'asc' | 'desc',
  };
}

/**
 * Creates a search interface with results preview
 */
export async function createSearchInterface(
  availableFields: string[],
  recentSearches: string[] = []
): Promise<SearchOptions | null> {
  const inquirer = (await import('inquirer')).default;

  const queryAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: '🔍 Search interactions:',
      validate: (input: string) =>
        input.trim().length >= 2 || 'Search query must be at least 2 characters',
    },
  ]);

  const fieldsAnswer = await inquirer.prompt({
    type: 'checkbox',
    name: 'fields',
    message: 'Search in these fields:',
    choices: availableFields,
    default: availableFields,
    validate: (selected: string[]) => selected.length > 0 || 'Select at least one field to search',
  } as any);

  return {
    query: queryAnswer.query.trim(),
    fields: fieldsAnswer.fields,
  };
}

/**
 * Applies filters and search to interaction data
 */
export function filterAndSearchInteractions(
  interactions: any[],
  filters: FilterOptions,
  search?: SearchOptions
): any[] {
  let filtered = [...interactions];

  // Apply search
  if (search && search.query) {
    const query = search.query.toLowerCase();
    filtered = filtered.filter(interaction => {
      return search.fields.some(field => {
        const value = interaction[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        } else if (typeof value === 'number') {
          return value.toString().includes(query);
        } else if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value).toLowerCase().includes(query);
        }
        return false;
      });
    });
  }

  // Apply provider filter
  if (filters.provider && filters.provider.length > 0) {
    filtered = filtered.filter(i => filters.provider!.includes(i.provider));
  }

  // Apply cost range filter
  if (filters.costRange) {
    filtered = filtered.filter(
      i => i.costUSD >= filters.costRange!.min && i.costUSD <= filters.costRange!.max
    );
  }

  // Apply quality range filter
  if (filters.qualityRange) {
    filtered = filtered.filter(
      i =>
        (i.codeQualityScore || 0) >= filters.qualityRange!.min &&
        (i.codeQualityScore || 0) <= filters.qualityRange!.max
    );
  }

  // Apply date range filter
  if (filters.dateRange) {
    const start = filters.dateRange.start.getTime();
    const end = filters.dateRange.end.getTime();
    filtered = filtered.filter(i => {
      if (!i.timestamp) return false;
      const date = new Date(i.timestamp).getTime();
      return date >= start && date <= end;
    });
  }

  // Apply sorting
  if (filters.sortBy) {
    const sortField = filters.sortBy;
    const sortOrder = filters.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let valueA, valueB;

      switch (sortField) {
        case 'date':
          valueA = new Date(a.timestamp || 0).getTime();
          valueB = new Date(b.timestamp || 0).getTime();
          break;
        case 'cost':
          valueA = a.costUSD || 0;
          valueB = b.costUSD || 0;
          break;
        case 'quality':
          valueA = a.codeQualityScore || 0;
          valueB = b.codeQualityScore || 0;
          break;
        case 'effectiveness':
          valueA = a.effectivenessScore || 0;
          valueB = b.effectivenessScore || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
  }

  return filtered;
}

/**
 * Creates a paginated data display with controls
 */
export function createPaginatedDisplay(
  items: any[],
  pageSize: number,
  currentPage: number,
  itemRenderer: (item: any, index: number) => string,
  title?: string
): string {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pageItems = items.slice(startIndex, endIndex);

  let output = '';

  if (title) {
    output +=
      createBox(
        title,
        [
          `Showing items ${startIndex + 1}-${endIndex} of ${totalItems}`,
          `Page ${currentPage} of ${totalPages}`,
        ],
        { borderColor: 'blue', titleColor: 'blue' }
      ) + '\n';
  }

  pageItems.forEach((item, index) => {
    output += itemRenderer(item, startIndex + index) + '\n';
  });

  output += createPaginationControls({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
  });

  return output;
}

/**
 * Interactive data explorer with persistent state
 */
export class InteractiveDataExplorer {
  private currentFilters: FilterOptions;
  private currentSearch?: SearchOptions;
  private currentPage: number;
  private pageSize: number;
  private allData: any[];

  constructor(data: any[]) {
    this.allData = data;
    this.currentPage = 1;

    // Load preferences from state
    const preferences = CliStateManager.getPreferences();
    this.currentFilters = preferences.filters || {};
    this.pageSize = preferences.pageSize || 10;
  }

  getFilteredData(): any[] {
    return filterAndSearchInteractions(this.allData, this.currentFilters, this.currentSearch);
  }

  getCurrentPageData(): any[] {
    const filtered = this.getFilteredData();
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, filtered.length);
    return filtered.slice(startIndex, endIndex);
  }

  getPaginationInfo() {
    const filtered = this.getFilteredData();
    const totalPages = Math.ceil(filtered.length / this.pageSize);

    return {
      currentPage: this.currentPage,
      totalPages,
      pageSize: this.pageSize,
      totalItems: filtered.length,
      totalUnfilteredItems: this.allData.length,
    };
  }

  setPage(page: number): boolean {
    const { totalPages } = this.getPaginationInfo();
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      return true;
    }
    return false;
  }

  setFilters(filters: FilterOptions): void {
    this.currentFilters = filters;
    this.currentPage = 1; // Reset to first page

    // Persist filters
    const preferences = CliStateManager.getPreferences();
    preferences.filters = filters;
    CliStateManager.updatePreferences(preferences);
  }

  setSearch(search: SearchOptions): void {
    this.currentSearch = search;
    this.currentPage = 1; // Reset to first page
  }

  clearFilters(): void {
    this.currentFilters = {};
    this.currentSearch = undefined;
    this.currentPage = 1;

    const preferences = CliStateManager.getPreferences();
    preferences.filters = {};
    CliStateManager.updatePreferences(preferences);
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;

    const preferences = CliStateManager.getPreferences();
    preferences.pageSize = size;
    CliStateManager.updatePreferences(preferences);
  }
}
