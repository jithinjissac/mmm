import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, UserRound } from "lucide-react"

export default async function LandlordTenantsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Fetch tenants from Supabase
  const { data: tenants, error } = await supabase.from("tenants").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tenants:", error)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Manage Tenants</h1>
        <Link href="/dashboard/landlord/tenants/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Tenant
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tenants && tenants.length > 0 ? (
          tenants.map((tenant) => (
            <Link href={`/dashboard/landlord/tenants/${tenant.id}`} key={tenant.id}>
              <Card className="h-full transition-all hover:bg-accent hover:text-accent-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {tenant.first_name} {tenant.last_name}
                  </CardTitle>
                  <UserRound className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription>{tenant.email}</CardDescription>
                  <div className="mt-2">
                    <p className="text-sm">
                      <span className="font-medium">Property:</span> {tenant.property_name || "Not assigned"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Room:</span> {tenant.room_number || "Not assigned"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span>{" "}
                      <span className={`${tenant.status === "active" ? "text-green-500" : "text-amber-500"}`}>
                        {tenant.status || "Pending"}
                      </span>
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    Tenant since: {new Date(tenant.created_at).toLocaleDateString()}
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <h3 className="text-lg font-medium">No tenants found</h3>
            <p className="text-muted-foreground mt-1">Add your first tenant to get started</p>
            <Link href="/dashboard/landlord/tenants/add" className="mt-4 inline-block">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Tenant
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
