"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useAuthErrorHandler } from "@/hooks/use-auth-error-handler"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

export function AuthErrorHandler({ children }: { children: React.ReactNode }) {
  const { handleAuthError } = useAuthErrorHandler()
  const { refreshSession } = useAuth()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    // Listen for auth errors
    const handleAuthStateChange = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed successfully")
      }
    })

    // Set up error listener for Supabase client
    const {
      data: { subscription },
    } = supabase.auth.onError((error) => {
      handleAuthError(error)
    })

    return () => {
      handleAuthStateChange.data.subscription.unsubscribe()
      subscription.unsubscribe()
    }
  }, [supabase, handleAuthError, refreshSession])

  return <>{children}</>
}
