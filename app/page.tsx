import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Home, User, Wrench, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <span className="text-xl font-bold">ARU Rental App</span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  UK Rental Management System
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  A comprehensive solution for managing rental properties, tenants, and maintenance requests.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
              <Card className="flex flex-col items-center text-center">
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-full mx-auto mb-2">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Landlord Dashboard</CardTitle>
                  <CardDescription>Manage your properties and tenants</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <p className="mb-4 text-sm text-gray-500">
                    Access property management, tenant information, and financial reports.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/dashboard/landlord">
                      Access Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center text-center">
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-full mx-auto mb-2">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Tenant Dashboard</CardTitle>
                  <CardDescription>Manage your rental and payments</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <p className="mb-4 text-sm text-gray-500">
                    View your rental details, make payments, and submit maintenance requests.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/dashboard/tenant">
                      Access Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center text-center">
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-full mx-auto mb-2">
                    <Wrench className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Maintenance Dashboard</CardTitle>
                  <CardDescription>Manage maintenance requests</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <p className="mb-4 text-sm text-gray-500">
                    View and manage maintenance requests, schedule repairs, and track progress.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/dashboard/maintenance">
                      Access Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center text-center">
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-full mx-auto mb-2">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Admin Dashboard</CardTitle>
                  <CardDescription>System administration</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <p className="mb-4 text-sm text-gray-500">
                    Manage users, properties, and system settings. View analytics and reports.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/dashboard/admin">
                      Access Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="py-12 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Property Management</h2>
                <p className="text-gray-500">
                  Easily manage your properties, rooms, and tenants. Track rent payments and maintenance requests.
                </p>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Tenant Portal</h2>
                <p className="text-gray-500">
                  Provide tenants with a dedicated portal to view their rental details, make payments, and submit
                  maintenance requests.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
            <p className="text-center text-sm text-gray-500">© 2023 ARU Rental App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
