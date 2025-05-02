"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Wrench, Clock, CheckCircle } from "lucide-react"
import { MockDataService, simulateApiDelay } from "@/lib/mock-data-service"
import { useAuth } from "@/components/mock-auth-provider"

export default function MaintenanceWorkOrdersPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const loadWorkOrders = async () => {
      setIsLoading(true)
      try {
        // Simulate API delay
        await simulateApiDelay(800)

        // Load maintenance requests
        const { data } = await MockDataService.getMaintenanceRequests()
        setWorkOrders(data || [])
      } catch (error) {
        console.error("Error loading work orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkOrders()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const pendingWorkOrders = workOrders.filter((order) => order.status === "pending")
  const inProgressWorkOrders = workOrders.filter((order) => order.status === "in_progress")
  const completedWorkOrders = workOrders.filter((order) => order.status === "completed")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
        <p className="text-muted-foreground">Manage and track maintenance work orders across all properties.</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Card className="w-[200px]">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-amber-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <p className="text-2xl font-bold">{pendingWorkOrders.length}</p>
            </CardContent>
          </Card>
          <Card className="w-[200px]">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Wrench className="h-4 w-4 mr-2 text-blue-500" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <p className="text-2xl font-bold">{inProgressWorkOrders.length}</p>
            </CardContent>
          </Card>
          <Card className="w-[200px]">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <p className="text-2xl font-bold">{completedWorkOrders.length}</p>
            </CardContent>
          </Card>
        </div>
        <Button asChild>
          <Link href="/dashboard/maintenance/work-orders/new">
            <Wrench className="mr-2 h-4 w-4" />
            New Work Order
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <WorkOrderList workOrders={workOrders} />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <WorkOrderList workOrders={pendingWorkOrders} />
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <WorkOrderList workOrders={inProgressWorkOrders} />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <WorkOrderList workOrders={completedWorkOrders} />
        </TabsContent>
      </Tabs>
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
                    <span className="text-muted-foreground">Property: </span>
                    <span className="font-medium">{order.property_name}</span>
                  </div>
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
                  <Link href={`/dashboard/maintenance/work-orders/${order.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
