"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Wrench, Clock, CheckCircle, ArrowLeft, Building, User, Calendar } from "lucide-react"
import { MockDataService, simulateApiDelay } from "@/lib/mock-data-service"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"

export default function WorkOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [workOrder, setWorkOrder] = useState<any>(null)
  const [status, setStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const loadWorkOrder = async () => {
      setIsLoading(true)
      try {
        // Simulate API delay
        await simulateApiDelay(800)

        // In a real app, this would be an API call to get a specific work order
        const { data } = await MockDataService.getMaintenanceRequests()
        const order = data.find((o: any) => o.id === params.id)

        if (!order) {
          toast({
            title: "Work order not found",
            description: "The requested work order could not be found.",
            variant: "destructive",
          })
          router.push("/dashboard/maintenance/work-orders")
          return
        }

        setWorkOrder(order)
        setStatus(order.status)
        setNotes(order.notes || "")
      } catch (error) {
        console.error("Error loading work order:", error)
        toast({
          title: "Error",
          description: "Failed to load work order details.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadWorkOrder()
    }
  }, [params.id, router, toast])

  const handleUpdateWorkOrder = async () => {
    setIsUpdating(true)
    try {
      // Simulate API delay
      await simulateApiDelay(1200)

      // In a real app, this would be an API call to update the work order
      const updatedWorkOrder = {
        ...workOrder,
        status,
        notes,
        updated_at: new Date().toISOString(),
      }

      setWorkOrder(updatedWorkOrder)

      toast({
        title: "Work order updated",
        description: "The work order has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating work order:", error)
      toast({
        title: "Error",
        description: "Failed to update work order.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!workOrder) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/maintenance/work-orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work Orders
        </Button>
        <Badge
          variant={
            workOrder.status === "completed" ? "outline" : workOrder.status === "in_progress" ? "secondary" : "default"
          }
          className="text-sm"
        >
          {workOrder.status === "in_progress"
            ? "In Progress"
            : workOrder.status === "completed"
              ? "Completed"
              : "Pending"}
        </Badge>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{workOrder.title}</h1>
        <p className="text-muted-foreground mt-2">
          Work Order #{workOrder.id} • Reported on {new Date(workOrder.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{workOrder.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Update the status and add notes to this work order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about the work order..."
                  rows={5}
                />
              </div>

              <Button onClick={handleUpdateWorkOrder} disabled={isUpdating} className="w-full">
                {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Work Order
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: "Work order created",
                    user: "Alice Johnson",
                    timestamp: workOrder.created_at,
                    details: "Tenant reported issue",
                  },
                  {
                    action: "Status updated to In Progress",
                    user: "Maintenance Team",
                    timestamp: "2023-06-05T10:30:00Z",
                    details: "Scheduled for inspection",
                  },
                  {
                    action: "Inspection completed",
                    user: "Bob Smith",
                    timestamp: "2023-06-06T14:15:00Z",
                    details: "Parts ordered for repair",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex">
                    <div className="mr-4 flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {index === 0 ? (
                          <Clock className="h-5 w-5 text-primary" />
                        ) : index === 1 ? (
                          <Wrench className="h-5 w-5 text-primary" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      {index < 2 && <div className="h-full w-0.5 bg-border mt-2"></div>}
                    </div>
                    <div className="pb-6">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                      </p>
                      <p className="text-sm mt-1">{activity.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="font-medium">{workOrder.property_name}</p>
                  <p className="text-sm text-muted-foreground">123 Main Street, Apt 4B</p>
                </div>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="font-medium">Alice Johnson</p>
                  <p className="text-sm text-muted-foreground">Tenant</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="font-medium">Priority: {workOrder.priority}</p>
                  <p className="text-sm text-muted-foreground">
                    {workOrder.priority === "high"
                      ? "Requires immediate attention"
                      : workOrder.priority === "medium"
                        ? "Address within 48 hours"
                        : "Address when convenient"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 text-center">
                <div className="h-32 flex items-center justify-center">
                  <img src="/leaky-pipe-under-sink.png" alt="Issue photo" className="max-h-full rounded-md" />
                </div>
                <p className="text-sm mt-2">Photo of issue</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full">
                <User className="h-4 w-4 mr-2" />
                Contact Tenant
              </Button>
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Visit
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/maintenance/details/${workOrder.id}`}>
                  <Wrench className="h-4 w-4 mr-2" />
                  View Full Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
