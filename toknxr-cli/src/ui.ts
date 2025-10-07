import chalk from 'chalk';
import readline from 'readline';

export const createStatsOverview = (
  cost: number,
  requests: number,
  waste: number,
  hallucinations: number
) => `
  ${chalk.bold.blue('📊 TokNXR Analytics Overview')}
  ${chalk.gray('------------------------------------')}
  ${chalk.cyan('Total Cost:')} ${chalk.green(`$${cost.toFixed(2)}`)}
  ${chalk.cyan('Total Requests:')} ${chalk.green(requests)}
  ${chalk.cyan('Estimated Waste:')} ${chalk.yellow(`${waste.toFixed(2)}%`)}
  ${chalk.cyan('Hallucination Rate:')} ${chalk.red(`${hallucinations.toFixed(2)}%`)}
`;

export const createProviderTable = async (
  stats: Record<
    string,
    { totalTokens: number; costUSD: number; avgQualityScore: number; avgEffectivenessScore: number }
  >
) => {
  let table = `${chalk.bold.blue('🤖 Provider Performance')}\n`;
  table += `${chalk.gray('----------------------------------------------------------------')}\n`;
  table += `${chalk.bold('Provider')} | ${chalk.bold('Tokens')} | ${chalk.bold('Cost')} | ${chalk.bold('Quality')} | ${chalk.bold('Effectiveness')}\n`;
  table += `${chalk.gray('----------------------------------------------------------------')}\n`;

  for (const provider in stats) {
    const { totalTokens, costUSD, avgQualityScore, avgEffectivenessScore } = stats[provider];
    table += `${provider.padEnd(15)} | ${totalTokens.toLocaleString().padEnd(10)} | ${`$${costUSD.toFixed(2)}`.padEnd(8)} | ${`${avgQualityScore}/100`.padEnd(10)} | ${`${avgEffectivenessScore}/100`}\n`;
  }
  return table;
};

export const createQualityBreakdown = (interactions: { codeQualityScore?: number }[]) => {
  const qualityScores = interactions.map(i => i.codeQualityScore || 0);
  const averageQuality =
    qualityScores.reduce((a: number, b: number) => a + b, 0) / qualityScores.length;

  return `
    ${chalk.bold.magenta('🔍 Code Quality Breakdown')}
    ${chalk.gray('------------------------------------')}
    ${chalk.cyan('Average Quality Score:')} ${chalk.green(`${averageQuality.toFixed(2)}/100`)}
  `;
};

export const createOperationProgress = (title: string, steps: string[]) => {
  let currentStep = 0;
  const spinner = {
    updateProgress: (step: number) => {
      currentStep = step;
      console.log(`${chalk.blue(`[${currentStep + 1}/${steps.length}]`)} ${steps[currentStep]}`);
    },
    succeed: (message: string) => {
      console.log(chalk.green(message));
    },
    fail: (message: string) => {
      console.log(chalk.red(message));
    },
  };
  console.log(chalk.bold.blue(title));
  return spinner;
};

export const createInteractiveMenu = (
  options: { name: string; value: string }[]
): Promise<string> => {
  return new Promise(resolve => {
    console.log(chalk.bold.blue('MENU'));
    options.forEach(option => console.log(option.name));
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Choose an option: ', answer => {
      rl.close();
      resolve(answer);
    });
  });
};

export const createBox = (
  title: string,
  content: string[],
  options: { borderColor: string; titleColor: string; width?: number }
) => {
  const { borderColor, titleColor } = options;
  const color = chalk[borderColor as 'gray'] || chalk.gray;
  const titleColored = chalk[titleColor as 'white'] || chalk.white;

  let box = color('┌' + '─'.repeat(title.length + 2) + '┐\n');
  box += color('│ ') + titleColored(title) + color(' │\n');
  box += color('├' + '─'.repeat(title.length + 2) + '┤\n');
  content.forEach(line => {
    box +=
      color('│ ') +
      line +
      color(' '.repeat(Math.max(0, title.length - line.length + 2))) +
      color(' │\n');
  });
  box += color('└' + '─'.repeat(title.length + 2) + '┘');
  return box;
};

export const createCostChart = (data: number[]) => {
  // Basic chart for demonstration
  let chart = `${chalk.bold.blue('Cost Trend (Last 7 Days)')}\n`;
  const max = Math.max(...data);
  data.forEach(value => {
    const bar = '█'.repeat(Math.round((value / max) * 20));
    chart += `${chalk.green(bar)}\n`;
  });
  return chart;
};

export const createPaginatedDisplay = <T>(
  data: T[],
  pageSize: number,
  currentPage: number,
  render: (item: T, index: number) => string,
  title?: string
): string => {
  let display = title ? `${chalk.bold.blue(title)}\n` : '';
  data.forEach((item, index) => {
    display += render(item, (currentPage - 1) * pageSize + index);
  });
  return display;
};

export const createFilterInterface = (
  currentFilters: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  return new Promise(resolve => {
    console.log('Filtering interface is not implemented in this mock.');
    resolve(currentFilters);
  });
};

export const createSearchInterface = (
  fields: string[]
): Promise<{ query: string; fields: string[] }> => {
  return new Promise(resolve => {
    console.log('Search interface is not implemented in this mock.');
    resolve({ query: 'test', fields });
  });
};

export class InteractiveDataExplorer<T> {
  constructor(private data: T[]) {}
  setPageSize(_size: number): void {} // Mock implementation
  setPage(_page: number): void {} // Mock implementation
  getCurrentPageData(): T[] {
    return this.data;
  }
  getPaginationInfo(): { totalItems: number; totalPages: number } {
    return { totalItems: this.data.length, totalPages: 1 };
  }
}

export class CliStateManager {
  static getPreferences(): Record<string, unknown> {
    return {};
  }
  static updateSessionBudget(_amount: number, _provider?: string): void {} // Mock implementation
  static loadState(): { budgets: Record<string, number | Record<string, number>> } {
    return { budgets: {} };
  }
}

export const filterAndSearchInteractions = <T>(
  interactions: T[],
  _filters: Record<string, unknown>,
  _search: { query: string; fields: string[] }
): T[] => {
  return interactions;
};

export interface OraWithProgress {
  updateProgress: (step: number) => void;
  succeed: (message: string) => void;
  fail: (message: string) => void;
}
