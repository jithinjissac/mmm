"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wrench, Building, Calendar, Package } from "lucide-react"
import { MockDataService, simulateApiDelay } from "@/lib/mock-data-service"

export default function MaintenanceDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        // Simulate API delay
        await simulateApiDelay(800)

        // Load maintenance requests
        const { data: maintenanceData } = await MockDataService.getMaintenanceRequests()
        setMaintenanceRequests(maintenanceData || [])

        // Load properties
        const { data: propertiesData } = await MockDataService.getProperties()
        setProperties(propertiesData || [])
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Calculate stats
  const pendingRequests = maintenanceRequests.filter((r) => r.status === "pending").length
  const inProgressRequests = maintenanceRequests.filter((r) => r.status === "in_progress").length
  const completedRequests = maintenanceRequests.filter((r) => r.status === "completed").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the maintenance dashboard. Manage maintenance requests and schedules.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressRequests}</div>
            <p className="text-xs text-muted-foreground">Currently being worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequests}</div>
            <p className="text-xs text-muted-foreground">Resolved this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground">Under maintenance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="work-orders">
        <TabsList>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        <TabsContent value="work-orders" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>View and manage maintenance requests</CardDescription>
              </div>
              <Button asChild>
                <Link href="/dashboard/maintenance/work-orders/new">
                  <Wrench className="mr-2 h-4 w-4" />
                  New Work Order
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {maintenanceRequests.length === 0 ? (
                <p>No maintenance requests found.</p>
              ) : (
                <div className="space-y-4">
                  {maintenanceRequests.map((request) => (
                    <div key={request.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{request.title}</h3>
                        <Badge
                          variant={
                            request.status === "completed"
                              ? "outline"
                              : request.status === "in_progress"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {request.status === "in_progress"
                            ? "In Progress"
                            : request.status === "completed"
                              ? "Completed"
                              : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.description}</p>
                      <div className="flex justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          Submitted on {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs font-medium">
                          Priority: {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        </p>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/maintenance/work-orders/${request.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="properties" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Managed Properties</CardTitle>
              <CardDescription>Properties under maintenance management</CardDescription>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <p>No properties found.</p>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{property.name}</h3>
                        <Badge variant="outline">
                          {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{property.address}</p>
                      <div className="mt-2 flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/maintenance/properties/${property.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>Upcoming maintenance appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    date: "Today",
                    appointments: [
                      {
                        time: "10:00 AM",
                        property: "Riverside Apartment",
                        task: "Plumbing repair",
                        status: "Scheduled",
                      },
                      {
                        time: "2:00 PM",
                        property: "City View Flat",
                        task: "Heating inspection",
                        status: "Scheduled",
                      },
                    ],
                  },
                  {
                    date: "Tomorrow",
                    appointments: [
                      {
                        time: "9:30 AM",
                        property: "Garden Cottage",
                        task: "Window repair",
                        status: "Scheduled",
                      },
                    ],
                  },
                  {
                    date: "Wednesday, June 7",
                    appointments: [
                      {
                        time: "11:00 AM",
                        property: "Riverside Apartment",
                        task: "Electrical inspection",
                        status: "Scheduled",
                      },
                    ],
                  },
                ].map((day, index) => (
                  <div key={index}>
                    <h3 className="font-semibold mb-2">{day.date}</h3>
                    <div className="space-y-2">
                      {day.appointments.map((appointment, appIndex) => (
                        <div key={appIndex} className="border-l-2 border-primary pl-4 py-2">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">
                                {appointment.time} - {appointment.property}
                              </p>
                              <p className="text-sm text-muted-foreground">{appointment.task}</p>
                            </div>
                            <Badge variant="outline">{appointment.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
