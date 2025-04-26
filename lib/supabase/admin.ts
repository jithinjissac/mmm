import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// This client has admin privileges and should only be used in server contexts
const supabaseAdmin = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Simple in-memory cache to prevent excessive API calls
const userCache = new Map<string, { user: any; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute

export async function syncUserToProfile(userId: string) {
  try {
    // Check if profile already exists first to avoid duplicate key errors
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (!profileError && existingProfile) {
      console.log("Profile already exists, skipping creation")

      // Check if the role is valid
      if (!existingProfile.role || existingProfile.role === "undefined") {
        console.log("Existing profile has invalid role, updating to default role 'tenant'")

        // Update the profile with a default role
        const { data: updatedProfile, error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ role: "tenant" })
          .eq("id", userId)
          .select()
          .single()

        if (!updateError && updatedProfile) {
          return { success: true, profile: updatedProfile }
        }
      }

      return { success: true, profile: existingProfile }
    }

    // Get user data with caching to avoid rate limiting
    let userData
    const cachedUser = userCache.get(userId)

    if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_TTL) {
      console.log("Using cached user data")
      userData = cachedUser.user
    } else {
      // Use the admin API to get user data instead of querying auth.users directly
      try {
        const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

        if (userError) {
          console.error("Error fetching user with admin API:", userError)
          return { success: false, error: userError }
        }

        userData = user.user
      } catch (adminError) {
        console.error("Error in admin getUserById:", adminError)
        return { success: false, error: adminError }
      }

      // Cache the user data
      userCache.set(userId, { user: userData, timestamp: Date.now() })
    }

    if (!userData) {
      console.error("Could not retrieve user data")
      return { success: false, error: new Error("User not found") }
    }

    // Extract metadata
    const metadata = userData.user_metadata || {}
    const email = userData.email || "unknown@example.com"
    const fullName = metadata?.full_name || metadata?.name || "New User"

    // Ensure we have a valid role, defaulting to "tenant" if not present or invalid
    let role = (metadata?.role || "tenant").toLowerCase()
    if (!["admin", "landlord", "tenant", "maintenance"].includes(role)) {
      console.warn(`Invalid role "${role}" detected, defaulting to "tenant"`)
      role = "tenant"
    }

    console.log("Creating profile with data:", { email, fullName, role })

    // Create new profile with error handling for duplicate key
    try {
      const { data: profile, error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          email,
          full_name: fullName,
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        // If it's a duplicate key error, try to get the existing profile
        if (insertError.code === "23505") {
          // PostgreSQL unique violation code
          console.log("Profile already exists (duplicate key), fetching existing profile")
          const { data: existingProfile } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).single()

          if (existingProfile) {
            // Check if the role is valid
            if (!existingProfile.role || existingProfile.role === "undefined") {
              console.log("Existing profile has invalid role, updating to default role 'tenant'")

              // Update the profile with a default role
              const { data: updatedProfile } = await supabaseAdmin
                .from("profiles")
                .update({ role: "tenant" })
                .eq("id", userId)
                .select()
                .single()

              if (updatedProfile) {
                return { success: true, profile: updatedProfile }
              }
            }
          }

          return { success: true, profile: existingProfile }
        }

        console.error("Error creating profile:", insertError)
        return { success: false, error: insertError }
      }

      return { success: true, profile }
    } catch (error) {
      console.error("Unexpected error in profile creation:", error)

      // One last attempt to get the profile if it might exist
      try {
        const { data: existingProfile } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).single()

        if (existingProfile) {
          return { success: true, profile: existingProfile }
        }
      } catch (finalError) {
        console.error("Final attempt to get profile failed:", finalError)
      }

      return { success: false, error }
    }
  } catch (error) {
    console.error("Unexpected error in syncUserToProfile:", error)
    return { success: false, error }
  }
}
