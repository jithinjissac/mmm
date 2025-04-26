import { PropertyOverview } from "@/components/dashboard/property-overview"

export default function LandlordDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Landlord Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to your landlord dashboard. Manage your properties, tenants, and rental income.
      </p>

      <PropertyOverview />
    </div>
  )
}
