"use client"

import { PropertyForm } from "@/components/properties/property-form"
import { VerificationCheck } from "@/components/verification/verification-check"
import { VerificationProvider } from "@/lib/verification/verification-context"

export default function AddPropertyPage() {
  return (
    <VerificationProvider>
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Property</h1>
            <p className="text-muted-foreground">Create a new property listing to manage in your portfolio.</p>
          </div>
          <VerificationCheck requiredFor={["/dashboard/landlord/properties/add"]}>
            <PropertyForm />
          </VerificationCheck>
        </div>
      </div>
    </VerificationProvider>
  )
}
