/**
 * Centralized logging utility for TokNxr application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isClient = typeof window !== 'undefined';

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const { level, message, timestamp, context } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.debug(prefix, message, context || '');
        break;
      case 'info':
        console.info(prefix, message, context || '');
        break;
      case 'warn':
        console.warn(prefix, message, context || '');
        break;
      case 'error':
        console.error(prefix, message, context || '');
        break;
    }
  }

  private async logToService(entry: LogEntry): Promise<void> {
    // In production, you might want to send logs to a service like Sentry, LogRocket, etc.
    if (!this.isClient || this.isDevelopment) return;

    try {
      // Example: Send to analytics or logging service
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // });
    } catch (error) {
      console.error('Failed to send log to service:', error);
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    const entry = this.formatMessage('debug', message, context);
    this.logToConsole(entry);
  }

  info(message: string, context?: Record<string, any>): void {
    const entry = this.formatMessage('info', message, context);
    this.logToConsole(entry);
    this.logToService(entry);
  }

  warn(message: string, context?: Record<string, any>): void {
    const entry = this.formatMessage('warn', message, context);
    this.logToConsole(entry);
    this.logToService(entry);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    const entry = {
      ...this.formatMessage('error', message, context),
      error,
    };
    this.logToConsole(entry);
    this.logToService(entry);
  }

  // Convenience methods for common scenarios
  apiError(endpoint: string, error: Error, context?: Record<string, any>): void {
    this.error(`API Error: ${endpoint}`, error, {
      endpoint,
      ...context,
    });
  }

  authError(action: string, error: Error): void {
    this.error(`Authentication Error: ${action}`, error, {
      action,
      type: 'auth',
    });
  }

  performanceLog(metric: string, value: number, context?: Record<string, any>): void {
    this.info(`Performance: ${metric}`, {
      metric,
      value,
      unit: 'ms',
      ...context,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for external use
export type { LogLevel, LogEntry };