import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function TenantMaintenancePage() {
  const supabase = createServerComponentClient({ cookies })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch maintenance requests from Supabase
  const { data: requests, error } = await supabase
    .from("maintenance_requests")
    .select("*")
    .eq("tenant_id", user?.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching maintenance requests:", error)
  }

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "in_progress":
        return <AlertTriangle className="h-5 w-5 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            Pending
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Maintenance Requests</h1>
        <Link href="/dashboard/tenant/maintenance/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {requests && requests.length > 0 ? (
          requests.map((request) => (
            <Link href={`/dashboard/tenant/maintenance/${request.id}`} key={request.id}>
              <Card className="h-full transition-all hover:bg-accent hover:text-accent-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{request.title}</CardTitle>
                  {getStatusIcon(request.status)}
                </CardHeader>
                <CardContent>
                  <div className="mb-2">{getStatusBadge(request.status)}</div>
                  <CardDescription className="line-clamp-2">{request.description}</CardDescription>
                  <div className="mt-2">
                    <p className="text-sm">
                      <span className="font-medium">Priority:</span> {request.priority || "Medium"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Location:</span> {request.location || "Not specified"}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <h3 className="text-lg font-medium">No maintenance requests found</h3>
            <p className="text-muted-foreground mt-1">Submit a new request if you need maintenance</p>
            <Link href="/dashboard/tenant/maintenance/new" className="mt-4 inline-block">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
