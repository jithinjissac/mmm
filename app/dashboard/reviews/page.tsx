"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Star, ThumbsUp, Award, Flag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/mock-auth-provider"
import { simulateApiDelay } from "@/lib/mock-data-service"

export default function ReviewsPage() {
  const { user, userRole } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [receivedReviews, setReceivedReviews] = useState<any[]>([])
  const [givenReviews, setGivenReviews] = useState<any[]>([])
  const [propertyReviews, setPropertyReviews] = useState<any[]>([])
  const [credibilityScore, setCredibilityScore] = useState(0)
  const [credibilityLevel, setCredibilityLevel] = useState("")

  useEffect(() => {
    const loadReviewData = async () => {
      setIsLoading(true)
      try {
        // Simulate API delay
        await simulateApiDelay(800)

        // Mock received reviews data
        const mockReceivedReviews =
          userRole === "landlord"
            ? [
                {
                  id: "rev1",
                  reviewerId: "tenant1",
                  reviewerName: "John Doe",
                  rating: 4,
                  comment: "Great landlord, very responsive to maintenance requests.",
                  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                  category: "Communication",
                  points: 40,
                },
                {
                  id: "rev2",
                  reviewerId: "tenant2",
                  reviewerName: "Jane Smith",
                  rating: 5,
                  comment: "Excellent experience. Property was well-maintained and issues were addressed promptly.",
                  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                  category: "Property Maintenance",
                  points: 50,
                },
                {
                  id: "rev3",
                  reviewerId: "tenant3",
                  reviewerName: "Mike Johnson",
                  rating: 4,
                  comment: "Responsive and professional. Would rent from again.",
                  createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                  category: "Professionalism",
                  points: 40,
                },
              ]
            : [
                {
                  id: "rev1",
                  reviewerId: "landlord1",
                  reviewerName: "Sarah Williams",
                  rating: 5,
                  comment: "Excellent tenant. Always paid rent on time and kept the property in great condition.",
                  createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                  category: "Payment Reliability",
                  points: 50,
                },
                {
                  id: "rev2",
                  reviewerId: "landlord2",
                  reviewerName: "Robert Brown",
                  rating: 4,
                  comment: "Good tenant overall. Communicated well about issues.",
                  createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                  category: "Property Care",
                  points: 40,
                },
              ]

        // Mock given reviews data
        const mockGivenReviews =
          userRole === "landlord"
            ? [
                {
                  id: "grev1",
                  revieweeId: "tenant1",
                  revieweeName: "John Doe",
                  rating: 5,
                  comment: "Great tenant, always paid rent on time and kept the property clean.",
                  createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                  category: "Payment Reliability",
                },
                {
                  id: "grev2",
                  revieweeId: "tenant2",
                  revieweeName: "Jane Smith",
                  rating: 4,
                  comment: "Good tenant, communicated well about issues.",
                  createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
                  category: "Communication",
                },
              ]
            : [
                {
                  id: "grev1",
                  revieweeId: "landlord1",
                  revieweeName: "Sarah Williams",
                  rating: 4,
                  comment: "Responsive landlord who addressed maintenance issues quickly.",
                  createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                  category: "Responsiveness",
                },
              ]

        // Mock property reviews data (only for landlords)
        const mockPropertyReviews =
          userRole === "landlord"
            ? [
                {
                  id: "prev1",
                  propertyId: "prop1",
                  propertyName: "Cozy Apartment",
                  reviewerId: "tenant1",
                  reviewerName: "John Doe",
                  rating: 4,
                  comment: "Great location and amenities. Some minor maintenance issues.",
                  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                  id: "prev2",
                  propertyId: "prop2",
                  propertyName: "Modern Townhouse",
                  reviewerId: "tenant2",
                  reviewerName: "Jane Smith",
                  rating: 5,
                  comment: "Excellent property in a quiet neighborhood. Everything works perfectly.",
                  createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                },
              ]
            : []

        setReceivedReviews(mockReceivedReviews)
        setGivenReviews(mockGivenReviews)
        setPropertyReviews(mockPropertyReviews)

        // Calculate credibility score
        const totalPoints = mockReceivedReviews.reduce((sum, review) => sum + (review.points || 0), 0)
        setCredibilityScore(totalPoints)

        // Determine credibility level
        if (totalPoints >= 120) {
          setCredibilityLevel("Gold")
        } else if (totalPoints >= 80) {
          setCredibilityLevel("Silver")
        } else {
          setCredibilityLevel("Bronze")
        }
      } catch (error) {
        console.error("Error loading review data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadReviewData()
    }
  }, [user, userRole])

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
        <h1 className="text-3xl font-bold tracking-tight">Reviews & Credibility</h1>
        <p className="text-muted-foreground">Manage your reviews and track your credibility score</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credibility Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credibilityScore} points</div>
            <div className="mt-2 flex items-center">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {credibilityLevel} Level
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {receivedReviews.length > 0
                ? (receivedReviews.reduce((sum, review) => sum + review.rating, 0) / receivedReviews.length).toFixed(1)
                : "N/A"}
              /5
            </div>
            <p className="text-xs text-muted-foreground">From {receivedReviews.length} reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {receivedReviews.length > 0
                ? (() => {
                    const categories: Record<string, number> = {}
                    receivedReviews.forEach((review) => {
                      if (review.category) {
                        categories[review.category] = (categories[review.category] || 0) + 1
                      }
                    })
                    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]
                    return topCategory ? topCategory[0] : "None"
                  })()
                : "None"}
            </div>
            <p className="text-xs text-muted-foreground">Your strongest attribute</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="received">
        <TabsList>
          <TabsTrigger value="received">Reviews Received</TabsTrigger>
          <TabsTrigger value="given">Reviews Given</TabsTrigger>
          {userRole === "landlord" && <TabsTrigger value="properties">Property Reviews</TabsTrigger>}
        </TabsList>
        <TabsContent value="received" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviews About You</CardTitle>
              <CardDescription>
                {userRole === "landlord"
                  ? "See what your tenants are saying about you"
                  : "See what your landlords are saying about you"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {receivedReviews.length === 0 ? (
                <p>No reviews received yet.</p>
              ) : (
                <div className="space-y-6">
                  {receivedReviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{review.reviewerName}</h3>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span>{review.rating}/5</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{review.category}</Badge>
                        <Badge variant="secondary">+{review.points || 0} points</Badge>
                      </div>
                      <p className="text-sm mt-2">{review.comment}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-muted-foreground">
                          Posted on {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                        <Button variant="ghost" size="sm">
                          <Flag className="h-3 w-3 mr-1" />
                          Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="given" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviews You've Given</CardTitle>
              <CardDescription>
                {userRole === "landlord" ? "Reviews you've given to tenants" : "Reviews you've given to landlords"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {givenReviews.length === 0 ? (
                <p>You haven't given any reviews yet.</p>
              ) : (
                <div className="space-y-6">
                  {givenReviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{review.revieweeName}</h3>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span>{review.rating}/5</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{review.category}</Badge>
                      </div>
                      <p className="text-sm mt-2">{review.comment}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-muted-foreground">
                          Posted on {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {userRole === "landlord" && (
          <TabsContent value="properties" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Reviews</CardTitle>
                <CardDescription>Reviews for your rental properties</CardDescription>
              </CardHeader>
              <CardContent>
                {propertyReviews.length === 0 ? (
                  <p>No property reviews yet.</p>
                ) : (
                  <div className="space-y-6">
                    {propertyReviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-0">
                        <div className="flex justify-between">
                          <h3 className="font-semibold">{review.propertyName}</h3>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>{review.rating}/5</span>
                          </div>
                        </div>
                        <p className="text-sm mt-2">{review.comment}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-muted-foreground">
                            By {review.reviewerName} on {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                          <Button variant="ghost" size="sm">
                            <Flag className="h-3 w-3 mr-1" />
                            Report
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
