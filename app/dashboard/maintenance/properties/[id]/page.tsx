"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Building, MapPin, Wrench, Clock, CheckCircle, Plus } from "lucide-react"
import { MockDataService, simulateApiDelay } from "@/lib/mock-data-service"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"

export default function PropertyMaintenancePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [property, setProperty] = useState<any>(null)
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([])

  useEffect(() => {
    const loadPropertyData = async () => {
      setIsLoading(true)
      try {
        // Simulate API delay
        await simulateApiDelay(800)

        // In a real app, these would be API calls
        const { data: propertiesData } = await MockDataService.getProperties()
        const property = propertiesData.find((p: any) => p.id === params.id)

        if (!property) {
          toast({
            title: "Property not found",
            description: "The requested property could not be found.",
            variant: "destructive",
          })
          router.push("/dashboard/maintenance/properties")
          return
        }

        setProperty(property)

        // Get maintenance requests for this property
        const { data: maintenanceData } = await MockDataService.getMaintenanceRequests()
        // Filter requests for this property (in a real app, this would be done server-side)
        const propertyRequests = maintenanceData.filter((r: any) => r.property_id === params.id)
        setMaintenanceRequests(propertyRequests)
      } catch (error) {
        console.error("Error loading property data:", error)
        toast({
          title: "Error",
          description: "Failed to load property details.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadPropertyData()
    }
  }, [params.id, router, toast])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!property) return null

  const pendingRequests = maintenanceRequests.filter((r) => r.status === "pending")
  const inProgressRequests = maintenanceRequests.filter((r) => r.status === "in_progress")
  const completedRequests = maintenanceRequests.filter((r) => r.status === "completed")

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/maintenance/properties")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{property.name}</h1>
          <div className="flex items-center mt-2 text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.address}</span>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/maintenance/work-orders/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <div className="relative h-[200px]">
              <img
                src={property.image_url || "/suburban-house-exterior.png"}
                alt={property.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  <p className="font-medium capitalize">{property.property_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-medium">{property.bedrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-medium">{property.bathrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Landlord</p>
                  <p className="font-medium">{property.landlord_name || "John Smith"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year Built</p>
                  <p className="font-medium">{property.year_built || "2010"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Inspection</p>
                  <p className="font-medium">{property.last_inspection || "June 15, 2023"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Work Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <WorkOrderList workOrders={maintenanceRequests} />
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <WorkOrderList workOrders={pendingRequests} />
            </TabsContent>

            <TabsContent value="in-progress" className="mt-6">
              <WorkOrderList workOrders={inProgressRequests} />
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <WorkOrderList workOrders={completedRequests} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="font-medium">{pendingRequests.length}</p>
                </div>
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-xs text-muted-foreground">In Progress</p>
                  <p className="font-medium">{inProgressRequests.length}</p>
                </div>
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="font-medium">{completedRequests.length}</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm font-medium">Recent Activity</p>
                <div className="space-y-3 mt-2">
                  {[
                    {
                      action: "Work order completed",
                      date: "June 10, 2023",
                      description: "Plumbing repair in bathroom",
                    },
                    {
                      action: "Inspection completed",
                      date: "June 5, 2023",
                      description: "Annual property inspection",
                    },
                    {
                      action: "New work order",
                      date: "May 28, 2023",
                      description: "Heating system maintenance",
                    },
                  ].map((activity, index) => (
                    <div key={index} className="flex">
                      <div className="mr-3 flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {index === 0 ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : index === 1 ? (
                            <Building className="h-4 w-4 text-primary" />
                          ) : (
                            <Wrench className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        {index < 2 && <div className="h-full w-0.5 bg-border mt-1"></div>}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                        <p className="text-xs mt-1">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    date: "June 15, 2023",
                    time: "10:00 AM",
                    task: "Electrical inspection",
                  },
                  {
                    date: "June 22, 2023",
                    time: "2:00 PM",
                    task: "HVAC maintenance",
                  },
                ].map((appointment, index) => (
                  <div key={index} className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{appointment.task}</p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.date} at {appointment.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Full Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function WorkOrderList({ workOrders }: { workOrders: any[] }) {
  if (workOrders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No work orders found</p>
          <p className="text-muted-foreground">There are no work orders in this category.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {workOrders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{order.title}</h3>
                <p className="text-muted-foreground mt-1">{order.description}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Reported: </span>
                    <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Priority: </span>
                    <span className="font-medium capitalize">{order.priority}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Badge
                  variant={
                    order.status === "completed" ? "outline" : order.status === "in_progress" ? "secondary" : "default"
                  }
                >
                  {order.status === "in_progress"
                    ? "In Progress"
                    : order.status === "completed"
                      ? "Completed"
                      : "Pending"}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/dashboard/maintenance/work-orders/${order.id}`}>View Details</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
