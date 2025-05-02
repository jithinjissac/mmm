"use client"

import { MaintenanceRequestForm } from "@/components/maintenance/maintenance-request-form"
import WithAuthProtection from "@/components/auth/with-auth-protection"
import { useAuth } from "@/components/mock-auth-provider"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function NewTenantMaintenanceRequestPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is loaded and not a tenant, redirect to appropriate dashboard
    if (!isLoading && user && user.role !== "tenant") {
      router.push(`/dashboard/${user.role}`)
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <WithAuthProtection requiredRole="tenant">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Maintenance Request</h1>
          <p className="text-muted-foreground">Report a maintenance issue for your rental property</p>
        </div>

        <MaintenanceRequestForm />
      </div>
    </WithAuthProtection>
  )
}
