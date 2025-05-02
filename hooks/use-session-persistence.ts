"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

export function useSessionPersistence() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const supabase = createClientComponentClient<Database>()

  // Function to refresh the session
  const refreshSession = async () => {
    setIsRefreshing(true)
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error("Error refreshing session:", error)
      }
      return { data, error }
    } catch (err) {
      console.error("Unexpected error refreshing session:", err)
      return { data: null, error: err }
    } finally {
      setIsRefreshing(false)
    }
  }

  // Set up session refresh on activity
  useEffect(() => {
    // Check if we should use persistent sessions
    const rememberMe = localStorage.getItem("rememberMe") === "true"
    if (!rememberMe) return

    let inactivityTimer: NodeJS.Timeout

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(
        () => {
          refreshSession()
        },
        1000 * 60 * 30,
      ) // Refresh after 30 minutes of inactivity
    }

    // Set up event listeners for user activity
    const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"]
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer)
    })

    // Initial timer setup
    resetInactivityTimer()

    // Clean up event listeners
    return () => {
      clearTimeout(inactivityTimer)
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer)
      })
    }
  }, [])

  return { refreshSession, isRefreshing }
}
