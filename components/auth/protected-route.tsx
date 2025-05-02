"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // If not loading and no user, redirect to sign in
    if (!isLoading && !user) {
      router.push("/signin")
      return
    }

    // If user exists but roles are restricted
    if (!isLoading && user && allowedRoles && profile) {
      if (!allowedRoles.includes(profile.role)) {
        // Redirect to appropriate dashboard based on role
        if (profile.role === "admin") {
          router.push("/dashboard/admin")
        } else if (profile.role === "landlord") {
          router.push("/dashboard/landlord")
        } else if (profile.role === "tenant") {
          router.push("/dashboard/tenant")
        } else if (profile.role === "maintenance") {
          router.push("/dashboard/maintenance")
        } else {
          router.push("/dashboard")
        }
        return
      }
    }

    // If we get here, user is authorized
    if (!isLoading && user) {
      setIsAuthorized(true)
    }
  }, [user, profile, isLoading, router, allowedRoles])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Only render children if authorized
  return isAuthorized ? <>{children}</> : null
}
