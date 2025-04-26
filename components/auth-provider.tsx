"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type UserWithProfile = User & { profile: Profile | null }

type AuthContextType = {
  user: UserWithProfile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Simple in-memory cache to prevent excessive API calls
const profileCache = new Map<string, { profile: Profile | null; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute

// Track profile creation attempts to prevent duplicates
const profileCreationAttempts = new Map<string, boolean>()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  // Fetch authenticated user data and profile
  const fetchAuthenticatedUser = async (): Promise<UserWithProfile | null> => {
    try {
      // Always use getUser() to get authenticated user data
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error("Error fetching authenticated user:", userError)
        return null
      }

      if (!userData.user) {
        return null
      }

      // Get or create the user profile
      const profile = await ensureUserProfile(userData.user.id)
      return { ...userData.user, profile }
    } catch (error) {
      console.error("Unexpected error in fetchAuthenticatedUser:", error)
      return null
    }
  }

  const refreshProfile = async () => {
    try {
      const authenticatedUser = await fetchAuthenticatedUser()

      if (!authenticatedUser) {
        console.log("No authenticated user found during profile refresh")
        return
      }

      setUser(authenticatedUser)
    } catch (err) {
      console.error("Error in refreshProfile:", err)
    }
  }

  const ensureUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log("Ensuring user profile for:", userId)

      // Check cache first
      const cachedProfile = profileCache.get(userId)
      if (cachedProfile && Date.now() - cachedProfile.timestamp < CACHE_TTL) {
        console.log("Using cached profile")

        // Ensure the cached profile has a valid role
        if (cachedProfile.profile && (!cachedProfile.profile.role || cachedProfile.profile.role === "undefined")) {
          console.warn("Cached profile has invalid role, setting default role 'tenant'")
          cachedProfile.profile.role = "tenant"
        }

        return cachedProfile.profile
      }

      // First try to get the profile directly from the database
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (!error && profile) {
        console.log("Profile found in database:", profile.id)

        // Before returning the profile, ensure it has a valid role
        if (!profile.role || profile.role === "undefined") {
          console.warn("Profile has invalid role, updating to default role 'tenant'")

          try {
            const { data: updatedProfile } = await supabase
              .from("profiles")
              .update({ role: "tenant" })
              .eq("id", userId)
              .select()
              .single()

            if (updatedProfile) {
              // Update cache
              profileCache.set(userId, { profile: updatedProfile, timestamp: Date.now() })
              return updatedProfile
            }
          } catch (updateErr) {
            console.error("Error updating profile with default role:", updateErr)
          }

          // If update fails, at least return a profile with a valid role
          profile.role = "tenant"
        }

        // Update cache
        profileCache.set(userId, { profile, timestamp: Date.now() })
        return profile
      }

      // If we reach here, the profile doesn't exist in the database
      console.log("Profile not found in database, checking if creation is already in progress")

      // Check if we're already attempting to create this profile
      if (profileCreationAttempts.get(userId)) {
        console.log("Profile creation already in progress for", userId)
        // Wait a bit and try to get the profile again
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const { data: retryProfile } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (retryProfile) {
          profileCache.set(userId, { profile: retryProfile, timestamp: Date.now() })
          return retryProfile
        }

        return null
      }

      console.log("Profile not found, attempting to create via API")
      profileCreationAttempts.set(userId, true)

      try {
        // If profile doesn't exist, call our API endpoint to create it
        const response = await fetch("/api/auth/sync-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        })

        if (response.ok) {
          const result = await response.json()

          if (result.success && result.profile) {
            console.log("Profile created successfully via API:", result.profile.id)
            // Update cache
            profileCache.set(userId, { profile: result.profile, timestamp: Date.now() })
            profileCreationAttempts.delete(userId)
            return result.profile
          }
        } else {
          console.error("API call failed with status:", response.status)
          // If API call fails, try to create the profile directly
          try {
            // Get user metadata from auth
            const { data: userData } = await supabase.auth.getUser()
            if (userData && userData.user) {
              const metadata = userData.user.user_metadata || {}
              const email = userData.user.email || "unknown@example.com"
              const fullName = metadata?.full_name || metadata?.name || "New User"
              let role = (metadata?.role || "tenant").toLowerCase()

              if (!["admin", "landlord", "tenant", "maintenance"].includes(role)) {
                role = "tenant"
              }

              // Create profile directly
              const { data: newProfile, error: insertError } = await supabase
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

              if (!insertError && newProfile) {
                profileCache.set(userId, { profile: newProfile, timestamp: Date.now() })
                profileCreationAttempts.delete(userId)
                return newProfile
              }
            }
          } catch (directCreateError) {
            console.error("Error creating profile directly:", directCreateError)
          }
        }

        // If API call fails, try to get the profile directly again
        const { data: newProfile } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (newProfile) {
          console.log("Profile found after creation attempt:", newProfile.id)
          // Update cache
          profileCache.set(userId, { profile: newProfile, timestamp: Date.now() })
          profileCreationAttempts.delete(userId)
          return newProfile
        }
      } catch (err) {
        console.error("Error creating profile:", err)
      } finally {
        // Clear the attempt flag
        profileCreationAttempts.delete(userId)
      }

      // After all attempts, make one final attempt to get the profile
      const { data: finalProfile } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (finalProfile) {
        console.log("Profile found in final attempt:", finalProfile.id)
        // Update cache
        profileCache.set(userId, { profile: finalProfile, timestamp: Date.now() })
        return finalProfile
      }

      console.error("Failed to ensure user profile after multiple attempts")
      return null
    } catch (err) {
      console.error("Error ensuring user profile:", err)
      profileCreationAttempts.delete(userId)
      return null
    }
  }

  // Function to handle auth state changes
  const handleAuthChange = async (event: string) => {
    console.log("Auth state changed:", event)

    if (event === "SIGNED_OUT") {
      setUser(null)
      setIsLoading(false)
      router.refresh()
      return
    }

    // For all other events, fetch the authenticated user
    const authenticatedUser = await fetchAuthenticatedUser()
    setUser(authenticatedUser)
    setIsLoading(false)
    router.refresh()
  }

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)

      try {
        // Always fetch the authenticated user on initialization
        const authenticatedUser = await fetchAuthenticatedUser()
        setUser(authenticatedUser)
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      await handleAuthChange(event)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    console.log("Attempting sign in for:", email)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
        setIsLoading(false)
        return { success: false, error }
      }

      // After sign in, fetch the authenticated user
      const authenticatedUser = await fetchAuthenticatedUser()

      if (!authenticatedUser) {
        console.error("Failed to get authenticated user after sign in")
        setIsLoading(false)
        return { success: false, error: new Error("Failed to get authenticated user") }
      }

      console.log("Sign in successful:", authenticatedUser.id)
      setUser(authenticatedUser)

      // Redirect to the appropriate dashboard based on role
      const role = authenticatedUser.profile?.role || "tenant"
      router.push(`/dashboard/${role}`)

      return { success: true }
    } catch (err) {
      console.error("Unexpected error during sign in:", err)
      setIsLoading(false)
      return { success: false, error: err }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    setIsLoading(true)

    try {
      // Sign up with Supabase Auth with explicit metadata
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.name,
            role: userData.role,
          },
        },
      })

      if (authError) throw authError

      // After sign up, fetch the authenticated user to ensure profile creation
      const authenticatedUser = await fetchAuthenticatedUser()

      if (authenticatedUser) {
        console.log("User signed up and profile created:", authenticatedUser.id)
      }

      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()

      // Verify sign out by checking authenticated user
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        console.log("Sign out successful, no user found")
        setUser(null)
        // Clear cache on sign out
        profileCache.clear()
        profileCreationAttempts.clear()
        router.push("/")
      } else {
        console.error("Sign out failed, user still authenticated")
      }
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
