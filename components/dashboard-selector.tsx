"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Users, Wrench, BarChart } from "lucide-react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSelector() {
  const { profile, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Redirect based on role
  const navigateToDashboard = (role: string) => {
    switch (role) {
      case "admin":
        router.push("/dashboard/admin")
        break
      case "landlord":
        router.push("/dashboard/landlord")
        break
      case "tenant":
        router.push("/dashboard/tenant")
        break
      case "maintenance":
        router.push("/dashboard/maintenance/dashboard")
        break
      default:
        router.push("/dashboard")
    }
  }

  // If user has a role, redirect to their dashboard
  if (profile?.role) {
    navigateToDashboard(profile.role)
    return null
  }

  // Otherwise show dashboard options
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Select Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigateToDashboard("admin")} className="w-full">
              Access Admin Dashboard
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Landlord</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigateToDashboard("landlord")} className="w-full">
              Access Landlord Dashboard
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenant</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigateToDashboard("tenant")} className="w-full">
              Access Tenant Dashboard
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigateToDashboard("maintenance")} className="w-full">
              Access Maintenance Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
