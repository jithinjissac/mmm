"use client"

import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { UserRole } from "@/lib/services/role-management"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { RoleManagementService } from "@/lib/services/role-management"
import { initializeSampleData } from "@/lib/local-storage/init-sample-data"
import {
  signIn as localSignIn,
  signOut as localSignOut,
  getSession,
  getProfileById,
} from "@/lib/local-storage/auth-service"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

type AuthContextType = {
  user: User | null
  userProfile: Profile | null
  userRole: UserRole | null
  isLoading: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean
    error: Error | null
    role: UserRole | null
  }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Add refs to track redirect state and prevent loops
  const isRedirecting = useRef(false)
  const lastRedirectTime = useRef(0)
  const redirectCount = useRef(0)

  // Initialize local storage with sample data
  useEffect(() => {
    const initialize = async () => {
      try {
        initializeSampleData()
        console.log("Local storage initialized with sample data")
        setIsInitialized(true)
      } catch (error) {
        console.error("Error initializing local storage:", error)
        // Even if there's an error, mark as initialized to prevent blocking
        setIsInitialized(true)
      }
    }

    initialize()
  }, [])

  // Memoize the refreshSession function to avoid recreating it on each render
  const refreshSession = useCallback(async () => {
    if (!isInitialized) {
      console.log("Waiting for initialization before refreshing session")
      return
    }

    try {
      setIsLoading(true)
      console.log("Refreshing session...")

      const { session, user } = await getSession()
      console.log("Session refresh result:", { hasSession: !!session, hasUser: !!user })

      if (session && user) {
        setUser(user)

        // Get user profile
        const profile = await getProfileById(user.id)
        setUserProfile(profile)

        // Get user role
        const role = profile?.role || user.user_metadata?.role || null
        const safeRole = RoleManagementService.getSafeRole(role)
        console.log("User role detected:", safeRole)
        setUserRole(safeRole)
      } else {
        // No session found, clear user state
        console.log("No session found, clearing user state")
        setUser(null)
        setUserProfile(null)
        setUserRole(null)
      }
    } catch (error) {
      console.error("Error refreshing session:", error)
      // On error, clear user state to be safe
      setUser(null)
      setUserProfile(null)
      setUserRole(null)
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  // Check for existing session after initialization
  useEffect(() => {
    if (isInitialized) {
      refreshSession()
    }
  }, [isInitialized, refreshSession])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      console.log("Signing in with email:", email)

      const { success, user, error, profile } = await localSignIn(email, password)
      console.log("Sign in result:", { success, hasUser: !!user, hasError: !!error })

      if (success && user) {
        setUser(user)

        // Set user profile
        setUserProfile(profile || null)

        // Get user role
        const role = profile?.role || user.user_metadata?.role || null
        const safeRole = RoleManagementService.getSafeRole(role)
        console.log("User role after sign in:", safeRole)
        setUserRole(safeRole)

        return {
          success: true,
          error: null,
          role: safeRole,
        }
      }

      return {
        success: false,
        error: error || new Error("Unknown error during sign in"),
        role: null,
      }
    } catch (error) {
      console.error("Error signing in:", error)
      return { success: false, error: error as Error, role: null }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      await localSignOut()
      setUser(null)
      setUserProfile(null)
      setUserRole(null)

      // Reset redirect tracking
      isRedirecting.current = false
      redirectCount.current = 0

      // Redirect to home page after sign out
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Safe redirect function to prevent loops
  const safeRedirect = useCallback(
    (path: string, reason: string) => {
      const now = Date.now()

      // Don't redirect if we're already redirecting
      if (isRedirecting.current) {
        console.log(`Skipping redirect to ${path} - already redirecting`)
        return
      }

      // Don't redirect if we've redirected too recently (within 1 second)
      if (now - lastRedirectTime.current < 1000) {
        console.log(`Skipping redirect to ${path} - too soon after last redirect`)
        return
      }

      // Don't redirect if we're already on this path
      if (pathname === path) {
        console.log(`Skipping redirect to ${path} - already on this path`)
        return
      }

      // Track redirect count to detect loops
      redirectCount.current += 1

      // If we've redirected too many times in a short period, break the loop
      if (redirectCount.current > 5) {
        console.error("Detected redirect loop, breaking out")
        redirectCount.current = 0

        // Force to login as a fallback
        if (path !== "/login") {
          router.push("/login")
        }
        return
      }

      // Set redirecting state
      isRedirecting.current = true
      lastRedirectTime.current = now

      console.log(`Redirecting to ${path} - reason: ${reason}`)
      router.push(path)

      // Reset redirecting state after a delay
      setTimeout(() => {
        isRedirecting.current = false
      }, 1000)
    },
    [pathname, router],
  )

  // Handle automatic redirects based on auth state
  useEffect(() => {
    if (isLoading || !isInitialized) return

    // Reset redirect count after loading completes
    if (!isLoading) {
      setTimeout(() => {
        redirectCount.current = 0
      }, 2000)
    }

    const isPublicPath = ["/", "/login", "/register", "/forgot-password", "/reset-password"].includes(pathname)
    const isDashboardPath = pathname.startsWith("/dashboard")

    // Only handle redirects if we're not already redirecting
    if (isRedirecting.current) return

    if (!user && isDashboardPath) {
      // Not logged in and trying to access protected route
      safeRedirect(`/login?redirect=${encodeURIComponent(pathname)}`, "Not logged in, accessing dashboard")
    } else if (user && userRole && isPublicPath && pathname !== "/") {
      // Logged in and on a public page (except homepage)
      safeRedirect(`/dashboard/${userRole}`, "Logged in on public page")
    }
  }, [user, userRole, isLoading, pathname, safeRedirect, isInitialized])

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        userRole,
        isLoading,
        signIn,
        signOut,
        refreshSession,
      }}
    >
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

// Add default export for the AuthProvider
export default AuthProvider
