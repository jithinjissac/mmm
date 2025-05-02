"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Home, Wrench, CreditCard, Star, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/mock-auth-provider"
import { CredibilityScore } from "@/components/reviews/credibility-score"

export default function TenantDashboardPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [rentalInfo, setRentalInfo] = useState<any>(null)
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Mock rental info
        setRentalInfo({
          propertyName: "Cozy Apartment",
          address: "123 Main St, London",
          landlordName: "Sarah Williams",
          rentAmount: 1200,
          leaseEnd: new Date(2024, 11, 31).toISOString(),
        })

        // Mock maintenance requests
        setMaintenanceRequests([
          {
            id: "maint1",
            title: "Leaky Faucet",
            status: "in_progress",
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "maint2",
            title: "Heating Issue",
            status: "pending",
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ])

        // Mock payments
        setPayments([
          {
            id: "pay1",
            amount: 1200,
            status: "paid",
            due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            payment_type: "rent",
          },
          {
            id: "pay2",
            amount: 1200,
            status: "pending",
            due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            payment_type: "rent",
          },
        ])

        // Mock reviews
        const mockReviews = [
          {
            id: "rev1",
            reviewerId: "landlord1",
            reviewerName: "Sarah Williams",
            rating: 5,
            comment: "Excellent tenant. Always paid rent on time and kept the property in great condition.",
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            points: 50,
          },
          {
            id: "rev2",
            reviewerId: "landlord2",
            reviewerName: "Robert Brown",
            rating: 4,
            comment: "Good tenant overall. Communicated well about issues.",
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            points: 40,
          },
        ]

        setReviews(mockReviews)

        // Calculate average rating
        const totalRating = mockReviews.reduce((sum, review) => sum + review.rating, 0)
        setAverageRating(totalRating / mockReviews.length)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tenant Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your tenant dashboard. Manage your rental, maintenance requests, and more.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rental</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rentalInfo?.propertyName || "None"}</div>
            <p className="text-xs text-muted-foreground">{rentalInfo?.address || "No active rental"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              {maintenanceRequests.filter((r) => r.status === "pending").length} pending requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{payments.find((p) => p.status === "pending")?.amount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Due on{" "}
              {payments.find((p) => p.status === "pending")
                ? new Date(payments.find((p) => p.status === "pending")!.due_date).toLocaleDateString()
                : "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">From {reviews.length} reviews</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="credibility">Credibility</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Rental</CardTitle>
                <CardDescription>Details about your current rental property</CardDescription>
              </CardHeader>
              <CardContent>
                {!rentalInfo ? (
                  <p>No active rental found.</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{rentalInfo.propertyName}</h3>
                      <p className="text-sm text-muted-foreground">{rentalInfo.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Landlord</p>
                        <p>{rentalInfo.landlordName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Rent</p>
                        <p>£{rentalInfo.rentAmount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lease Ends</p>
                        <p>{new Date(rentalInfo.leaseEnd).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/tenant/rental/details">View Details</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Reviews from your landlords</CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p>No reviews found.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 2).map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between">
                          <h3 className="font-semibold">{review.reviewerName}</h3>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>{review.rating}/5</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                        <div className="flex justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            Posted on {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                          <Badge variant="outline">+{review.points} points</Badge>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/reviews">View All Reviews</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="maintenance" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>Track your maintenance requests</CardDescription>
              </div>
              <Button asChild>
                <Link href="/dashboard/tenant/maintenance/new">Report Issue</Link>
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
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted on {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/tenant/maintenance">View All Requests</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Track your rent payments</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p>No payment history found.</p>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">
                          {payment.payment_type === "rent" ? "Monthly Rent" : "Utilities"}
                        </h3>
                        <Badge
                          variant={payment.status === "paid" ? "outline" : "default"}
                          className={payment.status === "paid" ? "bg-green-50 text-green-700 border-green-200" : ""}
                        >
                          {payment.status === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-sm text-muted-foreground">
                          Due on {new Date(payment.due_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium">£{payment.amount}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/tenant/payments">View All Payments</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="credibility" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CredibilityScore userId={user?.id || ""} userType="tenant" />

            <Card>
              <CardHeader>
                <CardTitle>How to Improve Your Score</CardTitle>
                <CardDescription>Tips to increase your credibility</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Pay Rent On Time</p>
                      <p className="text-sm text-muted-foreground">
                        Consistent on-time payments boost your reliability score
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Home className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Maintain the Property</p>
                      <p className="text-sm text-muted-foreground">
                        Keep the property clean and report issues promptly
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Complete Tenancy Successfully</p>
                      <p className="text-sm text-muted-foreground">
                        Finishing your lease term earns significant points
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
