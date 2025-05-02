import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`API: Syncing role for user ${userId}`)

    // Get the admin client
    const supabase = createAdminSupabaseClient()

    // Get the user's metadata
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError) {
      console.error(`API: Error getting user ${userId}:`, userError)
      return NextResponse.json({ error: userError.message || "Failed to get user" }, { status: 500 })
    }

    if (!userData || !userData.user) {
      console.error(`API: User ${userId} not found`)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Extract the role from the user's metadata
    const metadata = userData.user.user_metadata || {}
    let role = (metadata.role || "tenant").toLowerCase()

    // Validate the role
    if (!["admin", "landlord", "tenant", "maintenance"].includes(role)) {
      console.warn(`API: Invalid role "${role}" detected, defaulting to "tenant"`)
      role = "tenant"
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine, we'll create the profile
      console.error(`API: Error getting profile for user ${userId}:`, profileError)
      return NextResponse.json({ error: profileError.message || "Failed to get profile" }, { status: 500 })
    }

    // If the profile exists, update the role if needed
    if (profile) {
      if (profile.role !== role) {
        console.log(`API: Updating role for user ${userId} from ${profile.role} to ${role}`)
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ role, updated_at: new Date().toISOString() })
          .eq("id", userId)

        if (updateError) {
          console.error(`API: Error updating role for user ${userId}:`, updateError)
          return NextResponse.json({ error: updateError.message || "Failed to update role" }, { status: 500 })
        }
      }
    } else {
      // If the profile doesn't exist, create it
      console.log(`API: Creating profile for user ${userId} with role ${role}`)
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        email: userData.user.email || "unknown@example.com",
        full_name: metadata.full_name || metadata.name || "New User",
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error(`API: Error creating profile for user ${userId}:`, insertError)
        return NextResponse.json({ error: insertError.message || "Failed to create profile" }, { status: 500 })
      }
    }

    console.log(`API: Successfully synced role for user ${userId}: ${role}`)
    return NextResponse.json({ success: true, role })
  } catch (error: any) {
    console.error("API: Unexpected error in sync-role:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
