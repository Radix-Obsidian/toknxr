import { Command } from 'commander';
import chalk from 'chalk';
import { startProxyServer } from './proxy.js';
import fs from 'node:fs';
import path from 'node:path';

const program = new Command();

program
  .name('toknxr-cli')
  .description('A CLI tool to automatically track AI interactions.')
  .version('0.1.0');

program
  .command('start')
  .description('Start the TokNxr proxy server to monitor AI interactions.')
  .action(() => {
    console.log(chalk.green('Starting TokNxr proxy server...'));
    startProxyServer();
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

    const stats = interactions.reduce((acc, interaction) => {
      if (!acc[interaction.provider]) {
        acc[interaction.provider] = { totalTokens: 0, promptTokens: 0, completionTokens: 0, requestCount: 0 };
      }
      acc[interaction.provider].totalTokens += interaction.totalTokens;
      acc[interaction.provider].promptTokens += interaction.promptTokens;
      acc[interaction.provider].completionTokens += interaction.completionTokens;
      acc[interaction.provider].requestCount += 1;
      return acc;
    }, {});

    console.log(chalk.bold.underline('Token Usage Statistics'));
    for (const provider in stats) {
      console.log(chalk.bold(`\nProvider: ${provider}`));
      console.log(`  Total Requests: ${stats[provider].requestCount}`);
      console.log(chalk.cyan(`  Total Tokens: ${stats[provider].totalTokens}`));
      console.log(`    - Prompt Tokens: ${stats[provider].promptTokens}`);
      console.log(`    - Completion Tokens: ${stats[provider].completionTokens}`);
    }
  });

program.parse(process.argv);