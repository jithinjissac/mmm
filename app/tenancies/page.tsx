import { TenancyDashboard } from "@/components/tenancies/tenancy-dashboard"

export default function TenanciesPage() {
  return (
    <div className="container max-w-6xl py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Your Tenancies</h1>
      <TenancyDashboard />
    </div>
  )
}
