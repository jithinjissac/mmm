"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { isSessionExpiringSoon, formatSessionTimeRemaining } from "@/lib/utils/session-helpers"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useSessionPersistence } from "@/hooks/use-session-persistence"

export function SessionExpiryWarning() {
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("")
  const { session } = useAuth()
  const { refreshSession, isRefreshing } = useSessionPersistence()

  useEffect(() => {
    if (!session || !session.expires_at) return

    const checkExpiration = () => {
      if (isSessionExpiringSoon(session.expires_at!)) {
        setShowWarning(true)
        setTimeRemaining(formatSessionTimeRemaining(session.expires_at!))
      } else {
        setShowWarning(false)
      }
    }

    // Check immediately
    checkExpiration()

    // Then check every minute
    const interval = setInterval(checkExpiration, 60 * 1000)

    return () => clearInterval(interval)
  }, [session])

  const handleRefresh = async () => {
    await refreshSession()
    setShowWarning(false)
  }

  if (!showWarning) return null

  return (
    <Alert variant="warning" className="fixed bottom-4 right-4 w-auto max-w-md z-50">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Session Expiring Soon</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>Your session will expire in {timeRemaining}. Would you like to stay logged in?</p>
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? "Refreshing..." : "Stay Logged In"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowWarning(false)}>
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
