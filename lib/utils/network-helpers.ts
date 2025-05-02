// Check if the browser is online
export function isOnline(): boolean {
  if (typeof navigator !== "undefined" && "onLine" in navigator) {
    return navigator.onLine
  }
  return true // Default to true if we can't determine
}

/**
 * Export isBrowserOnline as an alias for isOnline for backward compatibility
 */
export const isBrowserOnline = isOnline

// Add event listeners for online/offline events
export function setupNetworkListeners(onOnline: () => void, onOffline: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }

  window.addEventListener("online", onOnline)
  window.addEventListener("offline", onOffline)

  return () => {
    window.removeEventListener("online", onOnline)
    window.removeEventListener("offline", onOffline)
  }
}

// Check if a URL is reachable
export async function isUrlReachable(url: string, timeout = 5000): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return true
  } catch (error) {
    return false
  }
}

// Retry a function with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000,
  backoffFactor = 2,
): Promise<T> {
  let retries = 0
  let delay = initialDelay

  while (true) {
    try {
      return await fn()
    } catch (error) {
      if (retries >= maxRetries) {
        throw error
      }

      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= backoffFactor
      retries++
    }
  }
}
