import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Session durations
export const SESSION_DURATIONS = {
  DEFAULT: 60 * 60, // 1 hour in seconds
  EXTENDED: 60 * 60 * 24 * 30, // 30 days in seconds
}

// Session service for managing authentication sessions
export const SessionService = {
  // Get the current session
  async getSession() {
    const supabase = createClientComponentClient<Database>()
    return await supabase.auth.getSession()
  },

  // Refresh the current session
  async refreshSession() {
    const supabase = createClientComponentClient<Database>()
    return await supabase.auth.refreshSession()
  },

  // Sign in with email and password
  async signInWithEmail(email: string, password: string, rememberMe = false) {
    const supabase = createClientComponentClient<Database>()

    // Set session expiration based on "Remember me" checkbox
    const expiresIn = rememberMe ? SESSION_DURATIONS.EXTENDED : SESSION_DURATIONS.DEFAULT

    const result = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        expiresIn,
      },
    })

    // Save remember me preference
    if (result.data.session && !result.error && typeof window !== "undefined") {
      localStorage.setItem("rememberMe", rememberMe ? "true" : "false")
    }

    return result
  },

  // Sign out
  async signOut() {
    const supabase = createClientComponentClient<Database>()

    // Clear local storage items related to auth
    if (typeof window !== "undefined") {
      localStorage.removeItem("rememberMe")
    }

    return await supabase.auth.signOut()
  },

  // Check if session is about to expire
  isSessionExpiringSoon(expiresAt: number, thresholdMinutes = 5) {
    const thresholdMs = thresholdMinutes * 60 * 1000
    const expiresAtMs = expiresAt * 1000 // Convert seconds to milliseconds
    const now = Date.now()

    return expiresAtMs - now < thresholdMs
  },

  // Get remaining session time in a human-readable format
  getSessionTimeRemaining(expiresAt: number) {
    const expiresAtMs = expiresAt * 1000 // Convert seconds to milliseconds
    const now = Date.now()
    const remainingMs = expiresAtMs - now

    if (remainingMs <= 0) {
      return "Expired"
    }

    const minutes = Math.floor(remainingMs / (60 * 1000))

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`
    }

    const hours = Math.floor(minutes / 60)

    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`
    }

    const days = Math.floor(hours / 24)
    return `${days} day${days !== 1 ? "s" : ""}`
  },

  // Get the remembered preference
  getRememberMePreference() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rememberMe") === "true"
    }
    return false
  },

  // Set the remembered preference
  setRememberMePreference(remember: boolean) {
    if (typeof window !== "undefined") {
      localStorage.setItem("rememberMe", remember ? "true" : "false")
    }
  },
}
