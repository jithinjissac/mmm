import { createServerSupabaseClient } from "@/lib/supabase/server"
import { retryOperation } from "@/hooks/use-retry-operation"
import { CircuitBreaker } from "@/lib/utils/circuit-breaker"
import { isBrowserOnline } from "@/lib/utils/network-helpers"

// Cache for profiles with TTL
type ProfileCache = {
  data: any
  timestamp: number
  ttl: number
}

const profileCache: Record<string, ProfileCache> = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Circuit breaker for profile fetching
const profileCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 30000,
})

/**
 * Fetch profiles with caching and resilience
 * Now uses standard client since RLS policies are fixed
 */
export async function fetchProfiles(options: {
  role?: string
  userId?: string
  useCache?: boolean
}) {
  const { role, userId, useCache = true } = options

  // Create cache key based on options
  const cacheKey = `profiles-${role || "all"}-${userId || "all"}`

  // Check cache if enabled
  if (useCache && profileCache[cacheKey]) {
    const cache = profileCache[cacheKey]
    if (Date.now() - cache.timestamp < cache.ttl) {
      console.log("Using cached profiles data")
      return cache.data
    }
  }

  // Check if browser is online
  if (typeof window !== "undefined" && !isBrowserOnline()) {
    throw new Error("Browser is offline. Cannot fetch profiles.")
  }

  try {
    // Use circuit breaker to prevent cascading failures
    return await profileCircuitBreaker.execute(async () => {
      // Use retry operation for resilience
      return await retryOperation(
        "fetchProfiles",
        async () => {
          // Use standard client - no need to bypass RLS anymore
          const supabase = createServerSupabaseClient()

          let query = supabase.from("profiles").select("*")

          // Apply filters if provided
          if (role) {
            query = query.eq("role", role)
          }

          if (userId) {
            query = query.eq("id", userId)
          }

          const { data, error } = await query

          if (error) {
            console.error("Error fetching profiles:", error)
            throw error
          }

          // Cache the result if caching is enabled
          if (useCache) {
            profileCache[cacheKey] = {
              data,
              timestamp: Date.now(),
              ttl: CACHE_TTL,
            }
          }

          return data
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
          backoffFactor: 2,
        },
      )
    })
  } catch (error) {
    console.error("Failed to fetch profiles after multiple attempts:", error)
    throw error
  }
}

/**
 * Fetch a single profile by ID
 */
export async function fetchProfileById(
  id: string,
  options: {
    useCache?: boolean
  } = {},
) {
  const { useCache = true } = options

  try {
    const profiles = await fetchProfiles({
      userId: id,
      useCache,
    })

    return profiles?.[0] || null
  } catch (error) {
    console.error(`Failed to fetch profile with ID ${id}:`, error)
    throw error
  }
}

/**
 * Clear the profile cache
 */
export function clearProfileCache() {
  Object.keys(profileCache).forEach((key) => {
    delete profileCache[key]
  })
}

/**
 * Invalidate a specific profile in the cache
 */
export function invalidateProfileCache(options: {
  role?: string
  userId?: string
}) {
  const { role, userId } = options
  const cacheKey = `profiles-${role || "all"}-${userId || "all"}`

  if (profileCache[cacheKey]) {
    delete profileCache[cacheKey]
  }
}
