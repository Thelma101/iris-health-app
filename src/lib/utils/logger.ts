/**
 * Centralized Logging Utility for MedTrack
 * 
 * Features:
 * - Environment-aware (auto-disabled in production)
 * - Multiple log levels (debug, info, warn, error)
 * - Timestamps and component identifiers
 * - Performance metrics tracking
 * - API call logging
 * - User interaction tracking
 * - Easily configurable via environment variables
 * 
 * Usage:
 *   import { logger, usePageLogger, usePerformanceLogger } from '@/lib/utils/logger';
 *   logger.info('MyComponent', 'Initialized', { data: someData });
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// Configuration
interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  includeTimestamp: boolean;
  includeStackTrace: boolean;
  colorOutput: boolean;
  persistToStorage: boolean;
  maxStoredLogs: number;
}

// Log entry structure
interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  component: string;
  message: string;
  data?: unknown;
  stack?: string;
}

// Performance metric entry
interface PerformanceEntry {
  id: string;
  component: string;
  metric: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

// Default configuration - DISABLED in production
const defaultConfig: LoggerConfig = {
  enabled: process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true',
  level: process.env.NEXT_PUBLIC_LOG_LEVEL 
    ? parseInt(process.env.NEXT_PUBLIC_LOG_LEVEL) 
    : LogLevel.DEBUG,
  includeTimestamp: true,
  includeStackTrace: false,
  colorOutput: true,
  persistToStorage: false,
  maxStoredLogs: 500,
};

// Color codes for different log levels
const levelColors = {
  DEBUG: '#9E9E9E',
  INFO: '#2196F3',
  WARN: '#FF9800',
  ERROR: '#F44336',
};

const levelEmojis = {
  DEBUG: '🔍',
  INFO: 'ℹ️',
  WARN: '⚠️',
  ERROR: '❌',
};

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private performanceMetrics: Map<string, PerformanceEntry> = new Map();
  private apiCallTimings: Map<string, number> = new Map();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Configuration methods
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  enable(): void {
    this.config.enabled = true;
  }

  disable(): void {
    this.config.enabled = false;
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  // Format timestamp
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 23);
  }

  // Format log message
  private formatMessage(
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
    component: string,
    message: string,
    data?: unknown
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      component,
      message,
      data,
    };

    if (this.config.includeStackTrace && level === 'ERROR') {
      entry.stack = new Error().stack;
    }

    return entry;
  }

  // Core logging method
  private log(
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
    component: string,
    message: string,
    data?: unknown
  ): void {
    if (!this.config.enabled) return;
    if (LogLevel[level] < this.config.level) return;

    const entry = this.formatMessage(level, component, message, data);

    // Store log if persistence is enabled
    if (this.config.persistToStorage) {
      this.logs.push(entry);
      if (this.logs.length > this.config.maxStoredLogs) {
        this.logs.shift();
      }
    }

    // Console output
    const emoji = levelEmojis[level];
    const color = levelColors[level];
    const prefix = this.config.includeTimestamp 
      ? `[${entry.timestamp}]` 
      : '';
    
    const componentTag = `[${component}]`;
    
    if (this.config.colorOutput && typeof window !== 'undefined') {
      const style = `color: ${color}; font-weight: bold;`;
      
      if (data !== undefined) {
        console.groupCollapsed(
          `%c${emoji} ${prefix} ${componentTag} ${message}`,
          style
        );
        console.log('Data:', data);
        if (entry.stack) {
          console.log('Stack:', entry.stack);
        }
        console.groupEnd();
      } else {
        console.log(`%c${emoji} ${prefix} ${componentTag} ${message}`, style);
      }
    } else {
      // Server-side or no color
      const logFn = level === 'ERROR' ? console.error 
        : level === 'WARN' ? console.warn 
        : console.log;
      
      if (data !== undefined) {
        logFn(`${emoji} ${prefix} ${componentTag} ${message}`, data);
      } else {
        logFn(`${emoji} ${prefix} ${componentTag} ${message}`);
      }
    }
  }

  // Public logging methods
  debug(component: string, message: string, data?: unknown): void {
    this.log('DEBUG', component, message, data);
  }

  info(component: string, message: string, data?: unknown): void {
    this.log('INFO', component, message, data);
  }

  warn(component: string, message: string, data?: unknown): void {
    this.log('WARN', component, message, data);
  }

  error(component: string, message: string, data?: unknown): void {
    this.log('ERROR', component, message, data);
  }

  // Lifecycle logging
  mount(component: string, props?: unknown): void {
    this.info(component, '🚀 Component mounted', props);
  }

  unmount(component: string): void {
    this.debug(component, '🔚 Component unmounted');
  }

  render(component: string, renderCount?: number): void {
    this.debug(component, `🔄 Rendered${renderCount ? ` (count: ${renderCount})` : ''}`);
  }

  // State change logging
  stateChange(component: string, stateName: string, oldValue: unknown, newValue: unknown): void {
    this.debug(component, `📊 State changed: ${stateName}`, { 
      from: oldValue, 
      to: newValue 
    });
  }

  // User interaction logging
  click(component: string, elementId: string, data?: unknown): void {
    this.info(component, `👆 Click: ${elementId}`, data);
  }

  formSubmit(component: string, formId: string, data?: unknown): void {
    this.info(component, `📝 Form submitted: ${formId}`, data);
  }

  navigation(component: string, from: string, to: string): void {
    this.info(component, `🧭 Navigation: ${from} → ${to}`);
  }

  // API call logging
  apiRequest(component: string, endpoint: string, method: string, body?: unknown): string {
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.apiCallTimings.set(requestId, performance.now());
    
    this.info(component, `📤 API Request: ${method} ${endpoint}`, { 
      requestId, 
      body: body ? '(body present)' : undefined 
    });
    
    return requestId;
  }

  apiResponse(component: string, endpoint: string, requestId: string, status: number, data?: unknown): void {
    const startTime = this.apiCallTimings.get(requestId);
    const duration = startTime ? Math.round(performance.now() - startTime) : 0;
    this.apiCallTimings.delete(requestId);

    const level = status >= 400 ? 'ERROR' : status >= 300 ? 'WARN' : 'INFO';
    const emoji = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
    
    this.log(level, component, `📥 API Response: ${endpoint} [${status}] (${duration}ms)`, {
      requestId,
      status,
      duration: `${duration}ms`,
      data: data ? '(data present)' : undefined,
    });
  }

  apiError(component: string, endpoint: string, requestId: string, error: unknown): void {
    const startTime = this.apiCallTimings.get(requestId);
    const duration = startTime ? Math.round(performance.now() - startTime) : 0;
    this.apiCallTimings.delete(requestId);

    this.error(component, `💥 API Error: ${endpoint} (${duration}ms)`, {
      requestId,
      error: error instanceof Error ? error.message : error,
      duration: `${duration}ms`,
    });
  }

  // Performance logging
  startTimer(component: string, metric: string): string {
    const id = `${component}-${metric}-${Date.now()}`;
    this.performanceMetrics.set(id, {
      id,
      component,
      metric,
      startTime: performance.now(),
    });
    this.debug(component, `⏱️ Timer started: ${metric}`);
    return id;
  }

  endTimer(id: string): number {
    const entry = this.performanceMetrics.get(id);
    if (!entry) {
      this.warn('Logger', `Timer not found: ${id}`);
      return 0;
    }

    entry.endTime = performance.now();
    entry.duration = Math.round(entry.endTime - entry.startTime);
    
    this.info(entry.component, `⏱️ Timer ended: ${entry.metric}`, {
      duration: `${entry.duration}ms`,
    });

    this.performanceMetrics.delete(id);
    return entry.duration;
  }

  // Page load performance
  pageLoad(pageName: string, loadTime?: number): void {
    const time = loadTime ?? (typeof window !== 'undefined' ? performance.now() : 0);
    this.info(pageName, `📄 Page loaded`, { 
      loadTime: `${Math.round(time)}ms`,
      url: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
    });
  }

  // Get stored logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Clear stored logs
  clearLogs(): void {
    this.logs = [];
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Table display for debugging
  table(component: string, label: string, data: unknown[]): void {
    if (!this.config.enabled) return;
    console.log(`%c[${component}] ${label}:`, 'color: #2196F3; font-weight: bold;');
    console.table(data);
  }

  // Group logs
  group(component: string, label: string, collapsed = true): void {
    if (!this.config.enabled) return;
    if (collapsed) {
      console.groupCollapsed(`%c[${component}] ${label}`, 'color: #9C27B0; font-weight: bold;');
    } else {
      console.group(`%c[${component}] ${label}`, 'color: #9C27B0; font-weight: bold;');
    }
  }

  groupEnd(): void {
    if (!this.config.enabled) return;
    console.groupEnd();
  }
}

// Create singleton instance
export const logger = new Logger();

// Export class for custom instances
export { Logger };
export type { LoggerConfig, LogEntry, PerformanceEntry };

// Convenience exports for direct imports
export const {
  debug,
  info,
  warn,
  error,
  mount,
  unmount,
  render,
  stateChange,
  click,
  formSubmit,
  navigation,
  apiRequest,
  apiResponse,
  apiError,
  startTimer,
  endTimer,
  pageLoad,
} = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  mount: logger.mount.bind(logger),
  unmount: logger.unmount.bind(logger),
  render: logger.render.bind(logger),
  stateChange: logger.stateChange.bind(logger),
  click: logger.click.bind(logger),
  formSubmit: logger.formSubmit.bind(logger),
  navigation: logger.navigation.bind(logger),
  apiRequest: logger.apiRequest.bind(logger),
  apiResponse: logger.apiResponse.bind(logger),
  apiError: logger.apiError.bind(logger),
  startTimer: logger.startTimer.bind(logger),
  endTimer: logger.endTimer.bind(logger),
  pageLoad: logger.pageLoad.bind(logger),
};

// Default export
export default logger;
