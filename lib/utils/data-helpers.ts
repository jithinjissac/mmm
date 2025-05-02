import { createClientSupabaseClient } from "@/lib/supabase/client"

// Cache for data fetching
const cache = new Map()

/**
 * Fetch data with caching
 * @param key Cache key
 * @param fetcher Function to fetch data
 * @param ttl Time to live in milliseconds
 * @returns Cached or fresh data
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 60000, // 1 minute default
): Promise<T> {
  // Check if we have cached data that's not expired
  const cached = cache.get(key)
  if (cached && cached.expiry > Date.now()) {
    return cached.data
  }

  // Fetch fresh data
  const data = await fetcher()

  // Cache the data with expiry
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
  })

  return data
}

/**
 * Clear cache for specific keys or all cache
 * @param keys Optional array of keys to clear
 */
export function clearCache(keys?: string[]) {
  if (keys) {
    keys.forEach((key) => cache.delete(key))
  } else {
    cache.clear()
  }
}

/**
 * Fetch properties with caching
 * @param userId User ID
 * @param options Fetch options
 * @returns Properties data
 */
export async function fetchProperties(userId: string, options: { ttl?: number; forceRefresh?: boolean } = {}) {
  const { ttl = 60000, forceRefresh = false } = options
  const key = `properties_${userId}`

  // Clear cache if force refresh
  if (forceRefresh) {
    cache.delete(key)
  }

  return fetchWithCache(
    key,
    async () => {
      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase
        .from("properties")
        .select(`
          id,
          name,
          address,
          city,
          postcode,
          property_type,
          status,
          monthly_income,
          property_images(id, url, is_primary)
        `)
        .eq("landlord_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching properties:", error)
        throw error
      }

      return data || []
    },
    ttl,
  )
}

/**
 * Fetch rooms with caching
 * @param userId User ID
 * @param options Fetch options
 * @returns Rooms data
 */
export async function fetchRooms(userId: string, options: { ttl?: number; forceRefresh?: boolean } = {}) {
  const { ttl = 60000, forceRefresh = false } = options
  const key = `rooms_${userId}`

  // Clear cache if force refresh
  if (forceRefresh) {
    cache.delete(key)
  }

  return fetchWithCache(
    key,
    async () => {
      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase
        .from("rooms")
        .select(`
          id,
          name,
          rent,
          status,
          properties:property_id(id, name)
        `)
        .eq("landlord_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching rooms:", error)
        throw error
      }

      return data || []
    },
    ttl,
  )
}
