"use client"

import { useState, useCallback } from "react"
import { retryWithEnhancedLogging, type RetryConfig } from "@/lib/utils/enhanced-retry"

interface UseRetryOperationOptions<T> extends Partial<RetryConfig> {
  onSuccess?: (result: T) => void
  onError?: (error: any) => void
  onRetry?: (attempt: number, delay: number) => void
}

interface RetryOperationState<T> {
  data: T | null
  error: any | null
  isLoading: boolean
  attempt: number
  maxAttempts: number
}

// Add this export to fix the import error
export async function retryOperation<T>(
  operationId: string,
  operation: () => Promise<T>,
  options: Partial<RetryConfig> = {},
): Promise<T> {
  // This is a simplified version that doesn't use React state
  // It directly uses the enhanced retry utility
  return retryWithEnhancedLogging(operationId, operation, options)
}

export function useRetryOperation<T>(
  operationId: string,
  operation: () => Promise<T>,
  options: UseRetryOperationOptions<T> = {},
) {
  const [state, setState] = useState<RetryOperationState<T>>({
    data: null,
    error: null,
    isLoading: false,
    attempt: 0,
    maxAttempts: options.maxRetries || 3,
  })

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null, attempt: 0 }))

    try {
      // Create custom log function to track attempts
      const logFunction = (message: string, error?: any) => {
        // Extract attempt info from message
        const attemptMatch = message.match(/attempt (\d+)\/(\d+)/)
        if (attemptMatch) {
          const attempt = Number.parseInt(attemptMatch[1])
          const maxAttempts = Number.parseInt(attemptMatch[2])

          setState((prev) => ({ ...prev, attempt, maxAttempts }))

          // Call onRetry if provided
          if (options.onRetry && message.includes("retrying in")) {
            const delayMatch = message.match(/retrying in (\d+)ms/)
            const delay = delayMatch ? Number.parseInt(delayMatch[1]) : 0
            options.onRetry(attempt, delay)
          }
        }

        // Use default console.log
        console.log(message, error)
      }

      // Execute with enhanced logging
      const result = await retryWithEnhancedLogging(operationId, operation, {
        ...options,
        logFunction,
      })

      setState((prev) => ({
        ...prev,
        data: result,
        isLoading: false,
        error: null,
      }))

      if (options.onSuccess) {
        options.onSuccess(result)
      }

      return result
    } catch (error) {
      setState((prev) => ({ ...prev, error, isLoading: false }))

      if (options.onError) {
        options.onError(error)
      }

      throw error
    }
  }, [operationId, operation, options])

  return {
    execute,
    ...state,
    reset: () =>
      setState({
        data: null,
        error: null,
        isLoading: false,
        attempt: 0,
        maxAttempts: options.maxRetries || 3,
      }),
  }
}
