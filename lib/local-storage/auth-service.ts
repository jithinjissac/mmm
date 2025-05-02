// This is a mock implementation of authentication services using local storage
// In a real application, this would be replaced with actual authentication services

import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

// Mock session structure
interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}

// Get user session from local storage
export async function getSession(): Promise<{ session: Session | null; user: User | null }> {
  try {
    const sessionStr = localStorage.getItem("uk_rental_session")

    if (!sessionStr) {
      return { session: null, user: null }
    }

    const session = JSON.parse(sessionStr) as Session

    // Check if session is expired
    if (session.expires_at < Date.now()) {
      // Clear expired session
      localStorage.removeItem("uk_rental_session")
      return { session: null, user: null }
    }

    return { session, user: session.user }
  } catch (error) {
    console.error("Error getting session:", error)
    return { session: null, user: null }
  }
}

// Sign in with email and password
export async function signIn(
  email: string,
  password: string,
): Promise<{
  success: boolean
  user: User | null
  error: Error | null
  profile: Profile | null
}> {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Get users from local storage
    const usersStr = localStorage.getItem("uk_rental_users")

    if (!usersStr) {
      return {
        success: false,
        user: null,
        error: new Error("No users found"),
        profile: null,
      }
    }

    const users = JSON.parse(usersStr) as User[]

    // Find user with matching email
    const user = users.find((u) => u.email === email)

    if (!user) {
      return {
        success: false,
        user: null,
        error: new Error("User not found"),
        profile: null,
      }
    }

    // Check password (in a real app, this would be done securely)
    if (user.user_metadata?.password !== password) {
      return {
        success: false,
        user: null,
        error: new Error("Invalid password"),
        profile: null,
      }
    }

    // Create session
    const session: Session = {
      access_token: `mock-token-${Date.now()}`,
      refresh_token: `mock-refresh-${Date.now()}`,
      expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      user,
    }

    // Save session to local storage
    localStorage.setItem("uk_rental_session", JSON.stringify(session))

    // Get user profile
    const profile = await getProfileById(user.id)

    return {
      success: true,
      user,
      error: null,
      profile,
    }
  } catch (error) {
    console.error("Error signing in:", error)
    return {
      success: false,
      user: null,
      error: error as Error,
      profile: null,
    }
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    // Remove session from local storage
    localStorage.removeItem("uk_rental_session")
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Get user profile by ID
export async function getProfileById(userId: string): Promise<Profile | null> {
  try {
    // Get profiles from local storage
    const profilesStr = localStorage.getItem("uk_rental_profiles")

    if (!profilesStr) {
      return null
    }

    const profiles = JSON.parse(profilesStr) as Profile[]

    // Find profile with matching user ID
    return profiles.find((p) => p.id === userId) || null
  } catch (error) {
    console.error("Error getting profile:", error)
    return null
  }
}

// Update user profile
export async function updateProfile(profile: Profile): Promise<Profile> {
  try {
    // Get profiles from local storage
    const profilesStr = localStorage.getItem("uk_rental_profiles")

    if (!profilesStr) {
      throw new Error("No profiles found")
    }

    const profiles = JSON.parse(profilesStr) as Profile[]

    // Find profile index
    const index = profiles.findIndex((p) => p.id === profile.id)

    if (index === -1) {
      throw new Error("Profile not found")
    }

    // Update profile
    profiles[index] = { ...profiles[index], ...profile }

    // Save profiles to local storage
    localStorage.setItem("uk_rental_profiles", JSON.stringify(profiles))

    return profiles[index]
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}
