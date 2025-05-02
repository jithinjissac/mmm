"use client"

import { useParams } from "next/navigation"
import { MaintenanceDetails } from "@/components/maintenance/maintenance-details"
import WithAuthProtection from "@/components/auth/with-auth-protection"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TenantMaintenanceDetailsPage() {
  const params = useParams()
  const requestId = params.id as string
  const router = useRouter()

  // Redirect if the ID is "new" to avoid conflict
  useEffect(() => {
    if (requestId === "new") {
      router.push("/dashboard/tenant/maintenance/new")
    }
  }, [requestId, router])

  // Don't render anything if the ID is "new"
  if (requestId === "new") {
    return null
  }

  return (
    <WithAuthProtection requiredRole="tenant">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Request Details</h1>
          <p className="text-muted-foreground">View the details of your maintenance request</p>
        </div>

        <MaintenanceDetails requestId={requestId} userRole="tenant" />
      </div>
    </WithAuthProtection>
  )
}
