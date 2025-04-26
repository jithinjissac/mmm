import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { syncUserToProfile } from "@/lib/supabase/admin"

// Simple rate limiting
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 5 // 5 requests per minute

// Track ongoing profile creation to prevent duplicates
const ongoingCreations = new Map<string, Promise<any>>()

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated using getUser instead of getSession
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    // For the login page, we'll allow profile creation even without a session
    // This helps with the initial setup when a user is registering
    const url = request.headers.get("referer") || ""
    const isLoginOrRegister = url.includes("/login") || url.includes("/register")

    if (userError && !isLoginOrRegister) {
      console.error("User error in sync-profile:", userError)
      return NextResponse.json({ error: "Unauthorized", details: userError.message }, { status: 401 })
    }

    if (!user && !isLoginOrRegister) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Apply rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "unknown"
    const rateLimit = rateLimitMap.get(clientIp) || { count: 0, timestamp: Date.now() }

    // Reset count if window has passed
    if (Date.now() - rateLimit.timestamp > RATE_LIMIT_WINDOW) {
      rateLimit.count = 0
      rateLimit.timestamp = Date.now()
    }

    // Increment count and check limit
    rateLimit.count++
    rateLimitMap.set(clientIp, rateLimit)

    if (rateLimit.count > RATE_LIMIT_MAX) {
      return NextResponse.json({ error: "Too many requests, please try again later" }, { status: 429 })
    }

    // Get the user ID from the request body
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Only allow users to sync their own profile or admins to sync any profile
    // Skip this check for login/register pages
    if (!isLoginOrRegister && user && userId !== user.id) {
      // Check if the user is an admin
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (!profile || profile.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // First check if the profile already exists
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (!profileError && existingProfile) {
      console.log("Profile already exists, returning existing profile")

      // Check if the role is valid
      if (!existingProfile.role || existingProfile.role === "undefined") {
        console.log("Existing profile has invalid role, updating to default role 'tenant'")

        // Update the profile with a default role
        const { data: updatedProfile, error: updateError } = await supabase
          .from("profiles")
          .update({ role: "tenant" })
          .eq("id", userId)
          .select()
          .single()

        if (!updateError && updatedProfile) {
          return NextResponse.json({ success: true, profile: updatedProfile })
        }
      }

      return NextResponse.json({ success: true, profile: existingProfile })
    }

    // Check if there's already an ongoing creation for this user
    if (ongoingCreations.has(userId)) {
      console.log("Profile creation already in progress for", userId)
      try {
        // Wait for the existing creation to complete
        const result = await ongoingCreations.get(userId)
        return NextResponse.json(result)
      } catch (error) {
        console.error("Error waiting for ongoing profile creation:", error)
        return NextResponse.json({ error: "Failed to sync profile" }, { status: 500 })
      }
    }

    // Create a promise for this profile creation
    const creationPromise = syncUserToProfile(userId)
    ongoingCreations.set(userId, creationPromise)

    try {
      // Sync the user profile
      const result = await creationPromise

      if (!result.success) {
        console.error("Profile sync failed:", result.error)
        return NextResponse.json({ error: "Failed to sync profile", details: result.error }, { status: 500 })
      }

      return NextResponse.json({ success: true, profile: result.profile })
    } finally {
      // Remove the promise from the map when done
      ongoingCreations.delete(userId)
    }
  } catch (error) {
    console.error("Error in sync-profile API:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
