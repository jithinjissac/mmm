"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/mock-auth-provider"
import { Loader2 } from "lucide-react"

interface WithAuthProtectionProps {
  children: React.ReactNode
  requiredRole?: string | string[]
}

export default function WithAuthProtection({ children, requiredRole }: WithAuthProtectionProps) {
  const { user, userRole, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (!isLoading && user && requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

      if (!roles.includes(userRole as string)) {
        router.push(`/dashboard/${userRole}`)
      }
    }
  }, [user, userRole, isLoading, router, requiredRole])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.includes(userRole as string)) {
      return null
    }
  }

  return <>{children}</>
}
