"use client"

import { useEffect } from "react"
import { useSessionPersistence } from "@/hooks/use-session-persistence"
import { useAuth } from "@/lib/auth/auth-context"

export function SessionManager() {
  const { refreshSession } = useSessionPersistence()
  const { user } = useAuth()

  // Refresh session when the component mounts if user is logged in
  useEffect(() => {
    if (user) {
      // Check if we should use persistent sessions
      const rememberMe = localStorage.getItem("rememberMe") === "true"
      if (rememberMe) {
        refreshSession()
      }
    }
  }, [user, refreshSession])

  // This is a utility component that doesn't render anything
  return null
}
