"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function OfflineFallback() {
  const [isOffline, setIsOffline] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    // Check initial network status
    const checkNetworkStatus = () => {
      const online = typeof navigator !== "undefined" && typeof navigator.onLine === "boolean" ? navigator.onLine : true
      setIsOffline(!online)
      setShowAlert(!online)
    }

    checkNetworkStatus()

    // Set up event listeners
    const handleOnline = () => {
      setIsOffline(false)
      // Show the online alert briefly
      setShowAlert(true)
      // Hide after 3 seconds
      setTimeout(() => setShowAlert(false), 3000)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setShowAlert(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showAlert) return null

  return (
    <Alert
      variant={isOffline ? "destructive" : "default"}
      className="fixed top-4 right-4 z-50 max-w-md transition-opacity duration-300"
    >
      {isOffline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
      <AlertTitle>{isOffline ? "You're offline" : "You're back online"}</AlertTitle>
      <AlertDescription>
        {isOffline
          ? "Please check your internet connection. Some features may be unavailable."
          : "Your connection has been restored. All features are now available."}
      </AlertDescription>
    </Alert>
  )
}
