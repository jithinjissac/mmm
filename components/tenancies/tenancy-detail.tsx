"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, PoundSterling, FileText, AlertTriangle, MessageSquare } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"
import { ReviewList } from "@/components/reviews/review-list"

// Mock tenancy data
const MOCK_TENANCIES = [
  {
    id: "tenancy1",
    listing_id: "listing1",
    listing_title: "Modern City Apartment",
    room_id: "room1",
    room_name: "Master Bedroom",
    landlord_id: "landlord1",
    landlord_name: "John Smith",
    tenant_id: "tenant1",
    tenant_name: "Alice Johnson",
    rent: 800,
    deposit: 1000,
    deposit_paid: true,
    start_date: "2023-07-15",
    end_date: "2024-07-14",
    status: "active",
    agreement_signed: true,
    created_at: "2023-06-10T14:30:00Z",
    payments: [
      {
        id: "payment1",
        amount: 800,
        type: "rent",
        status: "paid",
        due_date: "2023-07-15",
        paid_date: "2023-07-14",
      },
      {
        id: "payment2",
        amount: 800,
        type: "rent",
        status: "paid",
        due_date: "2023-08-15",
        paid_date: "2023-08-13",
      },
      {
        id: "payment3",
        amount: 800,
        type: "rent",
        status: "due",
        due_date: "2023-09-15",
        paid_date: null,
      },
      {
        id: "payment4",
        amount: 1000,
        type: "deposit",
        status: "paid",
        due_date: "2023-07-01",
        paid_date: "2023-07-01",
      },
    ],
    issues: [
      {
        id: "issue1",
        description: "Leaking tap in bathroom",
        status: "resolved",
        created_at: "2023-07-20T09:15:00Z",
        resolved_at: "2023-07-22T14:30:00Z",
        resolution_notes: "Plumber replaced the washer in the tap",
      },
      {
        id: "issue2",
        description: "Heating not working properly",
        status: "pending",
        created_at: "2023-08-10T16:45:00Z",
        resolved_at: null,
        resolution_notes: null,
      },
    ],
    property_image: "/cozy-city-apartment.png",
  },
  // Other tenancies...
]

export function TenancyDetail() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [tenancy, setTenancy] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTenancy = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const foundTenancy = MOCK_TENANCIES.find((t) => t.id === params.id)
        if (!foundTenancy) {
          toast({
            title: "Tenancy not found",
            description: "The tenancy you're looking for doesn't exist or has been removed.",
            variant: "destructive",
          })
          router.push("/tenancies")
          return
        }

        setTenancy(foundTenancy)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load tenancy details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchTenancy()
    }
  }, [params.id, router, toast])

  const handlePayRent = () => {
    router.push(`/pay/${params.id}`)
  }

  const handleReportIssue = () => {
    router.push(`/issue/${params.id}`)
  }

  const handleResolveIssue = (issueId: string) => {
    router.push(`/resolve/${issueId}`)
  }

  const handleViewAgreement = () => {
    router.push(`/agreement/${params.id}`)
  }

  const handleMessages = () => {
    router.push(`/messages/${params.id}`)
  }

  const handleReview = () => {
    router.push(`/review/${params.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!tenancy) return null

  const nextPayment = tenancy.payments.find((p: any) => p.status === "due" && p.type === "rent")
  const isLandlord = user?.role === "landlord"
  const isTenant = user?.role === "tenant"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {tenancy.listing_title} - {tenancy.room_name}
          </h1>
          <div className="flex items-center mt-2">
            <Badge variant={tenancy.status === "active" ? "success" : "default"}>
              {tenancy.status === "active" ? "Active Tenancy" : "Inactive"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {isTenant && nextPayment && (
            <Button onClick={handlePayRent}>
              <PoundSterling className="h-4 w-4 mr-2" /> Pay Rent
            </Button>
          )}
          {isTenant && (
            <Button variant="outline" onClick={handleReportIssue}>
              <AlertTriangle className="h-4 w-4 mr-2" /> Report Issue
            </Button>
          )}
          <Button variant="outline" onClick={handleMessages}>
            <MessageSquare className="h-4 w-4 mr-2" /> Messages
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="agreement">Agreement</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tenancy Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Property</p>
                      <p className="font-medium">{tenancy.listing_title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Room</p>
                      <p className="font-medium">{tenancy.room_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{tenancy.start_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{tenancy.end_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Rent</p>
                      <p className="font-medium">£{tenancy.rent}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deposit</p>
                      <p className="font-medium">
                        £{tenancy.deposit} {tenancy.deposit_paid ? "(Paid)" : "(Unpaid)"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Landlord</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{tenancy.landlord_name}</p>
                        <p className="text-sm text-muted-foreground">Property Owner</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tenant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{tenancy.tenant_name}</p>
                        <p className="text-sm text-muted-foreground">Tenant</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Paid Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenancy.payments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell className="capitalize">{payment.type}</TableCell>
                          <TableCell>£{payment.amount}</TableCell>
                          <TableCell>{payment.due_date}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.status === "paid"
                                  ? "success"
                                  : payment.status === "due"
                                    ? "default"
                                    : "destructive"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{payment.paid_date || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                {isTenant && nextPayment && (
                  <CardFooter>
                    <Button onClick={handlePayRent} className="ml-auto">
                      <PoundSterling className="h-4 w-4 mr-2" /> Pay Rent
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  {tenancy.issues.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No issues reported</h3>
                      <p className="text-muted-foreground mt-2">
                        There are no maintenance issues reported for this tenancy.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Issue</TableHead>
                          <TableHead>Reported On</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Resolution</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tenancy.issues.map((issue: any) => (
                          <TableRow key={issue.id}>
                            <TableCell>{issue.description}</TableCell>
                            <TableCell>{new Date(issue.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={issue.status === "resolved" ? "success" : "default"}>
                                {issue.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{issue.resolution_notes || "-"}</TableCell>
                            <TableCell>
                              {isLandlord && issue.status === "pending" && (
                                <Button variant="outline" size="sm" onClick={() => handleResolveIssue(issue.id)}>
                                  Resolve
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
                {isTenant && (
                  <CardFooter>
                    <Button onClick={handleReportIssue} className="ml-auto">
                      <AlertTriangle className="h-4 w-4 mr-2" /> Report Issue
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="agreement" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tenancy Agreement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-6 rounded-md flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Tenancy Agreement</h3>
                    <p className="text-muted-foreground text-center mt-2 mb-4">
                      {tenancy.agreement_signed
                        ? "The tenancy agreement has been signed by all parties."
                        : "The tenancy agreement is pending signature."}
                    </p>
                    <Button onClick={handleViewAgreement}>View Agreement</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{tenancy.start_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{tenancy.end_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Rent</p>
                      <p className="font-medium">£{tenancy.rent}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deposit</p>
                      <p className="font-medium">£{tenancy.deposit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                  <CardDescription>Reviews for this tenancy</CardDescription>
                </CardHeader>
                <CardContent>
                  <ReviewList tenancyId={params.id as string} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="relative h-48">
              <img
                src={tenancy.property_image || "/placeholder.svg"}
                alt={tenancy.listing_title}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>
            <CardHeader>
              <CardTitle>{tenancy.listing_title}</CardTitle>
              <CardDescription>{tenancy.room_name}</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={handleMessages}>
                <MessageSquare className="h-4 w-4 mr-2" /> Messages
              </Button>

              {isTenant && (
                <Button variant="outline" className="w-full" onClick={handleReview}>
                  Write a Review
                </Button>
              )}

              <Button variant="outline" className="w-full" onClick={handleViewAgreement}>
                <FileText className="h-4 w-4 mr-2" /> View Agreement
              </Button>
            </CardContent>
          </Card>

          {nextPayment && isTenant && (
            <Card>
              <CardHeader>
                <CardTitle>Next Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">£{nextPayment.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{nextPayment.due_date}</p>
                </div>
                <Button className="w-full" onClick={handlePayRent}>
                  <PoundSterling className="h-4 w-4 mr-2" /> Pay Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
