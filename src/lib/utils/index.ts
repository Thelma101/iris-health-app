/**
 * Utility exports
 * Centralized exports for all utility functions
 */

// Logging utilities
export { 
  logger, 
  Logger, 
  LogLevel,
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
} from './logger';

export type { LoggerConfig, LogEntry, PerformanceEntry } from './logger';

// Logging hooks
export {
  usePageLogger,
  useComponentLogger,
  usePerformanceLogger,
  useApiLogger,
  useLoggedState,
  useInteractionLogger,
  useErrorLogger,
} from './logging-hooks';

// Validation utilities
export * from './validation';
