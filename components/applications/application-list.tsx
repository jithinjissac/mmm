"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, CheckCircle, XCircle, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"

// Mock application data
const MOCK_APPLICATIONS = [
  {
    id: "app1",
    listing_id: "listing1",
    listing_title: "Modern City Apartment",
    room_id: "room1",
    room_name: "Master Bedroom",
    tenant_id: "tenant1",
    tenant_name: "Alice Johnson",
    tenant_email: "alice@example.com",
    employment_status: "Employed",
    income: "£35,000",
    move_in_date: "2023-07-15",
    additional_info:
      "I'm a professional looking for a long-term rental. I have excellent references from previous landlords.",
    status: "pending",
    created_at: "2023-06-01T10:30:00Z",
  },
  {
    id: "app2",
    listing_id: "listing1",
    listing_title: "Modern City Apartment",
    room_id: "room2",
    room_name: "Single Room",
    tenant_id: "tenant2",
    tenant_name: "Bob Williams",
    tenant_email: "bob@example.com",
    employment_status: "Student",
    income: "£12,000",
    move_in_date: "2023-07-10",
    additional_info: "I'm a final year student looking for accommodation close to university.",
    status: "pending",
    created_at: "2023-06-02T14:45:00Z",
  },
  {
    id: "app3",
    listing_id: "listing2",
    listing_title: "Spacious Family House",
    room_id: "room3",
    room_name: "Entire House",
    tenant_id: "tenant3",
    tenant_name: "Charlie Brown",
    tenant_email: "charlie@example.com",
    employment_status: "Employed",
    income: "£48,000",
    move_in_date: "2023-08-01",
    additional_info:
      "My family and I are looking for a long-term home. We have excellent credit history and references.",
    status: "accepted",
    created_at: "2023-06-03T09:15:00Z",
  },
  {
    id: "app4",
    listing_id: "listing3",
    listing_title: "Cozy Studio Apartment",
    room_id: "room4",
    room_name: "Studio",
    tenant_id: "tenant4",
    tenant_name: "Diana Miller",
    tenant_email: "diana@example.com",
    employment_status: "Self-employed",
    income: "£40,000",
    move_in_date: "2023-07-20",
    additional_info: "I work from home and need a quiet space. I can provide business references and proof of income.",
    status: "rejected",
    created_at: "2023-06-04T16:20:00Z",
    rejection_reason: "Another applicant was selected",
  },
]

export function ApplicationList() {
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Filter applications for the current landlord
        const landlordApplications = MOCK_APPLICATIONS.filter(
          (app) =>
            // In a real app, you would filter by landlord_id
            true,
        )

        setApplications(landlordApplications)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load applications. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [toast, user])

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application)
    setViewDialogOpen(true)
  }

  const handleAcceptApplication = (application: any) => {
    setSelectedApplication(application)
    setActionType("accept")
    setActionDialogOpen(true)
  }

  const handleRejectApplication = (application: any) => {
    setSelectedApplication(application)
    setActionType("reject")
    setActionDialogOpen(true)
  }

  const confirmAction = async () => {
    if (!selectedApplication || !actionType) return

    setIsProcessing(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (actionType === "accept") {
        // Update application status
        setApplications(
          applications.map((app) => (app.id === selectedApplication.id ? { ...app, status: "accepted" } : app)),
        )

        toast({
          title: "Application accepted",
          description: `You have accepted ${selectedApplication.tenant_name}'s application. A tenancy agreement will be created.`,
        })
      } else if (actionType === "reject") {
        // Update application status
        setApplications(
          applications.map((app) =>
            app.id === selectedApplication.id ? { ...app, status: "rejected", rejection_reason: rejectionReason } : app,
          ),
        )

        toast({
          title: "Application rejected",
          description: `You have rejected ${selectedApplication.tenant_name}'s application.`,
        })
      }

      setActionDialogOpen(false)
      setRejectionReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const viewTenantProfile = (tenantId: string) => {
    router.push(`/tenant/${tenantId}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rental Applications</CardTitle>
          <CardDescription>Manage applications for your properties</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No applications yet</h3>
              <p className="text-muted-foreground mt-2">
                When tenants apply for your properties, they will appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Date Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.listing_title}</TableCell>
                    <TableCell>{application.room_name}</TableCell>
                    <TableCell>{application.tenant_name}</TableCell>
                    <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          application.status === "accepted"
                            ? "success"
                            : application.status === "rejected"
                              ? "destructive"
                              : "default"
                        }
                      >
                        {application.status === "accepted"
                          ? "Accepted"
                          : application.status === "rejected"
                            ? "Rejected"
                            : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewApplication(application)}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>

                        {application.status === "pending" && (
                          <>
                            <Button variant="default" size="sm" onClick={() => handleAcceptApplication(application)}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Accept
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectApplication(application)}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Property Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Property</p>
                      <p className="font-medium">{selectedApplication.listing_title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Room</p>
                      <p className="font-medium">{selectedApplication.room_name}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Tenant Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedApplication.tenant_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedApplication.tenant_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Employment Status</p>
                      <p className="font-medium">{selectedApplication.employment_status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Annual Income</p>
                      <p className="font-medium">{selectedApplication.income}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Application Details</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Desired Move-in Date</p>
                    <p className="font-medium">{selectedApplication.move_in_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Additional Information</p>
                    <p className="font-medium">{selectedApplication.additional_info}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Application Date</p>
                    <p className="font-medium">{new Date(selectedApplication.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant={
                        selectedApplication.status === "accepted"
                          ? "success"
                          : selectedApplication.status === "rejected"
                            ? "destructive"
                            : "default"
                      }
                    >
                      {selectedApplication.status === "accepted"
                        ? "Accepted"
                        : selectedApplication.status === "rejected"
                          ? "Rejected"
                          : "Pending"}
                    </Badge>
                    {selectedApplication.status === "rejected" && selectedApplication.rejection_reason && (
                      <p className="text-sm mt-1">Reason: {selectedApplication.rejection_reason}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => viewTenantProfile(selectedApplication.tenant_id)}>
                  View Tenant Profile
                </Button>

                {selectedApplication.status === "pending" && (
                  <div className="space-x-2">
                    <Button
                      variant="default"
                      onClick={() => {
                        setViewDialogOpen(false)
                        handleAcceptApplication(selectedApplication)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Accept
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setViewDialogOpen(false)
                        handleRejectApplication(selectedApplication)
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Accept/Reject Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "accept" ? "Accept Application" : "Reject Application"}</DialogTitle>
            <DialogDescription>
              {actionType === "accept"
                ? "This will create a tenancy agreement that the tenant must sign."
                : "Please provide a reason for rejecting this application."}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Tenant</p>
                <p>{selectedApplication.tenant_name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Property</p>
                <p>
                  {selectedApplication.listing_title} - {selectedApplication.room_name}
                </p>
              </div>

              {actionType === "reject" && (
                <div className="space-y-1">
                  <label htmlFor="rejection-reason" className="text-sm font-medium">
                    Rejection Reason
                  </label>
                  <select
                    id="rejection-reason"
                    className="w-full p-2 border rounded-md"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  >
                    <option value="">Select a reason...</option>
                    <option value="Another applicant was selected">Another applicant was selected</option>
                    <option value="Insufficient income">Insufficient income</option>
                    <option value="Failed reference check">Failed reference check</option>
                    <option value="Incomplete application">Incomplete application</option>
                    <option value="Property no longer available">Property no longer available</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === "accept" ? "default" : "destructive"}
              onClick={confirmAction}
              disabled={isProcessing || (actionType === "reject" && !rejectionReason)}
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionType === "accept" ? "Accept Application" : "Reject Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
