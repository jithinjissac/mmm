"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function DebugAuthState() {
  const { user, userRole, isLoading, refreshSession } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          Debug Auth
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-4 w-80 bg-background/80 backdrop-blur-sm shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Auth Debug</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">Status:</span>{" "}
            {isLoading ? "Loading..." : user ? "Authenticated" : "Not authenticated"}
          </div>

          {user && (
            <>
              <div>
                <span className="font-semibold">User ID:</span> {user.id}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-semibold">Role:</span> {userRole || "None"}
              </div>
            </>
          )}

          <div className="pt-2">
            <Button size="sm" variant="outline" onClick={() => refreshSession()} className="w-full">
              Refresh Session
            </Button>
          </div>

          <div className="pt-1">
            <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="w-full">
              Reload Page
            </Button>
          </div>

          <div className="pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                localStorage.clear()
                window.location.href = "/login"
              }}
              className="w-full text-destructive border-destructive hover:bg-destructive/10"
            >
              Clear Storage & Logout
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
