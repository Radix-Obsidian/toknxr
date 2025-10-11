import chalk from 'chalk';

/**
 * ASCII Art and Branding for TokNXR CLI
 * Contains all the visual elements that make the CLI experience more engaging
 */

// Golden Sheep AI Logo - ASCII Art
export const GOLDEN_SHEEP_LOGO = `
${chalk.yellow('     ╭─╮')}
${chalk.yellow('    ╱   ╲')}
${chalk.yellow('   ╱ ● ● ╲')}     ${chalk.gray('Golden Sheep AI')}
${chalk.yellow('  ╱   ∩   ╲')}    ${chalk.gray('Intelligent Development Tools')}
${chalk.yellow(' ╱  ╲___╱  ╲')}
${chalk.white('╱___________╲')}
${chalk.white('╲___________╱')}
 ${chalk.white('│ │')}     ${chalk.white('│ │')}
 ${chalk.white('╰─╯')}     ${chalk.white('╰─╯')}
`;

// TokNXR Brand Logo
export const TOKNXR_LOGO = `
${chalk.cyan.bold('████████╗ ██████╗ ██╗  ██╗███╗   ██╗██╗  ██╗██████╗ ')}
${chalk.cyan.bold('╚══██╔══╝██╔═══██╗██║ ██╔╝████╗  ██║╚██╗██╔╝██╔══██╗')}
${chalk.cyan.bold('   ██║   ██║   ██║█████╔╝ ██╔██╗ ██║ ╚███╔╝ ██████╔╝')}
${chalk.cyan.bold('   ██║   ██║   ██║██╔═██╗ ██║╚██╗██║ ██╔██╗ ██╔══██╗')}
${chalk.cyan.bold('   ██║   ╚██████╔╝██║  ██╗██║ ╚████║██╔╝ ██╗██║  ██║')}
${chalk.cyan.bold('   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝')}

${chalk.gray('           AI Effectiveness & Code Quality Analysis')}
`;

// Compact version for smaller displays
export const TOKNXR_COMPACT_LOGO = `
${chalk.cyan.bold('╔╦╗┌─┐┬┌─┌┐┌╦ ╦┬─┐')}
${chalk.cyan.bold(' ║ │ │├┴┐│││╚╦╝├┬┘')}
${chalk.cyan.bold(' ╩ └─┘┴ ┴┘└┘ ╩ ┴└─')}
${chalk.gray('AI Code Quality Tracker')}
`;

// Welcome message from Golden Sheep AI
export const WELCOME_MESSAGE = () => {
  const messages = [
    'Welcome to the most advanced AI development analytics platform!',
    'Ready to supercharge your AI development workflow?',
    'Let\'s analyze some AI code quality together!',
    'Time to turn AI interactions into actionable insights!',
    'Your AI development companion is ready to serve!'
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  return `
${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}

${chalk.yellow.bold('👋 Message from Golden Sheep AI:')}
${chalk.white(randomMessage)}

${chalk.gray('TokNXR helps you track token usage, analyze code quality, and detect hallucinations')}
${chalk.gray('in your AI-generated code. Everything runs locally for maximum privacy and speed.')}

${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
`;
};

// System status indicators
export const createSystemStatus = (proxyRunning: boolean, configExists: boolean, hasData: boolean) => `
${chalk.bold('🔧 System Status:')}
  ${proxyRunning ? chalk.green('✅ Proxy Server') : chalk.red('❌ Proxy Server')} ${chalk.gray('(8788)')}
  ${configExists ? chalk.green('✅ Configuration') : chalk.red('❌ Configuration')} ${chalk.gray('(toknxr.config.json)')}
  ${hasData ? chalk.green('✅ Analytics Data') : chalk.yellow('⚠️  Analytics Data')} ${chalk.gray('(interactions.log)')}
`;

// Quick stats display
export const createQuickStats = (totalCost: number, totalRequests: number, avgQuality: number) => `
${chalk.bold('📊 Quick Stats:')}
  ${chalk.cyan('Total Spent:')} ${chalk.green(`$${totalCost.toFixed(2)}`)}
  ${chalk.cyan('AI Requests:')} ${chalk.blue(totalRequests.toLocaleString())}
  ${chalk.cyan('Avg Quality:')} ${avgQuality >= 80 ? chalk.green(`${avgQuality}/100`) : avgQuality >= 60 ? chalk.yellow(`${avgQuality}/100`) : chalk.red(`${avgQuality}/100`)}
`;

// Animated loading indicators
export const createLoadingAnimation = (message: string) => {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  return setInterval(() => {
    process.stdout.write(`\r${chalk.cyan(frames[i++ % frames.length])} ${message}`);
  }, 100);
};

// Success/Error decorative boxes
export const createSuccessBox = (title: string, message: string) => `
${chalk.green('╔══════════════════════════════════════════════════════════════════════════════════╗')}
${chalk.green('║')} ${chalk.green.bold('✨ ' + title)} ${' '.repeat(Math.max(0, 75 - title.length))} ${chalk.green('║')}
${chalk.green('╠══════════════════════════════════════════════════════════════════════════════════╣')}
${chalk.green('║')} ${message} ${' '.repeat(Math.max(0, 78 - message.length))} ${chalk.green('║')}
${chalk.green('╚══════════════════════════════════════════════════════════════════════════════════╝')}
`;

export const createErrorBox = (title: string, message: string, hint?: string) => `
${chalk.red('╔══════════════════════════════════════════════════════════════════════════════════╗')}
${chalk.red('║')} ${chalk.red.bold('❌ ' + title)} ${' '.repeat(Math.max(0, 75 - title.length))} ${chalk.red('║')}
${chalk.red('╠══════════════════════════════════════════════════════════════════════════════════╣')}
${chalk.red('║')} ${message} ${' '.repeat(Math.max(0, 78 - message.length))} ${chalk.red('║')}
${hint ? `${chalk.red('║')} ${chalk.yellow('💡 ' + hint)} ${' '.repeat(Math.max(0, 75 - hint.length))} ${chalk.red('║')}` : ''}
${chalk.red('╚══════════════════════════════════════════════════════════════════════════════════╝')}
`;

// Version and build info
export const createVersionInfo = (version: string) => `
${chalk.gray(`v${version}`)} ${chalk.gray('•')} ${chalk.gray('Built by Golden Sheep AI')} ${chalk.gray('•')} ${chalk.gray('Open Source')}
${chalk.gray('Report issues:')} ${chalk.blue('https://github.com/goldensheepai/toknxr')}
`;

// Menu section headers with emojis and styling
export const MENU_SECTIONS = {
  CORE_OPERATIONS: {
    title: chalk.cyan.bold('🚀 Core Operations'),
    description: chalk.gray('Essential tracking and monitoring features')
  },
  ANALYTICS: {
    title: chalk.magenta.bold('📊 Analytics & Insights'),
    description: chalk.gray('Deep dive into your AI usage patterns')
  },
  QUALITY_CONTROL: {
    title: chalk.yellow.bold('🔍 Quality Control'),
    description: chalk.gray('Code quality and hallucination detection')
  },
  SYSTEM_MANAGEMENT: {
    title: chalk.red.bold('⚙️ System Management'),
    description: chalk.gray('Configuration and maintenance tools')
  }
} as const;

// Tip of the day/random helpful tips
export const getRandomTip = () => {
  const tips = [
    '💡 Use "toknxr start" to begin tracking AI interactions in real-time',
    '💡 Check "toknxr stats" regularly to monitor your AI spending',
    '💡 Run "toknxr doctor" if you encounter any issues',
    '💡 Set up budget alerts with "toknxr budget --set 50" to control costs',
    '💡 Use "toknxr search" to find specific interactions quickly',
    '💡 Export your data with "toknxr export" for external analysis',
    '💡 Monitor code quality with "toknxr code-analysis" after coding sessions',
    '💡 The proxy server runs on port 8788 by default',
    '💡 All data is stored locally for maximum privacy',
    '💡 Use "toknxr browse" to explore your interaction history'
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
};

// Seasonal/contextual decorations
export const getContextualDecoration = () => {
  const hour = new Date().getHours();
  
  if (hour < 6) return '🌙 Late night coding session?';
  if (hour < 12) return '🌅 Good morning, developer!';
  if (hour < 17) return '☀️ Productive afternoon ahead!';
  if (hour < 21) return '🌆 Evening development time!';
  return '🌃 Night owl mode activated!';
};

// Color scheme helpers
export const COLORS = {
  primary: chalk.cyan,
  secondary: chalk.blue,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  muted: chalk.gray,
  highlight: chalk.magenta,
  accent: chalk.white.bold
} as const;

// Box drawing characters for consistent styling
export const BOX_CHARS = {
  topLeft: '╔',
  topRight: '╗',
  bottomLeft: '╚',
  bottomRight: '╝',
  horizontal: '═',
  vertical: '║',
  teeDown: '╦',
  teeUp: '╩',
  teeRight: '╠',
  teeLeft: '╣',
  cross: '╬'
} as const;