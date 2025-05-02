// Circuit breaker state
type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN"

interface CircuitBreakerOptions {
  failureThreshold: number
  resetTimeout: number
  halfOpenSuccessThreshold: number
}

export class CircuitBreaker {
  private state: CircuitBreakerState = "CLOSED"
  private failureCount = 0
  private successCount = 0
  private lastFailureTime = 0
  private readonly options: CircuitBreakerOptions

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold: 3,
      resetTimeout: 30000, // 30 seconds
      halfOpenSuccessThreshold: 2,
      ...options,
    }
  }

  async execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
        this.state = "HALF_OPEN"
        this.successCount = 0
      } else if (fallback) {
        return fallback()
      } else {
        throw new Error("Circuit is OPEN")
      }
    }

    try {
      const result = await operation()

      if (this.state === "HALF_OPEN") {
        this.successCount++
        if (this.successCount >= this.options.halfOpenSuccessThreshold) {
          this.reset()
        }
      }

      return result
    } catch (error) {
      this.recordFailure()

      if (fallback) {
        return fallback()
      }

      throw error
    }
  }

  private recordFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if ((this.state === "CLOSED" && this.failureCount >= this.options.failureThreshold) || this.state === "HALF_OPEN") {
      this.state = "OPEN"
    }
  }

  reset() {
    this.state = "CLOSED"
    this.failureCount = 0
    this.successCount = 0
  }

  getState(): CircuitBreakerState {
    return this.state
  }
}

// Create a singleton instance for each operation
const circuitBreakers: Record<string, CircuitBreaker> = {}

export function getCircuitBreaker(operationKey: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
  if (!circuitBreakers[operationKey]) {
    circuitBreakers[operationKey] = new CircuitBreaker(options)
  }
  return circuitBreakers[operationKey]
}

export async function executeWithCircuitBreaker<T>(
  operationKey: string,
  operation: () => Promise<T>,
  fallback?: () => Promise<T>,
  options?: Partial<CircuitBreakerOptions>,
): Promise<T> {
  const circuitBreaker = getCircuitBreaker(operationKey, options)
  return circuitBreaker.execute(operation, fallback)
}
