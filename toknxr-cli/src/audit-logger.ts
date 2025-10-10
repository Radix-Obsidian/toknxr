/**
 * Enterprise Audit Logging System for TokNxr
 * Compliant audit trails for security monitoring and compliance
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import chalk from 'chalk';

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: 'success' | 'failure' | 'warning';
  details: Record<string, unknown>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceTags: string[];
  metadata: {
    version: string;
    environment: string;
    component: string;
  };
}

// Audit event types for compliance monitoring
export enum AuditEventType {
  // Authentication & Authorization
  AUTH_LOGIN = 'auth.login',
  AUTH_LOGOUT = 'auth.logout',
  AUTH_FAILED = 'auth.failed',
  AUTH_PASSWORD_CHANGE = 'auth.password_change',
  AUTH_LOCKOUT = 'auth.lockout',
  AUTH_SSO_ACCESS = 'auth.sso_access',

  // Data Access & Modification
  DATA_ACCESS = 'data.access',
  DATA_MODIFY = 'data.modify',
  DATA_DELETE = 'data.delete',
  DATA_EXPORT = 'data.export',

  // AI Interaction Monitoring
  AI_REQUEST = 'ai.request',
  AI_RESPONSE = 'ai.response',
  AI_QUALITY_ANALYSIS = 'ai.quality_analysis',
  AI_SECURITY_ALERT = 'ai.security_alert',
  AI_PERFORMANCE_METRIC = 'ai.performance_metric',

  // System & Configuration Changes
  CONFIG_CHANGE = 'config.change',
  POLICY_UPDATE = 'policy.update',
  USER_MANAGEMENT = 'user.management',

  // Security Events
  SECURITY_VIOLATION = 'security.violation',
  SECURITY_ANOMALY = 'security.anomaly',
  INTEGRITY_CHECK = 'security.integrity_check',

  // Compliance Events
  COMPLIANCE_REPORT = 'compliance.report',
  COMPLIANCE_VIOLATION = 'compliance.violation',
  AUDIT_LOG_ACCESS = 'audit.log_access',

  // Error & System Events
  ERROR_OCCURRED = 'error.occurred',
  SYSTEM_MAINTENANCE = 'system.maintenance',
  PERFORMANCE_DEGRADATION = 'performance.degradation'
}

export interface AuditConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  retentionDays: number;
  maxFileSize: number; // in MB
  encryptionEnabled: boolean;
  remoteSync: boolean;
  complianceFrameworks: string[];
  alertThresholds: {
    dailyEventLimit: number;
    riskLevelThreshold: 'medium' | 'high' | 'critical';
  };
}

export interface ComplianceReport {
  period: {
    start: string;
    end: string;
  };
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByRiskLevel: Record<string, number>;
  complianceViolations: AuditEvent[];
  riskSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
}

/**
 * Enterprise Audit Logger with compliance and security features
 */
export class EnterpriseAuditLogger {
  private config: AuditConfig;
  private logFilePath: string;
  private encryptionKey?: Buffer;
  private eventBuffer: AuditEvent[] = [];
  private bufferSize = 10; // Flush every 10 events
  private maintenanceInterval?: NodeJS.Timeout;

  constructor(config: Partial<AuditConfig> = {}) {
    this.config = {
      enabled: true,
      logLevel: 'info',
      retentionDays: 365, // 1 year retention
      maxFileSize: 100, // 100MB per file
      encryptionEnabled: false,
      remoteSync: false,
      complianceFrameworks: ['GDPR', 'SOX', 'HIPAA'],
      alertThresholds: {
        dailyEventLimit: 10000,
        riskLevelThreshold: 'high'
      },
      ...config
    };

    this.logFilePath = path.resolve(process.cwd(), 'audit.log');

    if (this.config.encryptionEnabled) {
      this.initializeEncryption();
    }

    // Initialize log file if it doesn't exist
    this.initializeLogFile();

    // Don't start maintenance immediately - only when audit logging is actively used
    // this.scheduleMaintenance();
  }

  /**
   * Log an audit event
   */
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    if (!this.config.enabled) return;

    // Start maintenance when audit logging is actively used
    this.scheduleMaintenance();

    const auditEvent: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      ...event
    };

    // Check risk level for alerting
    if (this.shouldAlert(auditEvent)) {
      this.emitAlert(auditEvent);
    }

    // Add to buffer
    this.eventBuffer.push(auditEvent);

    // Flush if buffer is full or contains high-risk events
    if (this.eventBuffer.length >= this.bufferSize ||
        auditEvent.riskLevel === 'critical' ||
        auditEvent.riskLevel === 'high') {
      this.flushBuffer();
    }
  }

  /**
   * Quick logging methods for common events
   */
  logAuthEvent(type: AuditEventType, userId: string, success: boolean, details: Record<string, unknown> = {}): void {
    this.log({
      eventType: type,
      userId,
      action: type.split('.')[1],
      resource: 'authentication',
      result: success ? 'success' : 'failure',
      riskLevel: success ? 'low' : 'medium',
      complianceTags: ['authentication', 'access_control'],
      details: {
        method: 'toknxr_cli',
        ...details
      },
      metadata: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        component: 'cli'
      }
    });
  }

  logAIEvent(type: AuditEventType, userId: string, model: string, tokens: number, cost: number, quality: number): void {
    this.log({
      eventType: type,
      userId,
      action: type.split('.')[1],
      resource: 'ai_interaction',
      resourceId: model,
      result: 'success',
      riskLevel: cost > 1.0 ? 'medium' : 'low', // Higher cost = higher risk
      complianceTags: ['ai_usage', 'cost_tracking'],
      details: {
        model,
        tokens,
        cost_usd: cost,
        quality_score: quality
      },
      metadata: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        component: 'ai_proxy'
      }
    });
  }

  logSecurityEvent(type: AuditEventType, severity: 'low' | 'medium' | 'high' | 'critical', details: Record<string, unknown>): void {
    this.log({
      eventType: type,
      action: 'security_monitoring',
      resource: 'system_security',
      result: 'warning',
      riskLevel: severity,
      complianceTags: ['security', 'monitoring'],
      details,
      metadata: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        component: 'security_monitor'
      }
    });
  }

  /**
   * Query audit events with filtering
   */
  query(options: {
    eventType?: AuditEventType;
    userId?: string;
    riskLevel?: AuditEvent['riskLevel'];
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  } = {}): AuditEvent[] {
    const events = this.loadAuditEvents();

    return events.filter(event => {
      if (options.eventType && event.eventType !== options.eventType) return false;
      if (options.userId && event.userId !== options.userId) return false;
      if (options.riskLevel && event.riskLevel !== options.riskLevel) return false;
      if (options.dateFrom && event.timestamp < options.dateFrom) return false;
      if (options.dateTo && event.timestamp > options.dateTo) return false;

      return true;
    }).slice(0, options.limit || 1000);
  }

  /**
   * Generate compliance report for specified period
   */
  generateComplianceReport(startDate: string, endDate: string): ComplianceReport {
    const events = this.query({
      dateFrom: startDate,
      dateTo: endDate
    });

    const eventsByType: Record<string, number> = {};
    const eventsByRiskLevel: Record<string, number> = {};
    const complianceViolations: AuditEvent[] = [];

    events.forEach(event => {
      // Count by type
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;

      // Count by risk level
      eventsByRiskLevel[event.riskLevel] = (eventsByRiskLevel[event.riskLevel] || 0) + 1;

      // Check for compliance violations
      if (this.isComplianceViolation(event)) {
        complianceViolations.push(event);
      }
    });

    const recommendations = this.generateRecommendations(events, complianceViolations);

    return {
      period: { start: startDate, end: endDate },
      totalEvents: events.length,
      eventsByType,
      eventsByRiskLevel,
      complianceViolations,
      riskSummary: {
        critical: eventsByRiskLevel.critical || 0,
        high: eventsByRiskLevel.high || 0,
        medium: eventsByRiskLevel.medium || 0,
        low: eventsByRiskLevel.low || 0
      },
      recommendations
    };
  }

  /**
   * Export audit logs in various formats
   */
  exportAuditData(format: 'json' | 'csv' | 'xml', options: Partial<typeof this.query.arguments[0]> = {}): string {
    const events = this.query(options);

    switch (format) {
      case 'json':
        return JSON.stringify(events, null, 2);

      case 'csv':
        return this.eventsToCSV(events);

      case 'xml':
        return this.eventsToXML(events);

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Private methods
   */
  private generateEventId(): string {
    return crypto.randomUUID();
  }

  private shouldAlert(event: AuditEvent): boolean {
    return event.riskLevel === this.config.alertThresholds.riskLevelThreshold ||
           event.riskLevel === 'critical';
  }

  private emitAlert(event: AuditEvent): void {
    console.warn(chalk.red.bold('🚨 AUDIT ALERT:'), chalk.yellow(event.eventType));
    console.warn(chalk.gray(`Risk Level: ${event.riskLevel.toUpperCase()}`));
    console.warn(chalk.gray(`Action: ${event.action}`));
    console.warn(chalk.gray(`Resource: ${event.resource}`));
    console.warn(chalk.gray(`Time: ${event.timestamp}`));

    // In a real enterprise system, this would send alerts to:
    // - SIEM systems
    // - Email notifications
    // - Incident response teams
    // - Compliance dashboards
  }

  private flushBuffer(): void {
    if (this.eventBuffer.length === 0) return;

    try {
      const eventsToWrite = [...this.eventBuffer];
      this.eventBuffer = [];

      const logEntries = eventsToWrite.map(event => {
        const entry = JSON.stringify(event);

        if (this.config.encryptionEnabled && this.encryptionKey) {
          return this.encrypt(entry);
        }

        return entry;
      }).join('\n') + '\n';

      // Check file size before writing
      this.checkFileSize();

      fs.appendFileSync(this.logFilePath, logEntries);

    } catch (error) {
      console.error('Failed to write audit logs:', error);
      // Re-add failed events back to buffer
      this.eventBuffer.unshift(...this.eventBuffer);
    }
  }

  private loadAuditEvents(): AuditEvent[] {
    try {
      if (!fs.existsSync(this.logFilePath)) return [];

      const content = fs.readFileSync(this.logFilePath, 'utf8');
      const lines = content.trim().split('\n');

      return lines.map(line => {
        try {
          let parsed: string;
          if (this.config.encryptionEnabled && this.encryptionKey) {
            parsed = this.decrypt(line);
          } else {
            parsed = line;
          }

          return JSON.parse(parsed) as AuditEvent;
        } catch {
          // Skip invalid lines but don't break the entire log
          return null;
        }
      }).filter((event): event is AuditEvent => event !== null);

    } catch (error) {
      console.error('Failed to load audit events:', error);
      return [];
    }
  }

  private initializeLogFile(): void {
    if (!fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, '');
    }
  }

  private checkFileSize(): void {
    try {
      const stats = fs.statSync(this.logFilePath);
      const fileSizeMB = stats.size / (1024 * 1024);

      if (fileSizeMB > this.config.maxFileSize) {
        this.rotateLogFile();
      }
    } catch {
      // File might not exist, that's fine
    }
  }

  private rotateLogFile(): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedPath = `${this.logFilePath}.${timestamp}.rotated`;

    try {
      fs.renameSync(this.logFilePath, rotatedPath);
      this.initializeLogFile();

      // Log rotation event
      this.log({
        eventType: AuditEventType.SYSTEM_MAINTENANCE,
        action: 'log_rotation',
        resource: 'audit_system',
        result: 'success',
        riskLevel: 'low',
        complianceTags: ['system_maintenance'],
        details: { rotatedFile: rotatedPath },
        metadata: {
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          component: 'audit_logger'
        }
      });

    } catch (error) {
      console.error('Failed to rotate audit log:', error);
    }
  }

  private scheduleMaintenance(): void {
    // Only start maintenance if not already running
    if (this.maintenanceInterval) return;
    
    // Run maintenance every hour
    this.maintenanceInterval = setInterval(() => {
      try {
        this.performMaintenance();
      } catch (error) {
        console.error('Audit maintenance failed:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Stop maintenance interval (useful for CLI commands that don't need persistent logging)
   */
  stopMaintenance(): void {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = undefined;
    }
  }

  private performMaintenance(): void {
    // Clean up old rotated files
    const retentionMs = this.config.retentionDays * 24 * 60 * 60 * 1000;

    try {
      const files = fs.readdirSync(path.dirname(this.logFilePath))
        .filter(file => file.startsWith(path.basename(this.logFilePath)) && file.includes('.rotated'));

      files.forEach(file => {
        const filePath = path.join(path.dirname(this.logFilePath), file);
        const stats = fs.statSync(filePath);

        if (Date.now() - stats.mtime.getTime() > retentionMs) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('Failed to perform audit maintenance:', error);
    }
  }

  private initializeEncryption(): void {
    const keyEnv = process.env.AUDIT_ENCRYPTION_KEY;
    if (keyEnv) {
      this.encryptionKey = Buffer.from(keyEnv, 'hex');
    } else {
      // Generate a new key (in production, this should be stored securely)
      this.encryptionKey = crypto.randomBytes(32);
      console.warn(chalk.yellow('⚠️  No AUDIT_ENCRYPTION_KEY found. Using generated key (not secure for production)'));
    }
  }

  private encrypt(text: string): string {
    if (!this.encryptionKey) return text;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    if (!this.encryptionKey) return encryptedText;

    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private isComplianceViolation(event: AuditEvent): boolean {
    // Check for various compliance rule violations
    const violations = [];

    // GDPR: Data access without consent
    if (event.eventType === AuditEventType.DATA_ACCESS &&
        !event.details.consentObtained) {
      violations.push('GDPR: Missing data consent');
    }

    // SOX: Unauthorized configuration changes
    if (event.eventType === AuditEventType.CONFIG_CHANGE &&
        event.result === 'failure') {
      violations.push('SOX: Unauthorized config change');
    }

    // HIPAA: Access to sensitive health data
    if (event.details.sensitiveDataType === 'health' &&
        !event.details.accessAuthorized) {
      violations.push('HIPAA: Unauthorized health data access');
    }

    return violations.length > 0;
  }

  private generateRecommendations(events: AuditEvent[], violations: AuditEvent[]): string[] {
    const recommendations: string[] = [];

    const highRiskCount = events.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length;
    if (highRiskCount > events.length * 0.1) {
      recommendations.push('Implement additional access controls for high-risk operations');
    }

    if (violations.length > 0) {
      recommendations.push('Review and address compliance violations in audit logs');
    }

    const authFailures = events.filter(e => e.eventType.includes('auth') && e.result === 'failure').length;
    if (authFailures > events.length * 0.05) {
      recommendations.push('Strengthen authentication controls and monitor for brute force attempts');
    }

    return recommendations;
  }

  private eventsToCSV(events: AuditEvent[]): string {
    if (events.length === 0) return '';

    const headers = Object.keys(events[0]).join(',');
    const rows = events.map(event =>
      Object.values(event).map(value =>
        typeof value === 'object' ? JSON.stringify(value) : String(value)
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  }

  private eventsToXML(events: AuditEvent[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<audit-events>\n';

    events.forEach(event => {
      xml += '  <event>\n';
      Object.entries(event).forEach(([key, value]) => {
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        xml += `    <${key}>${this.escapeXml(valueStr)}</${key}>\n`;
      });
      xml += '  </event>\n';
    });

    xml += '</audit-events>';
    return xml;
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#39;');
  }
}

// Export singleton instance for global use
export const auditLogger = new EnterpriseAuditLogger();

// Helper function to enable audit logging globally
export function initializeAuditLogging(config?: Partial<AuditConfig>): void {
  // Re-initialize with new config if provided
  if (config) {
    Object.assign(auditLogger, config);
  }

  console.log(chalk.blue('📋 Enterprise audit logging initialized'));
  console.log(chalk.gray(`   Log file: ${auditLogger['logFilePath']}`));
  console.log(chalk.gray(`   Encryption: ${auditLogger['config'].encryptionEnabled ? 'enabled' : 'disabled'}`));
  console.log(chalk.gray(`   Remote sync: ${auditLogger['config'].remoteSync ? 'enabled' : 'disabled'}`));
}
