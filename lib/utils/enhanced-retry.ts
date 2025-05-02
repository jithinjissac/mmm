import { isOnline } from "./network-helpers"

// Error types for better classification
export type ErrorCategory =
  | "NETWORK_ERROR"
  | "AUTH_ERROR"
  | "TIMEOUT_ERROR"
  | "RATE_LIMIT_ERROR"
  | "SERVER_ERROR"
  | "DATABASE_ERROR"
  | "VALIDATION_ERROR"
  | "UNKNOWN_ERROR"

// Structured error object
export interface EnhancedError extends Error {
  category: ErrorCategory
  operationId: string
  timestamp: number
  attempt: number
  maxAttempts: number
  duration: number
  originalError: any
  context?: Record<string, any>
}

// Configuration for retry operations
export interface RetryConfig {
  maxRetries: number
  initialDelay: number
  backoffFactor: number
  maxDelay?: number
  retryableCategories?: ErrorCategory[]
  logFunction?: (message: string, error?: any) => void
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  maxDelay: 30000,
  retryableCategories: ["NETWORK_ERROR", "TIMEOUT_ERROR", "RATE_LIMIT_ERROR", "SERVER_ERROR"],
  logFunction: console.log,
}

/**
 * Categorize an error based on its properties and message
 */
export function categorizeError(error: any): ErrorCategory {
  // Check if we're offline first
  if (!isOnline()) {
    return "NETWORK_ERROR"
  }

  // Check for network errors
  if (
    error.name === "TypeError" ||
    error.name === "NetworkError" ||
    error.message?.includes("network") ||
    error.message?.includes("fetch") ||
    error.message?.includes("Failed to fetch") ||
    error.message?.includes("Network request failed") ||
    error.code === "NETWORK_ERROR"
  ) {
    return "NETWORK_ERROR"
  }

  // Check for timeout errors
  if (
    error.name === "TimeoutError" ||
    error.name === "AbortError" ||
    error.message?.includes("timeout") ||
    error.message?.includes("Timeout") ||
    error.message?.includes("aborted") ||
    error.code === "TIMEOUT_ERROR"
  ) {
    return "TIMEOUT_ERROR"
  }

  // Check for authentication errors
  if (
    error.status === 401 ||
    error.statusCode === 401 ||
    error.code === "UNAUTHORIZED" ||
    error.code === "auth/invalid-credential" ||
    error.message?.includes("authentication") ||
    error.message?.includes("auth") ||
    error.message?.includes("token") ||
    error.message?.includes("credential") ||
    error.message?.includes("permission") ||
    error.message?.includes("unauthorized") ||
    error.message?.includes("not authorized") ||
    error.message?.includes("not authenticated")
  ) {
    return "AUTH_ERROR"
  }

  // Check for rate limiting
  if (
    error.status === 429 ||
    error.statusCode === 429 ||
    error.code === "TOO_MANY_REQUESTS" ||
    error.message?.includes("rate limit") ||
    error.message?.includes("too many requests") ||
    error.message?.includes("throttle")
  ) {
    return "RATE_LIMIT_ERROR"
  }

  // Check for server errors
  if (
    (error.status && error.status >= 500 && error.status < 600) ||
    (error.statusCode && error.statusCode >= 500 && error.statusCode < 600) ||
    error.message?.includes("server error") ||
    error.message?.includes("internal error")
  ) {
    return "SERVER_ERROR"
  }

  // Check for database errors
  if (
    error.code?.startsWith("23") || // PostgreSQL error codes
    error.code?.startsWith("42") || // SQL error codes
    error.message?.includes("database") ||
    error.message?.includes("sql") ||
    error.message?.includes("query") ||
    error.message?.includes("duplicate key") ||
    error.message?.includes("violates") ||
    error.message?.includes("constraint")
  ) {
    return "DATABASE_ERROR"
  }

  // Check for validation errors
  if (
    error.name === "ValidationError" ||
    error.message?.includes("validation") ||
    error.message?.includes("invalid") ||
    error.message?.includes("required field") ||
    error.message?.includes("must be")
  ) {
    return "VALIDATION_ERROR"
  }

  // Default to unknown error
  return "UNKNOWN_ERROR"
}

/**
 * Create an enhanced error object with detailed information
 */
export function createEnhancedError(
  originalError: any,
  operationId: string,
  attempt: number,
  maxAttempts: number,
  startTime: number,
  context?: Record<string, any>,
): EnhancedError {
  const now = Date.now()
  const category = categorizeError(originalError)

  // Create a new error that extends the original
  const enhancedError = new Error(originalError.message || "Unknown error") as EnhancedError

  // Copy properties from original error
  if (originalError.stack) {
    enhancedError.stack = originalError.stack
  }
  if (originalError.name) {
    enhancedError.name = originalError.name
  }

  // Add enhanced properties
  enhancedError.category = category
  enhancedError.operationId = operationId
  enhancedError.timestamp = now
  enhancedError.attempt = attempt
  enhancedError.maxAttempts = maxAttempts
  enhancedError.duration = now - startTime
  enhancedError.originalError = originalError
  enhancedError.context = context

  return enhancedError
}

/**
 * Format an error for logging
 */
export function formatErrorForLogging(error: EnhancedError): string {
  const timestamp = new Date(error.timestamp).toISOString()
  const durationMs = error.duration

  return [
    `[${timestamp}] Operation '${error.operationId}' failed:`,
    `  Category: ${error.category}`,
    `  Attempt: ${error.attempt}/${error.maxAttempts}`,
    `  Duration: ${durationMs}ms`,
    `  Message: ${error.message}`,
    error.context ? `  Context: ${JSON.stringify(error.context)}` : "",
    `  Stack: ${error.stack?.split("\n").slice(0, 3).join("\n    ") || "No stack trace"}`,
  ]
    .filter(Boolean)
    .join("\n")
}

/**
 * Log an error with detailed information
 */
export function logError(operationId: string, error: any, context?: Record<string, any>) {
  console.error(`[ERROR] ${operationId}:`, error, context || {})

  // Return the error for chaining
  return error
}

/**
 * Enhanced retry operation with detailed error information
 */
export async function retryWithEnhancedLogging<T>(
  operationId: string,
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context?: Record<string, any>,
): Promise<T> {
  // Merge provided config with defaults
  const fullConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  const { maxRetries, initialDelay, backoffFactor, maxDelay, retryableCategories, logFunction } = fullConfig

  let delay = initialDelay
  let lastError: EnhancedError | null = null

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    const startTime = Date.now()

    try {
      // Attempt the operation
      return await operation()
    } catch (error: any) {
      // Create enhanced error
      const enhancedError = createEnhancedError(error, operationId, attempt, maxRetries + 1, startTime, context)

      lastError = enhancedError

      // Log the error with detailed information
      logFunction(formatErrorForLogging(enhancedError), enhancedError)

      // Check if we've reached max retries
      if (attempt > maxRetries) {
        logFunction(`Operation '${operationId}' failed permanently after ${maxRetries + 1} attempts`)
        throw enhancedError
      }

      // Check if this error category is retryable
      if (retryableCategories && !retryableCategories.includes(enhancedError.category)) {
        logFunction(`Operation '${operationId}' failed with non-retryable error category '${enhancedError.category}'`)
        throw enhancedError
      }

      // Calculate next delay with exponential backoff, capped at maxDelay
      delay = Math.min(delay * backoffFactor, maxDelay || Number.MAX_SAFE_INTEGER)

      // Special handling for rate limiting - use longer delays
      if (enhancedError.category === "RATE_LIMIT_ERROR") {
        delay = Math.max(delay, 5000) // At least 5 seconds for rate limit errors
      }

      // Log retry attempt
      logFunction(
        `Operation '${operationId}' failed (attempt ${attempt}/${maxRetries + 1}), ` +
          `retrying in ${delay}ms... [${enhancedError.category}]`,
      )

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // This should never happen due to the throw in the loop above
  throw lastError || new Error(`Unknown error in retry operation '${operationId}'`)
}

/**
 * Create a telemetry event for error tracking
 */
export function createErrorTelemetry(error: EnhancedError): Record<string, any> {
  return {
    eventName: "operation_error",
    timestamp: new Date(error.timestamp).toISOString(),
    operationId: error.operationId,
    category: error.category,
    message: error.message,
    attempt: error.attempt,
    maxAttempts: error.maxAttempts,
    duration: error.duration,
    context: error.context,
    // Don't include stack trace or original error in telemetry to avoid PII
  }
}

/**
 * Track error telemetry (stub implementation - replace with your telemetry system)
 */
export function trackErrorTelemetry(error: EnhancedError): void {
  // This is a stub - replace with your actual telemetry implementation
  // Example: send to a telemetry service
  const telemetryData = createErrorTelemetry(error)

  // For now, just log to console in development
  if (process.env.NODE_ENV === "development") {
    console.info("Error Telemetry:", telemetryData)
  }

  // In a real implementation, you would send this to your telemetry service
  // Example: await fetch('/api/telemetry', { method: 'POST', body: JSON.stringify(telemetryData) })
}

/**
 * Create a logger that includes operation context
 */
export function createContextLogger(
  baseLogger: (message: string, error?: any) => void = console.log,
  context: Record<string, any> = {},
) {
  return (message: string, error?: any) => {
    const contextStr = Object.keys(context).length
      ? ` [${Object.entries(context)
          .map(([k, v]) => `${k}=${v}`)
          .join(", ")}]`
      : ""

    baseLogger(`${message}${contextStr}`, error)
  }
}

/**
 * Export retryOperation as an alias for retryWithEnhancedLogging for backward compatibility
 */
export const retryOperation = retryWithEnhancedLogging
