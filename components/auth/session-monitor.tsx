"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { SessionService } from "@/lib/services/session-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export function SessionMonitor() {
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("")
  const { session, refreshSession } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!session || !session.expires_at) return

    const checkExpiration = () => {
      if (SessionService.isSessionExpiringSoon(session.expires_at!)) {
        setShowWarning(true)
        setTimeRemaining(SessionService.getSessionTimeRemaining(session.expires_at!))
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
    setIsRefreshing(true)
    try {
      await refreshSession()
      setShowWarning(false)
    } catch (error) {
      console.error("Error refreshing session:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!showWarning) return null

  return (
    <Alert className="fixed bottom-4 right-4 w-auto max-w-md z-50 bg-yellow-50 border-yellow-200">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Session Expiring Soon</AlertTitle>
      <AlertDescription className="flex flex-col gap-2 text-yellow-700">
        <p>Your session will expire in {timeRemaining}. Would you like to stay logged in?</p>
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isRefreshing ? "Refreshing..." : "Stay Logged In"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowWarning(false)}
            className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
