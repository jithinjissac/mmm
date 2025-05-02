"use client"

import { useAuth } from "@/components/mock-auth-provider"
import { UserProfile } from "@/components/user-profile"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"

export default function ProfilePage() {
  const { refreshProfile } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshProfile()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Alert>
        <AlertTitle>Role Management</AlertTitle>
        <AlertDescription>
          Your role determines what features and sections of the application you can access. If you believe your role is
          incorrect, please contact an administrator.
        </AlertDescription>
      </Alert>

      <UserProfile />
    </div>
  )
}
