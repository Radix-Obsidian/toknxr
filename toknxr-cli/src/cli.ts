import { Command } from 'commander';
import chalk from 'chalk';
import { startProxyServer } from './proxy.js';

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

program.parse(process.argv);