import { isOnline, isUrlReachable } from "./network-helpers"
import { addErrorLog } from "@/components/dev/error-log-viewer"

// Network status
export type NetworkStatus = {
  online: boolean
  supabaseReachable: boolean
  apiReachable: boolean
  lastChecked: number
}

// Default status
const networkStatus: NetworkStatus = {
  online: true,
  supabaseReachable: true,
  apiReachable: true,
  lastChecked: 0,
}

// Listeners
const listeners: Set<(status: NetworkStatus) => void> = new Set()

// Check interval (ms)
const CHECK_INTERVAL = 30000 // 30 seconds

// URLs to check
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const API_URL = "/api/health-check"

// Last check time
let lastCheckTime = 0

/**
 * Check network status
 */
export async function checkNetworkStatus(): Promise<NetworkStatus> {
  const now = Date.now()

  // Don't check too frequently
  if (now - lastCheckTime < 5000) {
    return networkStatus
  }

  lastCheckTime = now

  try {
    // Check browser online status
    const online = isOnline()
    networkStatus.online = online

    // If offline, don't bother checking services
    if (!online) {
      networkStatus.supabaseReachable = false
      networkStatus.apiReachable = false
      networkStatus.lastChecked = now
      notifyListeners()
      return networkStatus
    }

    // Check Supabase
    if (SUPABASE_URL) {
      try {
        const supabaseReachable = await isUrlReachable(SUPABASE_URL, 5000)
        networkStatus.supabaseReachable = supabaseReachable

        if (!supabaseReachable) {
          // Log error for development
          addErrorLog({
            timestamp: Date.now(),
            operationId: "network.checkSupabase",
            category: "NETWORK_ERROR",
            message: "Supabase is unreachable",
            attempt: 1,
            maxAttempts: 1,
            duration: 0,
            context: { url: SUPABASE_URL },
          })
        }
      } catch (error) {
        networkStatus.supabaseReachable = false
        console.warn("Error checking Supabase reachability:", error)
      }
    }

    // Check API
    try {
      const apiReachable = await isUrlReachable(API_URL, 5000)
      networkStatus.apiReachable = apiReachable

      if (!apiReachable) {
        // Log error for development
        addErrorLog({
          timestamp: Date.now(),
          operationId: "network.checkApi",
          category: "NETWORK_ERROR",
          message: "API is unreachable",
          attempt: 1,
          maxAttempts: 1,
          duration: 0,
          context: { url: API_URL },
        })
      }
    } catch (error) {
      networkStatus.apiReachable = false
      console.warn("Error checking API reachability:", error)
    }

    networkStatus.lastChecked = now
    notifyListeners()
    return networkStatus
  } catch (error) {
    console.error("Error checking network status:", error)

    // Assume everything is down if we can't check
    networkStatus.online = false
    networkStatus.supabaseReachable = false
    networkStatus.apiReachable = false
    networkStatus.lastChecked = now

    notifyListeners()
    return networkStatus
  }
}

/**
 * Get current network status
 */
export function getNetworkStatus(): NetworkStatus {
  return { ...networkStatus }
}

/**
 * Subscribe to network status changes
 */
export function subscribeToNetworkStatus(callback: (status: NetworkStatus) => void): () => void {
  listeners.add(callback)

  // Immediately call with current status
  callback({ ...networkStatus })

  // Return unsubscribe function
  return () => {
    listeners.delete(callback)
  }
}

/**
 * Notify all listeners of status change
 */
function notifyListeners() {
  const status = { ...networkStatus }
  listeners.forEach((listener) => {
    try {
      listener(status)
    } catch (error) {
      console.error("Error in network status listener:", error)
    }
  })
}

/**
 * Start monitoring network status
 */
export function startNetworkMonitoring() {
  if (typeof window === "undefined") return

  // Initial check
  checkNetworkStatus()

  // Set up interval
  const intervalId = setInterval(checkNetworkStatus, CHECK_INTERVAL)

  // Set up online/offline listeners
  window.addEventListener("online", () => {
    networkStatus.online = true
    notifyListeners()
    checkNetworkStatus() // Recheck services
  })

  window.addEventListener("offline", () => {
    networkStatus.online = false
    networkStatus.supabaseReachable = false
    networkStatus.apiReachable = false
    notifyListeners()
  })

  // Return cleanup function
  return () => {
    clearInterval(intervalId)
  }
}

// Auto-start monitoring in browser
if (typeof window !== "undefined") {
  startNetworkMonitoring()
}
// If this file has exports specifically for the NetworkStatusIndicator, we can simplify it
// However, we'll keep the core network monitoring functionality as it might be used elsewhere
