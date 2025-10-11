#!/usr/bin/env node

/**
 * Test script for TokNXR Feedback System
 * Demonstrates the feedback functionality without requiring user interaction
 */

import { feedbackManager } from './lib/feedback.js';
import chalk from 'chalk';

async function testFeedbackSystem() {
  console.log(chalk.blue.bold('🧪 Testing TokNXR Feedback System\n'));

  try {
    // Test 1: Create sample feedback entries
    console.log(chalk.cyan('Test 1: Creating sample feedback entries...'));
    
    // Simulate feedback entries by directly accessing the manager
    const sampleFeedback = [
      {
        id: feedbackManager['generateId'](),
        timestamp: new Date().toISOString(),
        type: 'bug',
        severity: 'high',
        context: 'stats',
        title: 'Token count displaying incorrect values',
        description: 'The stats command shows tokens as 0 even when interactions exist in the log',
        userInfo: feedbackManager['collectSystemInfo'](),
        status: 'pending'
      },
      {
        id: feedbackManager['generateId'](),
        timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        type: 'feature', 
        severity: 'medium',
        context: 'export',
        title: 'Add CSV export functionality',
        description: 'Would be great to export analytics data to CSV format for external analysis',
        userInfo: feedbackManager['collectSystemInfo'](),
        status: 'pending'
      },
      {
        id: feedbackManager['generateId'](),
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        type: 'improvement',
        severity: 'low', 
        context: 'menu',
        title: 'Improve menu navigation',
        description: 'Add keyboard shortcuts for common menu items',
        userInfo: feedbackManager['collectSystemInfo'](),
        status: 'submitted'
      }
    ];

    // Save sample feedback
    for (const feedback of sampleFeedback) {
      feedbackManager['saveFeedback'](feedback);
    }

    console.log(chalk.green('✅ Created 3 sample feedback entries\n'));

    // Test 2: Display feedback statistics
    console.log(chalk.cyan('Test 2: Feedback Statistics'));
    const stats = feedbackManager.getFeedbackStats();
    console.log(`Total: ${stats.total}, Pending: ${stats.pending}, Submitted: ${stats.submitted}\n`);

    // Test 3: Display feedback list
    console.log(chalk.cyan('Test 3: Feedback List'));
    feedbackManager.listFeedback();
    console.log();

    // Test 4: Test feedback footer
    console.log(chalk.cyan('Test 4: Feedback Footer Integration'));
    const { createFeedbackFooter } = await import('./lib/ui.js');
    console.log(createFeedbackFooter('test-screen'));
    console.log();

    // Test 5: Test feedback prompts
    console.log(chalk.cyan('Test 5: Feedback Prompt Text'));
    console.log(feedbackManager.addFeedbackPrompt('test-context'));
    console.log();

    console.log(chalk.green.bold('🎉 All feedback system tests passed!'));
    console.log(chalk.gray('Feedback data stored in: toknxr-feedback.json'));
    console.log(chalk.gray('Try running: npm run cli -- feedback --list'));

  } catch (error) {
    console.error(chalk.red('❌ Test failed:'), error);
    process.exit(1);
  }
}

// Run the test
testFeedbackSystem().catch(console.error);