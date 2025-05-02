/**
 * Session helper utilities for managing authentication sessions
 */

// Get the session expiration time based on "Remember me" preference
export function getSessionExpiration(rememberMe: boolean): number {
  // Default is 1 hour, extended is 30 days
  return rememberMe ? 60 * 60 * 24 * 30 : 60 * 60
}

// Check if a session is about to expire (within the next 5 minutes)
export function isSessionExpiringSoon(expiresAt: number): boolean {
  const fiveMinutesInMs = 5 * 60 * 1000
  const expiresAtMs = expiresAt * 1000 // Convert seconds to milliseconds
  const now = Date.now()

  return expiresAtMs - now < fiveMinutesInMs
}

// Format the remaining session time in a human-readable format
export function formatSessionTimeRemaining(expiresAt: number): string {
  const expiresAtMs = expiresAt * 1000 // Convert seconds to milliseconds
  const now = Date.now()
  const remainingMs = expiresAtMs - now

  if (remainingMs <= 0) {
    return "Expired"
  }

  const minutes = Math.floor(remainingMs / (60 * 1000))

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`
  }

  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? "s" : ""}`
}
