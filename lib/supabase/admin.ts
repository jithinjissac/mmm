import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Use a singleton pattern to prevent multiple instances
let adminClient: ReturnType<typeof createClient<Database>> | null = null

/**
 * Creates a Supabase admin client with the service role key
 */
export function createAdminSupabaseClient() {
  // Return existing client if available
  if (adminClient) {
    return adminClient
  }

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Validate environment variables
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase URL or Service Role Key is missing")
    throw new Error("Supabase admin configuration is incomplete")
  }

  try {
    // Create the admin client
    adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          apikey: supabaseServiceKey,
        },
      },
    })

    return adminClient
  } catch (error) {
    console.error("Error creating admin Supabase client:", error)
    throw new Error("Failed to initialize admin Supabase client")
  }
}

/**
 * Reset the admin client (useful for testing)
 */
export function resetAdminSupabaseClient() {
  adminClient = null
}

/**
 * Syncs a user to their profile in the database
 */
export async function syncUserToProfile(userId: string) {
  try {
    console.log(`Admin: Syncing profile for user ${userId}`)

    // Get the admin client
    const supabase = createAdminSupabaseClient()

    // Get the user's data
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError) {
      console.error(`Admin: Error getting user ${userId}:`, userError)
      return { success: false, error: userError }
    }

    if (!userData || !userData.user) {
      console.error(`Admin: User ${userId} not found`)
      return { success: false, error: new Error("User not found") }
    }

    // Extract user metadata
    const metadata = userData.user.user_metadata || {}
    const email = userData.user.email || "unknown@example.com"
    const fullName = metadata.full_name || metadata.name || "New User"
    const role = (metadata.role || "tenant").toLowerCase()

    // Check if profile already exists
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    // Handle database errors (except "not found")
    if (profileError && profileError.code !== "PGRST116") {
      console.error(`Admin: Error checking for existing profile:`, profileError)
      return { success: false, error: profileError }
    }

    const now = new Date().toISOString()

    // Update or create profile
    if (existingProfile) {
      // Update existing profile
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          email,
          full_name: fullName,
          role,
          updated_at: now,
        })
        .eq("id", userId)
        .select()
        .single()

      if (updateError) {
        console.error(`Admin: Error updating profile:`, updateError)
        return { success: false, error: updateError }
      }

      console.log(`Admin: Updated profile for user ${userId}`)
      return { success: true, profile: data }
    } else {
      // Create new profile
      const { data, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email,
          full_name: fullName,
          role,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (insertError) {
        // Check for duplicate key violation
        if (insertError.code === "23505") {
          console.warn(`Admin: Profile already exists for user ${userId}, retrying as update`)

          // Try updating instead
          const { data: retryData, error: retryError } = await supabase
            .from("profiles")
            .update({
              email,
              full_name: fullName,
              role,
              updated_at: now,
            })
            .eq("id", userId)
            .select()
            .single()

          if (retryError) {
            console.error(`Admin: Error in retry update:`, retryError)
            return { success: false, error: retryError }
          }

          console.log(`Admin: Updated profile on retry for user ${userId}`)
          return { success: true, profile: retryData }
        }

        console.error(`Admin: Error creating profile:`, insertError)
        return { success: false, error: insertError }
      }

      console.log(`Admin: Created profile for user ${userId}`)
      return { success: true, profile: data }
    }
  } catch (error) {
    console.error("Admin: Unexpected error in syncUserToProfile:", error)
    return { success: false, error }
  }
}
