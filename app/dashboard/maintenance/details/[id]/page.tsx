"use client"

import { MaintenanceDetails } from "@/components/maintenance/maintenance-details"
import WithAuthProtection from "@/components/auth/with-auth-protection"

interface MaintenanceRequestPageProps {
  params: {
    id: string
  }
}

export default function MaintenanceStaffRequestPage({ params }: MaintenanceRequestPageProps) {
  return (
    <WithAuthProtection requiredRole="maintenance">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Request Details</h1>
          <p className="text-muted-foreground">View and update maintenance request details</p>
        </div>

        <MaintenanceDetails requestId={params.id} />
      </div>
    </WithAuthProtection>
  )
}
