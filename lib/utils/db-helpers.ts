import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

/**
 * Safely executes a database query with proper error handling
 * @param queryFn Function that performs the database query
 * @param useAdmin Whether to use the admin client (bypasses RLS)
 * @returns Result of the query or null if it fails
 */
export async function safeQuery<T>(
  queryFn: (supabase: any) => Promise<{ data: T; error: any }>,
  useAdmin = false,
): Promise<{ data: T | null; error: any }> {
  try {
    const supabase = useAdmin ? createAdminSupabaseClient() : createServerSupabaseClient()

    if (!supabase) {
      console.error("Failed to create Supabase client")
      return { data: null, error: new Error("Database client unavailable") }
    }

    const result = await queryFn(supabase)
    return result
  } catch (error) {
    console.error("Error executing database query:", error)
    return { data: null, error }
  }
}

/**
 * Checks if the database is reachable
 * @returns True if the database is reachable, false otherwise
 */
export async function isDatabaseReachable(): Promise<boolean> {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) return false

    // Simple query to check if the database is reachable
    const { error } = await supabase.from("profiles").select("id").limit(1)

    return !error
  } catch (error) {
    console.error("Error checking database reachability:", error)
    return false
  }
}
