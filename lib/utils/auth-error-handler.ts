// Custom auth error type
export interface AuthError extends Error {
  code: string
  status?: number
  details?: any
}

// Create a custom auth error
export function createAuthError({
  message,
  code = "unknown",
  status,
  details,
}: {
  message: string
  code?: string
  status?: number
  details?: any
}): AuthError {
  const error = new Error(message) as AuthError
  error.code = code
  error.status = status
  error.details = details
  error.name = "AuthError"
  return error
}

// Check if an error is an auth error
export function isAuthError(error: any): error is AuthError {
  return (
    error &&
    (error.name === "AuthError" ||
      error.code === "unauthorized" ||
      error.code === "forbidden" ||
      error.code === "network" ||
      error.message?.includes("Not authenticated"))
  )
}

// Log auth errors
export function logAuthError(error: Error, source: string): void {
  const errorDetails = isAuthError(error)
    ? {
        message: error.message,
        code: (error as AuthError).code,
        status: (error as AuthError).status,
        details: (error as AuthError).details,
      }
    : { message: error.message }

  console.error(`[${source}] Authentication error (${errorDetails.code || "unknown"}):`, error.message, errorDetails)
}

// Handle auth errors
export function handleAuthError(error: Error): { message: string; action?: string } {
  if (isAuthError(error)) {
    const authError = error as AuthError

    switch (authError.code) {
      case "unauthorized":
        return { message: "You need to be logged in to access this page.", action: "login" }
      case "forbidden":
        return { message: "You don't have permission to access this page.", action: "dashboard" }
      case "network":
        return { message: "Network error. Please check your connection and try again.", action: "retry" }
      default:
        return { message: authError.message || "An authentication error occurred.", action: "retry" }
    }
  }

  // Generic error handling
  if (error.message?.includes("fetch") || error.message?.includes("network")) {
    return { message: "Network error. Please check your connection and try again.", action: "retry" }
  }

  return { message: "An unexpected error occurred. Please try again later.", action: "retry" }
}
