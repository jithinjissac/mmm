"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase/client"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const verifyAuthentication = async () => {
      setIsVerifying(true)

      try {
        // Always verify authentication status with getUser
        const { data, error } = await supabase.auth.getUser()

        if (error || !data.user) {
          console.log("No authenticated user found, redirecting to login")
          setIsRedirecting(true)
          router.push("/login")
          return
        }

        // If auth is valid but we don't have a user in context, refresh the profile
        if (!user && data.user) {
          await refreshProfile()
        }

        // Check if user is on the correct dashboard for their role
        if (user?.profile) {
          const userRole = user.profile.role || "tenant"
          const currentPath = pathname.split("/")[2] // Get the role from the URL

          // If user is trying to access a dashboard they don't have permission for
          if (currentPath !== userRole) {
            console.log(`User role (${userRole}) doesn't match path (${currentPath}), redirecting`)
            setIsRedirecting(true)
            router.push(`/dashboard/${userRole}`)
          }
        }
      } catch (error) {
        console.error("Error verifying authentication:", error)
        setIsRedirecting(true)
        router.push("/login")
      } finally {
        setIsVerifying(false)
      }
    }

    if (!isLoading) {
      verifyAuthentication()
    }
  }, [user, isLoading, router, pathname, supabase, refreshProfile])

  // Show loading state while authentication is being checked or during redirection
  if (isLoading || isRedirecting || isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // If no user or profile after loading is complete, show access denied
  if (!user?.profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Please log in to access this page.</p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  // Ensure we have a valid role for display purposes
  const displayRole = user.profile.role || "tenant"
  const capitalizedRole = displayRole.charAt(0).toUpperCase() + displayRole.slice(1)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex flex-1 items-center gap-4 md:gap-6">
          <span className="font-bold">UK Rental Solution</span>
          <span className="text-sm text-muted-foreground">
            Welcome, {user.profile.full_name} | {capitalizedRole} Dashboard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <UserNav user={user} />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <DashboardNav userRole={displayRole} />
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
