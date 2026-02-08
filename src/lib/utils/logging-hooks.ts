/**
 * React Hooks for Logging
 * 
 * Custom hooks that integrate with the centralized logger utility
 * for component lifecycle tracking, performance monitoring, and state logging.
 * 
 * Usage:
 *   const logger = usePageLogger('DashboardPage');
 *   const { trackRender, trackStateChange } = useComponentLogger('MyComponent');
 *   const { measureAsync, getMetrics } = usePerformanceLogger('PerformanceCriticalComponent');
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { logger, LogLevel } from './logger';

/**
 * Hook for page-level logging
 * Tracks page mount/unmount and provides page-scoped logging methods
 */
export function usePageLogger(pageName: string) {
  const mountTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = performance.now();
    logger.mount(pageName, { url: window.location.pathname });
    logger.pageLoad(pageName, mountTimeRef.current);

    return () => {
      const duration = Math.round(performance.now() - mountTimeRef.current);
      logger.unmount(pageName);
      logger.debug(pageName, `Page session duration: ${duration}ms`);
    };
  }, [pageName]);

  // Track renders
  useEffect(() => {
    renderCountRef.current += 1;
    if (renderCountRef.current > 1) {
      logger.render(pageName, renderCountRef.current);
    }
  });

  return {
    info: (message: string, data?: unknown) => logger.info(pageName, message, data),
    warn: (message: string, data?: unknown) => logger.warn(pageName, message, data),
    error: (message: string, data?: unknown) => logger.error(pageName, message, data),
    debug: (message: string, data?: unknown) => logger.debug(pageName, message, data),
    click: (elementId: string, data?: unknown) => logger.click(pageName, elementId, data),
    formSubmit: (formId: string, data?: unknown) => logger.formSubmit(pageName, formId, data),
    navigate: (to: string) => logger.navigation(pageName, window.location.pathname, to),
    getRenderCount: () => renderCountRef.current,
  };
}

/**
 * Hook for component-level logging
 * Tracks individual component lifecycle and state changes
 */
export function useComponentLogger(componentName: string, props?: unknown) {
  const renderCountRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(false);
  const prevPropsRef = useRef<unknown>(props);

  // Track mount/unmount
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      logger.mount(componentName, props);
    }

    return () => {
      logger.unmount(componentName);
    };
  }, [componentName, props]);

  // Track renders
  useEffect(() => {
    renderCountRef.current += 1;
    if (renderCountRef.current > 1) {
      // Log props changes if they changed
      if (JSON.stringify(prevPropsRef.current) !== JSON.stringify(props)) {
        logger.debug(componentName, 'Props changed', {
          previous: prevPropsRef.current,
          current: props,
        });
      }
      logger.render(componentName, renderCountRef.current);
    }
    prevPropsRef.current = props;
  });

  // Track state changes
  const trackStateChange = useCallback(
    (stateName: string, oldValue: unknown, newValue: unknown) => {
      logger.stateChange(componentName, stateName, oldValue, newValue);
    },
    [componentName]
  );

  // Track render explicitly
  const trackRender = useCallback(
    (additionalInfo?: unknown) => {
      logger.render(componentName, renderCountRef.current);
      if (additionalInfo) {
        logger.debug(componentName, 'Render info', additionalInfo);
      }
    },
    [componentName]
  );

  return {
    trackStateChange,
    trackRender,
    log: {
      info: (message: string, data?: unknown) => logger.info(componentName, message, data),
      warn: (message: string, data?: unknown) => logger.warn(componentName, message, data),
      error: (message: string, data?: unknown) => logger.error(componentName, message, data),
      debug: (message: string, data?: unknown) => logger.debug(componentName, message, data),
    },
    getRenderCount: () => renderCountRef.current,
  };
}

/**
 * Hook for performance logging
 * Provides tools for measuring operation durations
 */
export function usePerformanceLogger(componentName: string) {
  const timersRef = useRef<Map<string, string>>(new Map());
  const metricsRef = useRef<Map<string, number[]>>(new Map());

  // Start a timer
  const startTimer = useCallback(
    (metricName: string): string => {
      const timerId = logger.startTimer(componentName, metricName);
      timersRef.current.set(metricName, timerId);
      return timerId;
    },
    [componentName]
  );

  // End a timer by metric name
  const endTimer = useCallback(
    (metricName: string): number => {
      const timerId = timersRef.current.get(metricName);
      if (!timerId) {
        logger.warn(componentName, `Timer not found for metric: ${metricName}`);
        return 0;
      }

      const duration = logger.endTimer(timerId);
      timersRef.current.delete(metricName);

      // Store for averaging
      if (!metricsRef.current.has(metricName)) {
        metricsRef.current.set(metricName, []);
      }
      metricsRef.current.get(metricName)!.push(duration);

      return duration;
    },
    [componentName]
  );

  // Measure an async operation
  const measureAsync = useCallback(
    async <T>(metricName: string, operation: () => Promise<T>): Promise<T> => {
      const timerId = startTimer(metricName);
      try {
        const result = await operation();
        endTimer(metricName);
        return result;
      } catch (error) {
        endTimer(metricName);
        logger.error(componentName, `Error in measured operation: ${metricName}`, error);
        throw error;
      }
    },
    [componentName, startTimer, endTimer]
  );

  // Measure a sync operation
  const measureSync = useCallback(
    <T>(metricName: string, operation: () => T): T => {
      startTimer(metricName);
      try {
        const result = operation();
        endTimer(metricName);
        return result;
      } catch (error) {
        endTimer(metricName);
        logger.error(componentName, `Error in measured operation: ${metricName}`, error);
        throw error;
      }
    },
    [componentName, startTimer, endTimer]
  );

  // Get metrics summary
  const getMetrics = useCallback((): Record<string, { avg: number; min: number; max: number; count: number }> => {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    metricsRef.current.forEach((values, key) => {
      if (values.length > 0) {
        summary[key] = {
          avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        };
      }
    });

    return summary;
  }, []);

  // Log metrics summary
  const logMetricsSummary = useCallback(() => {
    const metrics = getMetrics();
    logger.table(componentName, 'Performance Metrics', 
      Object.entries(metrics).map(([name, stats]) => ({ name, ...stats }))
    );
  }, [componentName, getMetrics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      logMetricsSummary();
    };
  }, [logMetricsSummary]);

  return {
    startTimer,
    endTimer,
    measureAsync,
    measureSync,
    getMetrics,
    logMetricsSummary,
  };
}

/**
 * Hook for API call logging
 * Provides wrapped fetch with automatic logging
 */
export function useApiLogger(componentName: string) {
  const pendingRequestsRef = useRef<Map<string, string>>(new Map());

  // Logged fetch wrapper
  const loggedFetch = useCallback(
    async <T>(
      endpoint: string,
      options: RequestInit = {},
      parseAs: 'json' | 'text' | 'blob' = 'json'
    ): Promise<T> => {
      const method = options.method || 'GET';
      const requestId = logger.apiRequest(componentName, endpoint, method, options.body);
      pendingRequestsRef.current.set(requestId, endpoint);

      try {
        const response = await fetch(endpoint, options);
        
        let data: T;
        switch (parseAs) {
          case 'text':
            data = await response.text() as T;
            break;
          case 'blob':
            data = await response.blob() as T;
            break;
          default:
            data = await response.json();
        }

        logger.apiResponse(componentName, endpoint, requestId, response.status, data);
        pendingRequestsRef.current.delete(requestId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
      } catch (error) {
        logger.apiError(componentName, endpoint, requestId, error);
        pendingRequestsRef.current.delete(requestId);
        throw error;
      }
    },
    [componentName]
  );

  // Get pending requests count
  const getPendingCount = useCallback(() => pendingRequestsRef.current.size, []);

  return {
    loggedFetch,
    getPendingCount,
    logRequest: (endpoint: string, method: string, body?: unknown) => 
      logger.apiRequest(componentName, endpoint, method, body),
    logResponse: (endpoint: string, requestId: string, status: number, data?: unknown) => 
      logger.apiResponse(componentName, endpoint, requestId, status, data),
    logError: (endpoint: string, requestId: string, error: unknown) => 
      logger.apiError(componentName, endpoint, requestId, error),
  };
}

/**
 * Hook for tracking state with automatic logging
 * Wraps useState with change logging
 */
export function useLoggedState<T>(
  componentName: string,
  stateName: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialValue);
  const isFirstRender = useRef(true);

  const setLoggedState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prevState) => {
        const newValue = typeof value === 'function' 
          ? (value as (prev: T) => T)(prevState) 
          : value;
        
        if (!isFirstRender.current) {
          logger.stateChange(componentName, stateName, prevState, newValue);
        }
        
        return newValue;
      });
    },
    [componentName, stateName]
  );

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return [state, setLoggedState];
}

/**
 * Hook for logging user interactions
 */
export function useInteractionLogger(componentName: string) {
  const logClick = useCallback(
    (elementId: string, data?: unknown) => {
      logger.click(componentName, elementId, data);
    },
    [componentName]
  );

  const logFormSubmit = useCallback(
    (formId: string, data?: unknown) => {
      logger.formSubmit(componentName, formId, data);
    },
    [componentName]
  );

  const logNavigation = useCallback(
    (from: string, to: string) => {
      logger.navigation(componentName, from, to);
    },
    [componentName]
  );

  const logInput = useCallback(
    (inputId: string, value: unknown) => {
      logger.debug(componentName, `Input changed: ${inputId}`, { value });
    },
    [componentName]
  );

  // Create onClick handler factory
  const createClickHandler = useCallback(
    (elementId: string, handler?: () => void, data?: unknown) => {
      return () => {
        logClick(elementId, data);
        handler?.();
      };
    },
    [logClick]
  );

  // Create onSubmit handler factory
  const createSubmitHandler = useCallback(
    (formId: string, handler: (e: React.FormEvent) => void | Promise<void>) => {
      return (e: React.FormEvent) => {
        logFormSubmit(formId);
        return handler(e);
      };
    },
    [logFormSubmit]
  );

  return {
    logClick,
    logFormSubmit,
    logNavigation,
    logInput,
    createClickHandler,
    createSubmitHandler,
  };
}

/**
 * Hook for error boundary logging
 */
export function useErrorLogger(componentName: string) {
  const logError = useCallback(
    (error: Error, errorInfo?: React.ErrorInfo) => {
      logger.error(componentName, 'React Error', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
      });
    },
    [componentName]
  );

  const logUnhandledRejection = useCallback(
    (event: PromiseRejectionEvent) => {
      logger.error(componentName, 'Unhandled Promise Rejection', {
        reason: event.reason,
      });
    },
    [componentName]
  );

  // Setup global error handlers
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logger.error(componentName, 'Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', logUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', logUnhandledRejection);
    };
  }, [componentName, logUnhandledRejection]);

  return {
    logError,
    logUnhandledRejection,
  };
}

// Export all hooks
export default {
  usePageLogger,
  useComponentLogger,
  usePerformanceLogger,
  useApiLogger,
  useLoggedState,
  useInteractionLogger,
  useErrorLogger,
};
