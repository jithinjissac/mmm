"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertTriangle, CheckCircle, Clock, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import type { MaintenanceRequest } from "@/types/maintenance"

// Update the interface to include userRole
interface MaintenanceDetailsProps {
  requestId: string
  userRole?: string
}

// Update the function signature
export function MaintenanceDetails({ requestId, userRole }: MaintenanceDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: isAuthLoading } = useAuth()

  // Use the passed userRole or get it from the auth context
  const role = userRole || user?.role

  const [maintenanceRequest, setMaintenanceRequest] = useState<MaintenanceRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMaintenanceRequest = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Simulate API call to get maintenance request details
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // For demo purposes, create a mock maintenance request
        const mockRequest: MaintenanceRequest = {
          id: requestId,
          property_id: "prop-1",
          room_id: "room-1",
          tenant_id: "tenant-1",
          landlord_id: "landlord-1",
          title: "Leaking Kitchen Sink",
          description:
            "The kitchen sink has been leaking for the past two days. Water is collecting in the cabinet underneath.",
          category: "plumbing",
          priority: "medium",
          status: "new",
          reported_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          images: ["/leaky-pipe-under-sink.png", "/dripping-chrome-faucet.png"],
          notes: "Will need to replace the sink trap. Parts ordered.",
        }

        setMaintenanceRequest(mockRequest)
      } catch (error) {
        console.error("Error fetching maintenance request:", error)
        setError("Failed to load maintenance request details. Please try again.")

        toast({
          title: "Error",
          description: "Failed to load maintenance request details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (requestId) {
      fetchMaintenanceRequest()
    }
  }, [requestId, toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="outline">New</Badge>
      case "in-progress":
        return <Badge variant="secondary">In Progress</Badge>
      case "scheduled":
        return <Badge variant="default">Scheduled</Badge>
      case "completed":
        return <Badge variant="success">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline">Low</Badge>
      case "medium":
        return <Badge variant="secondary">Medium</Badge>
      case "high":
        return <Badge variant="warning">High</Badge>
      case "emergency":
        return <Badge variant="destructive">Emergency</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  // Update the handleBack function to use the role
  const handleBack = () => {
    if (role === "tenant") {
      router.push("/dashboard/tenant/maintenance")
    } else if (role === "landlord") {
      router.push("/dashboard/landlord/maintenance")
    } else if (role === "maintenance") {
      router.push("/dashboard/maintenance/dashboard")
    } else {
      router.push("/dashboard")
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!maintenanceRequest) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Maintenance Request Not Found</CardTitle>
          <CardDescription>The requested maintenance request could not be found.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>
              The maintenance request you are looking for does not exist or has been removed.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={handleBack} variant="outline" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Maintenance Dashboard
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{maintenanceRequest.title}</CardTitle>
            <CardDescription>
              Request ID: {maintenanceRequest.id} • Reported on{" "}
              {format(new Date(maintenanceRequest.reported_date), "PPP")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(maintenanceRequest.status)}
            {getPriorityBadge(maintenanceRequest.priority)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">{maintenanceRequest.description}</p>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2">Details</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Category</dt>
              <dd className="text-sm">{maintenanceRequest.category}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Location</dt>
              <dd className="text-sm">
                Property ID: {maintenanceRequest.property_id}
                {maintenanceRequest.room_id && <>, Room ID: {maintenanceRequest.room_id}</>}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Reported By</dt>
              <dd className="text-sm">
                {maintenanceRequest.tenant_id ? "Tenant ID: " + maintenanceRequest.tenant_id : "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Assigned To</dt>
              <dd className="text-sm">
                {maintenanceRequest.assigned_to ? maintenanceRequest.assigned_to : "Not yet assigned"}
              </dd>
            </div>
          </dl>
        </div>

        {maintenanceRequest.notes && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-muted-foreground">{maintenanceRequest.notes}</p>
            </div>
          </>
        )}

        {maintenanceRequest.images && maintenanceRequest.images.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {maintenanceRequest.images.map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Maintenance issue ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {maintenanceRequest.status === "scheduled" && maintenanceRequest.scheduled_date && (
          <>
            <Separator />
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Scheduled</AlertTitle>
              <AlertDescription>
                This maintenance request is scheduled for{" "}
                {format(new Date(maintenanceRequest.scheduled_date), "PPP 'at' p")}
              </AlertDescription>
            </Alert>
          </>
        )}

        {maintenanceRequest.status === "completed" && maintenanceRequest.completed_date && (
          <>
            <Separator />
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Completed</AlertTitle>
              <AlertDescription>
                This maintenance request was completed on {format(new Date(maintenanceRequest.completed_date), "PPP")}
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleBack} variant="outline" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Different actions based on user role */}
        {role === "landlord" && maintenanceRequest.status !== "completed" && (
          <div className="flex gap-2">
            {maintenanceRequest.status === "new" && <Button variant="default">Assign Maintenance Staff</Button>}
            <Button variant="outline">Update Status</Button>
          </div>
        )}

        {role === "maintenance" && maintenanceRequest.status !== "completed" && (
          <div className="flex gap-2">
            {maintenanceRequest.status === "new" && <Button variant="default">Accept Request</Button>}
            {maintenanceRequest.status === "in-progress" && <Button variant="default">Mark as Completed</Button>}
            <Button variant="outline">Add Notes</Button>
          </div>
        )}

        {role === "tenant" && maintenanceRequest.status === "new" && <Button variant="outline">Cancel Request</Button>}
      </CardFooter>
    </Card>
  )
}
