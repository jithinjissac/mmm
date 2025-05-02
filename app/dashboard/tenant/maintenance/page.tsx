"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Wrench, Clock } from "lucide-react"
import { useAuth } from "@/components/mock-auth-provider"
import WithAuthProtection from "@/components/auth/with-auth-protection"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock maintenance requests
const mockMaintenanceRequests = [
  {
    id: "maint-1",
    title: "Leaking Kitchen Sink",
    description:
      "The kitchen sink has been leaking for the past two days. Water is collecting in the cabinet underneath.",
    status: "new",
    priority: "medium",
    category: "plumbing",
    reported_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    property_name: "Cozy City Apartment",
    room_name: "Kitchen",
  },
  {
    id: "maint-2",
    title: "Broken Heating",
    description: "The heating system is not working properly. The apartment is very cold.",
    status: "scheduled",
    priority: "high",
    category: "heating",
    reported_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    property_name: "Cozy City Apartment",
    room_name: "Living Room",
  },
  {
    id: "maint-3",
    title: "Light Fixture Replacement",
    description: "The light fixture in the bathroom is not working. Needs replacement.",
    status: "in-progress",
    priority: "low",
    category: "electrical",
    reported_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    property_name: "Cozy City Apartment",
    room_name: "Bathroom",
  },
  {
    id: "maint-4",
    title: "Window Won't Close",
    description: "The bedroom window doesn't close properly, letting in cold air and noise.",
    status: "completed",
    priority: "medium",
    category: "structural",
    reported_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    completed_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    property_name: "Cozy City Apartment",
    room_name: "Bedroom",
  },
]

export default function TenantMaintenancePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [maintenanceRequests, setMaintenanceRequests] = useState<typeof mockMaintenanceRequests>([])

  useEffect(() => {
    const loadMaintenanceRequests = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setMaintenanceRequests(mockMaintenanceRequests)
      } catch (error) {
        console.error("Error loading maintenance requests:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMaintenanceRequests()
  }, [])

  const handleNewRequest = () => {
    // Change from "/dashboard/tenant/maintenance/(routes)/new" to "/dashboard/tenant/maintenance/new"
    router.push("/dashboard/tenant/maintenance/new")
  }

  const handleViewRequest = (id: string) => {
    router.push(`/dashboard/tenant/maintenance/${id}`)
  }

  const filteredRequests =
    activeTab === "all"
      ? maintenanceRequests
      : maintenanceRequests.filter((request) =>
          activeTab === "active"
            ? ["new", "scheduled", "in-progress"].includes(request.status)
            : request.status === activeTab,
        )

  return (
    <WithAuthProtection requiredRole="tenant">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Maintenance Requests</h1>
            <p className="text-muted-foreground">View and manage your maintenance requests</p>
          </div>
          <Button onClick={handleNewRequest}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : filteredRequests.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{request.title}</CardTitle>
                          <CardDescription>
                            {request.property_name} - {request.room_name}
                          </CardDescription>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
                      <div className="flex items-center mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center mr-4">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>
                            {new Date(request.reported_date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div>
                          <Badge variant="outline" className="capitalize">
                            {request.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => handleViewRequest(request.id)}>
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No maintenance requests found</CardTitle>
                  <CardDescription>
                    {activeTab === "all"
                      ? "You haven't submitted any maintenance requests yet."
                      : `You don't have any ${activeTab} maintenance requests.`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground mb-6">
                    Need something fixed in your rental property?
                    <br />
                    Submit a maintenance request and we'll take care of it.
                  </p>
                  <Button onClick={handleNewRequest}>Submit a Request</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </WithAuthProtection>
  )
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "new":
      return <Badge>New</Badge>
    case "scheduled":
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500">
          Scheduled
        </Badge>
      )
    case "in-progress":
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-500">
          In Progress
        </Badge>
      )
    case "completed":
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Completed
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
