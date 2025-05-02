"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { SessionService } from "@/lib/services/session-service"

export function useAuthErrorHandler() {
  const [isHandlingError, setIsHandlingError] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleAuthError = useCallback(
    async (error: any) => {
      setIsHandlingError(true)

      try {
        console.error("Authentication error:", error)

        // Check for specific error types
        if (error?.message?.includes("session expired")) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          })

          // Sign out and redirect to sign in
          await SessionService.signOut()
          router.push("/signin")
        } else if (error?.message?.includes("not authenticated")) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to continue.",
            variant: "destructive",
          })

          router.push("/signin")
        } else {
          // Generic error handling
          toast({
            title: "Authentication Error",
            description: error?.message || "An unexpected authentication error occurred.",
            variant: "destructive",
          })
        }
      } catch (handlingError) {
        console.error("Error handling auth error:", handlingError)

        // Fallback error handling
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsHandlingError(false)
      }
    },
    [toast, router],
  )

  return {
    handleAuthError,
    isHandlingError,
  }
}
