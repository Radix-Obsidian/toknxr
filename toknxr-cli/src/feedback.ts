import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { createBox } from './ui.js';

export interface FeedbackEntry {
  id: string;
  timestamp: string;
  type: 'bug' | 'feature' | 'improvement' | 'question' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: string; // Which screen/command user was on
  title: string;
  description: string;
  steps?: string; // Steps to reproduce (for bugs)
  expected?: string; // Expected behavior (for bugs)
  actual?: string; // Actual behavior (for bugs)
  userInfo: {
    version: string;
    os: string;
    nodeVersion: string;
    terminalSize?: string;
  };
  metadata?: Record<string, any>;
  status: 'pending' | 'submitted' | 'acknowledged';
}

export interface FeedbackConfig {
  feedbackFile: string;
  submitEndpoint?: string;
  enableAnalytics: boolean;
  autoSubmit: boolean;
}

export class FeedbackManager {
  private config: FeedbackConfig;
  private feedbackFile: string;

  constructor(config?: Partial<FeedbackConfig>) {
    this.config = {
      feedbackFile: path.resolve(process.cwd(), 'toknxr-feedback.json'),
      enableAnalytics: true,
      autoSubmit: false,
      ...config
    };
    this.feedbackFile = this.config.feedbackFile;
    this.ensureFeedbackFile();
  }

  /**
   * Ensure feedback file exists with proper structure
   */
  private ensureFeedbackFile(): void {
    if (!fs.existsSync(this.feedbackFile)) {
      const initialData = {
        version: '1.0',
        feedback: [],
        stats: {
          totalSubmissions: 0,
          lastSubmission: null,
          mostCommonType: null,
          installation: new Date().toISOString()
        }
      };
      fs.writeFileSync(this.feedbackFile, JSON.stringify(initialData, null, 2));
    }
  }

  /**
   * Load existing feedback data
   */
  private loadFeedbackData(): any {
    try {
      const data = fs.readFileSync(this.feedbackFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not load feedback data, starting fresh'));
      return { version: '1.0', feedback: [], stats: {} };
    }
  }

  /**
   * Save feedback data to file
   */
  private saveFeedbackData(data: any): void {
    try {
      fs.writeFileSync(this.feedbackFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(chalk.red('Error saving feedback:'), error);
    }
  }

  /**
   * Generate unique ID for feedback entry
   */
  private generateId(): string {
    return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Collect system information
   */
  private collectSystemInfo(): FeedbackEntry['userInfo'] {
    return {
      version: '0.4.0', // Would be dynamically retrieved
      os: process.platform,
      nodeVersion: process.version,
      terminalSize: process.stdout.columns && process.stdout.rows 
        ? `${process.stdout.columns}x${process.stdout.rows}` 
        : undefined
    };
  }

  /**
   * Quick feedback - minimal friction
   */
  async quickFeedback(context: string = 'unknown'): Promise<void> {
    console.log(chalk.blue.bold('\n🗣️  Quick Feedback'));
    console.log(chalk.gray('Help us improve TokNXR with your quick thoughts!\n'));

    const { feedbackText } = await inquirer.prompt([
      {
        type: 'input',
        name: 'feedbackText',
        message: 'What would you like us to know?',
        validate: (input: string) => input.trim().length >= 5 || 'Please provide at least 5 characters'
      }
    ]);

    const { type } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What type of feedback is this?',
        choices: [
          { name: '🐛 Bug Report', value: 'bug' },
          { name: '💡 Feature Request', value: 'feature' },
          { name: '⚡ Improvement Suggestion', value: 'improvement' },
          { name: '❓ Question', value: 'question' },
          { name: '💬 Other', value: 'other' }
        ]
      }
    ]);

    const feedback: FeedbackEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type,
      severity: 'medium', // Default for quick feedback
      context,
      title: feedbackText.substring(0, 60) + (feedbackText.length > 60 ? '...' : ''),
      description: feedbackText,
      userInfo: this.collectSystemInfo(),
      status: 'pending'
    };

    this.saveFeedback(feedback);
    
    console.log(chalk.green('\n✅ Thank you! Your feedback has been saved locally.'));
    console.log(chalk.gray(`Feedback ID: ${feedback.id}`));
    
    // Optional: Ask if they want to submit immediately
    if (this.config.submitEndpoint) {
      const { submit } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'submit',
          message: 'Would you like to submit this feedback now?',
          default: false
        }
      ]);

      if (submit) {
        await this.submitFeedback(feedback.id);
      }
    }
  }

  /**
   * Detailed feedback form for complex issues
   */
  async detailedFeedback(context: string = 'unknown'): Promise<void> {
    console.log(chalk.blue.bold('\n📋 Detailed Feedback Form'));
    console.log(chalk.gray('Please provide detailed information to help us understand the issue\n'));

    // Step 1: Basic Information
    const basicInfo = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What type of feedback are you providing?',
        choices: [
          { name: '🐛 Bug Report - Something is broken', value: 'bug' },
          { name: '💡 Feature Request - I need a new feature', value: 'feature' },
          { name: '⚡ Improvement - Make existing features better', value: 'improvement' },
          { name: '❓ Question - I need help understanding something', value: 'question' },
          { name: '💬 General Feedback', value: 'other' }
        ]
      },
      {
        type: 'input',
        name: 'title',
        message: 'Brief title/summary:',
        validate: (input: string) => input.trim().length >= 10 || 'Please provide at least 10 characters'
      }
    ]);

    // Step 2: Severity (for bugs and issues)
    let severity: FeedbackEntry['severity'] = 'medium';
    if (basicInfo.type === 'bug' || basicInfo.type === 'improvement') {
      const severityPrompt = await inquirer.prompt([
        {
          type: 'list',
          name: 'severity',
          message: 'How severe is this issue?',
          choices: [
            { name: '🔥 Critical - Blocks me completely', value: 'critical' },
            { name: '⚠️  High - Major impact on my workflow', value: 'high' },
            { name: '📋 Medium - Noticeable but manageable', value: 'medium' },
            { name: '💭 Low - Minor annoyance', value: 'low' }
          ]
        }
      ]);
      severity = severityPrompt.severity;
    }

    // Step 3: Description
    const { description } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'description',
        message: 'Detailed description (this will open your default editor):',
        validate: (input: string) => input.trim().length >= 20 || 'Please provide at least 20 characters'
      }
    ]);

    // Step 4: Additional fields for bugs
    let steps, expected, actual;
    if (basicInfo.type === 'bug') {
      const bugDetails = await inquirer.prompt([
        {
          type: 'editor',
          name: 'steps',
          message: 'Steps to reproduce (optional):',
        },
        {
          type: 'input',
          name: 'expected',
          message: 'What did you expect to happen?',
        },
        {
          type: 'input',
          name: 'actual',
          message: 'What actually happened?',
        }
      ]);
      steps = bugDetails.steps;
      expected = bugDetails.expected;
      actual = bugDetails.actual;
    }

    const feedback: FeedbackEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: basicInfo.type,
      severity,
      context,
      title: basicInfo.title,
      description,
      steps,
      expected,
      actual,
      userInfo: this.collectSystemInfo(),
      status: 'pending'
    };

    this.saveFeedback(feedback);

    console.log(chalk.green('\n✅ Thank you for the detailed feedback!'));
    console.log(chalk.gray(`Feedback ID: ${feedback.id}`));
    console.log(chalk.gray(`Saved locally in: ${this.feedbackFile}`));

    // Show summary
    console.log(
      createBox(
        '📋 Feedback Summary',
        [
          `Type: ${feedback.type}`,
          `Severity: ${feedback.severity}`,
          `Title: ${feedback.title}`,
          `Context: ${feedback.context}`,
          `ID: ${feedback.id}`
        ],
        { borderColor: 'green', titleColor: 'green' }
      )
    );

    // Optional submission
    if (this.config.submitEndpoint) {
      const { submit } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'submit',
          message: 'Would you like to submit this feedback to the TokNXR team?',
          default: true
        }
      ]);

      if (submit) {
        await this.submitFeedback(feedback.id);
      }
    }
  }

  /**
   * Save feedback to local file
   */
  private saveFeedback(feedback: FeedbackEntry): void {
    const data = this.loadFeedbackData();
    data.feedback.push(feedback);
    
    // Update stats
    data.stats.totalSubmissions = (data.stats.totalSubmissions || 0) + 1;
    data.stats.lastSubmission = feedback.timestamp;
    
    // Calculate most common type
    const typeCounts = data.feedback.reduce((acc: Record<string, number>, fb: FeedbackEntry) => {
      acc[fb.type] = (acc[fb.type] || 0) + 1;
      return acc;
    }, {});
    data.stats.mostCommonType = Object.entries(typeCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0];

    this.saveFeedbackData(data);
  }

  /**
   * Submit feedback to remote endpoint
   */
  async submitFeedback(feedbackId: string): Promise<boolean> {
    if (!this.config.submitEndpoint) {
      console.log(chalk.yellow('No submit endpoint configured. Feedback saved locally.'));
      return false;
    }

    try {
      const data = this.loadFeedbackData();
      const feedback = data.feedback.find((fb: FeedbackEntry) => fb.id === feedbackId);
      
      if (!feedback) {
        console.log(chalk.red('Feedback not found'));
        return false;
      }

      console.log(chalk.blue('Submitting feedback...'));
      
      // Simulate submission (replace with actual HTTP request)
      const response = await fetch(this.config.submitEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedback,
          source: 'toknxr-cli',
          clientVersion: '0.4.0'
        })
      });

      if (response.ok) {
        // Update status
        feedback.status = 'submitted';
        this.saveFeedbackData(data);
        
        console.log(chalk.green('✅ Feedback submitted successfully!'));
        console.log(chalk.gray('Thank you for helping improve TokNXR'));
        return true;
      } else {
        console.log(chalk.yellow('Failed to submit feedback, but it\'s saved locally'));
        return false;
      }
    } catch (error) {
      console.log(chalk.yellow('Could not submit feedback right now, but it\'s saved locally'));
      console.log(chalk.gray('You can try submitting later with: toknxr feedback --submit'));
      return false;
    }
  }

  /**
   * List all feedback
   */
  listFeedback(): void {
    const data = this.loadFeedbackData();
    const feedback = data.feedback || [];

    if (feedback.length === 0) {
      console.log(chalk.yellow('No feedback entries found'));
      return;
    }

    console.log(chalk.blue.bold('\n📋 Your Feedback History'));
    console.log(chalk.gray('━'.repeat(60)));

    feedback.forEach((fb: FeedbackEntry, index: number) => {
      const statusColor = fb.status === 'submitted' ? chalk.green : 
                         fb.status === 'acknowledged' ? chalk.blue : chalk.yellow;
      const typeIcon = fb.type === 'bug' ? '🐛' : 
                      fb.type === 'feature' ? '💡' : 
                      fb.type === 'improvement' ? '⚡' : 
                      fb.type === 'question' ? '❓' : '💬';
      
      console.log(`\n${index + 1}. ${typeIcon} ${fb.title}`);
      console.log(`   ${chalk.gray('ID:')} ${fb.id}`);
      console.log(`   ${chalk.gray('Type:')} ${fb.type} | ${chalk.gray('Severity:')} ${fb.severity}`);
      console.log(`   ${chalk.gray('Date:')} ${new Date(fb.timestamp).toLocaleString()}`);
      console.log(`   ${chalk.gray('Status:')} ${statusColor(fb.status)}`);
      console.log(`   ${chalk.gray('Context:')} ${fb.context}`);
    });

    // Show stats
    console.log(chalk.blue.bold('\n📊 Stats'));
    console.log(chalk.gray('━'.repeat(30)));
    console.log(`Total feedback: ${data.stats.totalSubmissions || 0}`);
    console.log(`Most common type: ${data.stats.mostCommonType || 'N/A'}`);
    if (data.stats.lastSubmission) {
      console.log(`Last feedback: ${new Date(data.stats.lastSubmission).toLocaleDateString()}`);
    }
  }

  /**
   * Get feedback counts by status for analytics
   */
  getFeedbackStats(): { pending: number; submitted: number; total: number } {
    const data = this.loadFeedbackData();
    const feedback = data.feedback || [];
    
    return {
      pending: feedback.filter((fb: FeedbackEntry) => fb.status === 'pending').length,
      submitted: feedback.filter((fb: FeedbackEntry) => fb.status === 'submitted').length,
      total: feedback.length
    };
  }

  /**
   * Add feedback prompt to any screen (non-blocking)
   */
  addFeedbackPrompt(context: string): string {
    const stats = this.getFeedbackStats();
    const pendingCount = stats.pending > 0 ? chalk.yellow(` (${stats.pending} pending)`) : '';
    
    return chalk.gray(`\n💬 Got feedback? Run: ${chalk.cyan('toknxr feedback')} or press ${chalk.cyan('F')}${pendingCount}`);
  }

  /**
   * Handle keyboard shortcut for feedback
   */
  async handleFeedbackShortcut(context: string): Promise<void> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '⚡ Quick Feedback (30 seconds)', value: 'quick' },
          { name: '📋 Detailed Feedback Form', value: 'detailed' },
          { name: '📜 View My Feedback History', value: 'list' },
          { name: '❌ Cancel', value: 'cancel' }
        ]
      }
    ]);

    switch (action) {
      case 'quick':
        await this.quickFeedback(context);
        break;
      case 'detailed':
        await this.detailedFeedback(context);
        break;
      case 'list':
        this.listFeedback();
        break;
      case 'cancel':
        console.log(chalk.gray('Feedback cancelled'));
        break;
    }
  }
}

// Export singleton instance
export const feedbackManager = new FeedbackManager();