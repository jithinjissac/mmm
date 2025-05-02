import type { Metadata } from "next"
import { DisputeList } from "@/components/disputes/dispute-list"

export const metadata: Metadata = {
  title: "Dispute Moderation | UK Rental Solution",
  description: "Moderate and resolve disputes between landlords and tenants",
}

export default function AdminDisputesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dispute Moderation</h1>
        <p className="text-muted-foreground">Review and moderate disputes between landlords and tenants</p>
      </div>

      <DisputeList role="admin" />
    </div>
  )
}
