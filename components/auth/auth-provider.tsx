"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import type { User, Session } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  // Function to fetch user profile
  const fetchUserProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (error) {
          console.error("Error fetching profile:", error)
          return null
        }

        return data
      } catch (error) {
        console.error("Unexpected error fetching profile:", error)
        return null
      }
    },
    [supabase],
  )

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Error refreshing session:", error)
        return
      }

      if (data.session) {
        setSession(data.session)
        setUser(data.session.user)

        // Fetch updated profile
        if (data.session.user) {
          const profileData = await fetchUserProfile(data.session.user.id)
          setProfile(profileData)
        }
      }
    } catch (error) {
      console.error("Unexpected error refreshing session:", error)
    }
  }, [supabase, fetchUserProfile])

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)

      try {
        // Get current session
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)

          // Fetch user profile
          const profileData = await fetchUserProfile(currentSession.user.id)
          setProfile(profileData)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [supabase, fetchUserProfile])

  // Set up auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      // Handle auth state changes
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (newSession) {
          setSession(newSession)
          setUser(newSession.user)

          // Fetch user profile
          const profileData = await fetchUserProfile(newSession.user.id)
          setProfile(profileData)
        }
      } else if (event === "SIGNED_OUT") {
        setSession(null)
        setUser(null)
        setProfile(null)
      }

      // Refresh the router to update server components
      router.refresh()
    })

    // Clean up subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, fetchUserProfile])

  // Set up session refresh on activity
  useEffect(() => {
    if (!session) return

    // Check if we should use persistent sessions
    const rememberMe = localStorage.getItem("rememberMe") === "true"
    if (!rememberMe) return

    // Calculate refresh interval (refresh when 80% of the session has elapsed)
    const calculateRefreshTime = () => {
      if (!session?.expires_at) return 60 * 60 * 1000 // Default to 1 hour

      const expiresAt = session.expires_at * 1000 // Convert to milliseconds
      const now = Date.now()
      const sessionDuration = expiresAt - now

      // Refresh at 80% of session duration or at least every 4 hours
      return Math.min(sessionDuration * 0.8, 4 * 60 * 60 * 1000)
    }

    // Set up refresh timer
    const refreshTimer = setTimeout(() => {
      refreshSession()
    }, calculateRefreshTime())

    // Set up activity detection for session refresh
    let inactivityTimer: NodeJS.Timeout

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(
        () => {
          refreshSession()
        },
        30 * 60 * 1000,
      ) // Refresh after 30 minutes of inactivity
    }

    // Set up event listeners for user activity
    const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"]
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer)
    })

    // Initial timer setup
    resetInactivityTimer()

    // Clean up timers and event listeners
    return () => {
      clearTimeout(refreshTimer)
      clearTimeout(inactivityTimer)
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer)
      })
    }
  }, [session, refreshSession])

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()

      // Clear local storage items related to auth
      if (typeof window !== "undefined") {
        localStorage.removeItem("rememberMe")
      }

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
