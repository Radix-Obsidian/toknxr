/**
 * CLI Commands for Enhanced Hallucination Detection
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { createCodeHaluDetector, detectCodeHallucinations } from '../enhanced-hallucination-detector.js';
import { detectAllPatterns, getPatternStatistics } from '../hallucination-patterns.js';
import { analyzeExecutionForHallucinations } from '../execution-based-detector.js';
import { createBox } from '../ui.js';

/**
 * Detailed hallucination analysis command
 */
export async function hallucinationsDetailedCommand(options: {
  category?: string;
  provider?: string;
  file?: string;
  code?: string;
  language?: string;
  enableExecution?: boolean;
  output?: string;
}) {
  console.log(chalk.bold.blue('🧠 Enhanced Hallucination Analysis (CodeHalu)'));
  console.log(chalk.gray('━'.repeat(60)));

  let code: string;
  let language = options.language || 'python';

  // Get code input
  if (options.file) {
    try {
      const fs = await import('fs');
      code = fs.readFileSync(options.file, 'utf8');
      console.log(chalk.green(`📁 Loaded code from: ${options.file}`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to read file: ${options.file}`));
      return;
    }
  } else if (options.code) {
    code = options.code;
  } else {
    // Interactive code input
    const { inputMethod } = await inquirer.prompt([
      {
        type: 'list',
        name: 'inputMethod',
        message: 'How would you like to provide the code?',
        choices: [
          { name: '📝 Enter code directly', value: 'direct' },
          { name: '📁 Load from file', value: 'file' },
          { name: '🔗 Analyze from recent interactions', value: 'recent' },
        ],
      },
    ]);

    if (inputMethod === 'direct') {
      const { inputCode } = await inquirer.prompt([
        {
          type: 'editor',
          name: 'inputCode',
          message: 'Enter the code to analyze:',
          validate: (input: string) => input.trim().length > 0 || 'Code cannot be empty',
        },
      ]);
      code = inputCode;
    } else if (inputMethod === 'file') {
      const { filePath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'filePath',
          message: 'Enter the file path:',
          validate: (input: string) => input.trim().length > 0 || 'File path cannot be empty',
        },
      ]);
      
      try {
        const fs = await import('fs');
        code = fs.readFileSync(filePath, 'utf8');
        console.log(chalk.green(`📁 Loaded code from: ${filePath}`));
      } catch (error) {
        console.error(chalk.red(`❌ Failed to read file: ${filePath}`));
        return;
      }
    } else {
      console.log(chalk.yellow('🔗 Recent interactions analysis not yet implemented'));
      return;
    }
  }

  // Language detection/confirmation
  if (!options.language) {
    const { detectedLanguage } = await inquirer.prompt([
      {
        type: 'list',
        name: 'detectedLanguage',
        message: 'Select the programming language:',
        choices: [
          { name: '🐍 Python', value: 'python' },
          { name: '📜 JavaScript', value: 'javascript' },
          { name: '🔷 TypeScript', value: 'typescript' },
          { name: '☕ Java', value: 'java' },
          { name: '🔧 Other', value: 'other' },
        ],
        default: 'python',
      },
    ]);
    language = detectedLanguage;
  }

  console.log(chalk.cyan(`\n🔍 Analyzing ${language} code (${code.length} characters)...`));

  try {
    // Create detector with appropriate configuration
    const detector = createCodeHaluDetector({
      enableExecutionAnalysis: options.enableExecution !== false,
      enableStaticAnalysis: true,
      enablePatternMatching: true,
      confidenceThreshold: 0.6,
      maxExecutionTime: 10000,
    });

    // Perform analysis
    const startTime = Date.now();
    const result = await detector.detectHallucinations(code, language);
    const analysisTime = Date.now() - startTime;

    // Display results
    console.log(chalk.bold('\n📊 Analysis Results'));
    console.log(chalk.gray('━'.repeat(40)));

    // Overall metrics
    const rateColor = result.overallHallucinationRate > 0.7 ? chalk.red : 
                     result.overallHallucinationRate > 0.4 ? chalk.yellow : chalk.green;
    
    console.log(`🎯 Overall Hallucination Rate: ${rateColor(`${(result.overallHallucinationRate * 100).toFixed(1)}%`)}`);
    console.log(`⏱️  Analysis Time: ${analysisTime}ms`);
    console.log(`🔬 Detection Methods: ${result.analysisMetadata.detectionMethods.join(', ')}`);
    console.log(`📏 Code Length: ${result.analysisMetadata.codeLength} characters`);

    // Categories breakdown
    if (result.categories.length > 0) {
      console.log(chalk.bold('\n🏷️  Detected Issues by Category'));
      console.log(chalk.gray('━'.repeat(40)));

      const categoryGroups = result.categories.reduce((groups, category) => {
        if (!groups[category.type]) groups[category.type] = [];
        groups[category.type].push(category);
        return groups;
      }, {} as Record<string, typeof result.categories>);

      Object.entries(categoryGroups).forEach(([type, categories]) => {
        const typeIcon = {
          mapping: '🗺️',
          naming: '🏷️',
          resource: '⚡',
          logic: '🧠',
        }[type] || '❓';

        console.log(`\n${typeIcon} ${type.toUpperCase()} Issues (${categories.length}):`);
        
        categories.forEach((category, index) => {
          const severityColor = {
            low: chalk.blue,
            medium: chalk.yellow,
            high: chalk.red,
            critical: chalk.magenta,
          }[category.severity];

          console.log(`  ${index + 1}. ${severityColor(category.severity.toUpperCase())} - ${category.description}`);
          console.log(`     Confidence: ${(category.confidence * 100).toFixed(1)}%`);
          console.log(`     Impact: ${category.businessImpact.estimatedDevTimeWasted.toFixed(1)}h dev time`);
          
          if (category.lineNumbers && category.lineNumbers.length > 0) {
            console.log(`     Lines: ${category.lineNumbers.join(', ')}`);
          }
          
          if (category.suggestedFix) {
            console.log(`     Fix: ${chalk.cyan(category.suggestedFix)}`);
          }
        });
      });
    } else {
      console.log(chalk.green('\n✅ No significant hallucinations detected!'));
    }

    // Execution results
    if (result.executionResult) {
      console.log(chalk.bold('\n⚡ Execution Analysis'));
      console.log(chalk.gray('━'.repeat(40)));
      
      const execResult = result.executionResult;
      console.log(`Status: ${execResult.success ? chalk.green('✅ Success') : chalk.red('❌ Failed')}`);
      console.log(`Memory Usage: ${execResult.resourceUsage.memoryMB.toFixed(2)}MB`);
      console.log(`Execution Time: ${execResult.resourceUsage.executionTimeMs}ms`);
      console.log(`Timed Out: ${execResult.timedOut ? chalk.red('Yes') : chalk.green('No')}`);
      
      if (execResult.errors.length > 0) {
        console.log(chalk.red('\nExecution Errors:'));
        execResult.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.type}: ${error.message}`);
        });
      }
      
      if (execResult.output) {
        console.log(chalk.blue('\nOutput:'));
        console.log(chalk.gray(execResult.output.substring(0, 200) + 
                              (execResult.output.length > 200 ? '...' : '')));
      }
    }

    // Business impact
    console.log(chalk.bold('\n💼 Business Impact'));
    console.log(chalk.gray('━'.repeat(40)));
    console.log(`Estimated Dev Time Wasted: ${chalk.yellow(`${result.businessImpact.estimatedDevTimeWasted.toFixed(1)} hours`)}`);
    console.log(`Cost of Hallucinations: ${chalk.red(`$${result.businessImpact.costOfHallucinations.toFixed(2)}`)}`);
    console.log(`Quality Impact: ${result.businessImpact.qualityImpact}/100`);
    console.log(`Cost Multiplier: ${result.businessImpact.costMultiplier.toFixed(1)}x`);

    // Recommendations
    if (result.recommendations.length > 0) {
      console.log(chalk.bold('\n💡 Recommendations'));
      console.log(chalk.gray('━'.repeat(40)));
      
      result.recommendations.forEach((rec, index) => {
        const priorityColor = rec.priority === 'high' ? chalk.red : 
                             rec.priority === 'medium' ? chalk.yellow : chalk.blue;
        
        console.log(`\n${index + 1}. ${priorityColor(rec.priority.toUpperCase())} - ${rec.title}`);
        console.log(`   ${rec.description}`);
        console.log(`   Expected Impact: ${rec.expectedImpact}`);
        console.log(`   Estimated Time: ${rec.estimatedTimeToFix || 'Unknown'}`);
        
        if (rec.actionItems.length > 0) {
          console.log(`   Action Items:`);
          rec.actionItems.forEach(item => {
            console.log(`     • ${item}`);
          });
        }
      });
    }

    // Pattern statistics (if available)
    if (result.analysisMetadata.patternStats) {
      const stats = result.analysisMetadata.patternStats;
      console.log(chalk.bold('\n📈 Pattern Statistics'));
      console.log(chalk.gray('━'.repeat(40)));
      console.log(`Total Patterns: ${stats.totalPatterns}`);
      console.log(`Average Confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
      
      if (Object.keys(stats.byCategory).length > 0) {
        console.log('By Category:');
        Object.entries(stats.byCategory).forEach(([category, count]) => {
          console.log(`  ${category}: ${count}`);
        });
      }
      
      if (Object.keys(stats.bySeverity).length > 0) {
        console.log('By Severity:');
        Object.entries(stats.bySeverity).forEach(([severity, count]) => {
          console.log(`  ${severity}: ${count}`);
        });
      }
    }

    // Export option
    if (options.output) {
      try {
        const fs = await import('fs');
        const exportData = {
          timestamp: new Date().toISOString(),
          code: code.substring(0, 1000) + (code.length > 1000 ? '...' : ''),
          language,
          analysisTime,
          result,
        };
        
        fs.writeFileSync(options.output, JSON.stringify(exportData, null, 2));
        console.log(chalk.green(`\n💾 Results exported to: ${options.output}`));
      } catch (error) {
        console.error(chalk.red(`❌ Failed to export results: ${error}`));
      }
    }

    // Interactive follow-up
    console.log(chalk.blue('\n🔍 What would you like to do next?'));
    const { nextAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'nextAction',
        message: 'Choose an action:',
        choices: [
          { name: '🔄 Analyze different code', value: 'analyze_new' },
          { name: '📊 View pattern details', value: 'pattern_details' },
          { name: '⚡ Run execution analysis only', value: 'execution_only' },
          { name: '💾 Export detailed report', value: 'export' },
          { name: '❌ Exit', value: 'exit' },
        ],
      },
    ]);

    switch (nextAction) {
      case 'analyze_new':
        console.log(chalk.cyan('🔄 Run the command again with new code'));
        break;
      case 'pattern_details':
        await showPatternDetails(code);
        break;
      case 'execution_only':
        await showExecutionAnalysis(code, language);
        break;
      case 'export':
        await exportDetailedReport(result, code, language);
        break;
      case 'exit':
        console.log(chalk.gray('👋 Analysis complete!'));
        break;
    }

  } catch (error) {
    console.error(chalk.red('❌ Analysis failed:'), error);
    console.log(chalk.yellow('\n💡 Troubleshooting tips:'));
    console.log('  • Check that the code is valid and complete');
    console.log('  • Ensure Python is installed for execution analysis');
    console.log('  • Try disabling execution analysis with --no-execution');
  }
}

/**
 * Code quality report command
 */
export async function codeQualityReportCommand(options: {
  output?: string;
  format?: string;
  includeExecution?: boolean;
}) {
  console.log(chalk.bold.blue('📋 Comprehensive Code Quality Report'));
  console.log(chalk.gray('━'.repeat(60)));

  // This would integrate with the existing interaction log
  const path = await import('path');
  const fs = await import('fs');
  
  const logFilePath = path.resolve(process.cwd(), 'interactions.log');
  if (!fs.existsSync(logFilePath)) {
    console.log(chalk.yellow('No interactions logged yet. Start tracking with: ') + 
                chalk.cyan('toknxr start'));
    return;
  }

  console.log(chalk.cyan('📊 Generating comprehensive quality report...'));
  
  // Load interactions and analyze for hallucinations
  const fileContent = fs.readFileSync(logFilePath, 'utf8');
  const lines = fileContent.trim().split('\\n');
  
  let codingInteractions = 0;
  let totalHallucinationRate = 0;
  let criticalIssues = 0;
  
  console.log(chalk.green(`✅ Analyzed ${lines.length} interactions`));
  console.log(chalk.blue(`📊 Found ${codingInteractions} coding interactions`));
  
  if (codingInteractions > 0) {
    const avgHallucinationRate = totalHallucinationRate / codingInteractions;
    console.log(chalk.yellow(`🧠 Average Hallucination Rate: ${(avgHallucinationRate * 100).toFixed(1)}%`));
    console.log(chalk.red(`⚠️  Critical Issues: ${criticalIssues}`));
  }

  // Generate report based on format
  const format = options.format || 'json';
  const outputPath = options.output || `code-quality-report.${format}`;

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalInteractions: lines.length,
      codingInteractions,
      avgHallucinationRate: codingInteractions > 0 ? totalHallucinationRate / codingInteractions : 0,
      criticalIssues,
    },
    // Additional report data would be added here
  };

  try {
    if (format === 'json') {
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    } else if (format === 'html') {
      const htmlReport = generateHtmlReport(report);
      fs.writeFileSync(outputPath, htmlReport);
    } else {
      console.error(chalk.red(`❌ Unsupported format: ${format}`));
      return;
    }
    
    console.log(chalk.green(`✅ Report generated: ${outputPath}`));
  } catch (error) {
    console.error(chalk.red('❌ Failed to generate report:'), error);
  }
}

/**
 * Helper functions
 */

async function showPatternDetails(code: string) {
  console.log(chalk.bold('\n🔍 Pattern Detection Details'));
  console.log(chalk.gray('━'.repeat(40)));
  
  const patterns = detectAllPatterns(code);
  const stats = getPatternStatistics(patterns);
  
  console.log(`Total Patterns Detected: ${stats.totalPatterns}`);
  console.log(`Average Confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
  
  patterns.forEach((pattern, index) => {
    console.log(`\n${index + 1}. ${pattern.pattern} (${pattern.category})`);
    console.log(`   Severity: ${pattern.severity}`);
    console.log(`   Confidence: ${(pattern.confidence * 100).toFixed(1)}%`);
    console.log(`   Lines: ${pattern.lineNumbers.join(', ')}`);
    
    if (pattern.evidence.length > 0) {
      console.log(`   Evidence:`);
      pattern.evidence.forEach(evidence => {
        console.log(`     • ${evidence.content}`);
      });
    }
  });
}

async function showExecutionAnalysis(code: string, language: string) {
  console.log(chalk.bold('\n⚡ Execution-Only Analysis'));
  console.log(chalk.gray('━'.repeat(40)));
  
  try {
    const analysis = await analyzeExecutionForHallucinations(code);
    
    console.log(`Execution Success: ${analysis.executionResult.success ? '✅' : '❌'}`);
    console.log(`Memory Usage: ${analysis.executionResult.resourceUsage.memoryMB.toFixed(2)}MB`);
    console.log(`Execution Time: ${analysis.executionResult.resourceUsage.executionTimeMs}ms`);
    
    console.log(`\nResource Hallucinations: ${analysis.resourceHallucinations.length}`);
    console.log(`Logic Hallucinations: ${analysis.logicHallucinations.length}`);
    
    [...analysis.resourceHallucinations, ...analysis.logicHallucinations].forEach((category, index) => {
      console.log(`\n${index + 1}. ${category.type}/${category.subtype}`);
      console.log(`   ${category.description}`);
      console.log(`   Severity: ${category.severity}`);
    });
    
  } catch (error) {
    console.error(chalk.red('❌ Execution analysis failed:'), error);
  }
}

async function exportDetailedReport(result: any, code: string, language: string) {
  const { outputPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'outputPath',
      message: 'Enter output file path:',
      default: `hallucination-report-${Date.now()}.json`,
    },
  ]);
  
  const report = {
    timestamp: new Date().toISOString(),
    metadata: {
      codeLength: code.length,
      language,
      analysisVersion: '1.0.0',
    },
    code: code.substring(0, 2000) + (code.length > 2000 ? '...' : ''),
    analysis: result,
  };
  
  try {
    const fs = await import('fs');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`✅ Detailed report exported to: ${outputPath}`));
  } catch (error) {
    console.error(chalk.red('❌ Export failed:'), error);
  }
}

function generateHtmlReport(report: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Code Quality Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .metric { margin: 10px 0; }
        .critical { color: #d32f2f; }
        .warning { color: #f57c00; }
        .success { color: #388e3c; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Code Quality Report</h1>
        <p>Generated: ${report.timestamp}</p>
    </div>
    
    <h2>Summary</h2>
    <div class="metric">Total Interactions: ${report.summary.totalInteractions}</div>
    <div class="metric">Coding Interactions: ${report.summary.codingInteractions}</div>
    <div class="metric">Average Hallucination Rate: ${(report.summary.avgHallucinationRate * 100).toFixed(1)}%</div>
    <div class="metric">Critical Issues: <span class="critical">${report.summary.criticalIssues}</span></div>
    
    <!-- Additional report sections would be added here -->
</body>
</html>
  `;
}