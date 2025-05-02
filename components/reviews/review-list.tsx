"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Star, Flag, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"

// Mock review data
const MOCK_REVIEWS = [
  {
    id: "review1",
    tenancy_id: "tenancy1",
    reviewer_id: "tenant1",
    reviewer_name: "Alice Johnson",
    reviewer_role: "tenant",
    reviewee_id: "landlord1",
    reviewee_name: "John Smith",
    reviewee_role: "landlord",
    property_id: null,
    property_name: null,
    review_type: "tenant_to_landlord",
    rating: 4,
    comment:
      "Great landlord, very responsive to maintenance requests. The property was well-maintained and any issues were addressed promptly.",
    created_at: "2023-08-15T10:30:00Z",
    flagged: false,
  },
  {
    id: "review2",
    tenancy_id: "tenancy1",
    reviewer_id: "landlord1",
    reviewer_name: "John Smith",
    reviewer_role: "landlord",
    reviewee_id: "tenant1",
    reviewee_name: "Alice Johnson",
    reviewee_role: "tenant",
    property_id: null,
    property_name: null,
    review_type: "landlord_to_tenant",
    rating: 5,
    comment:
      "Alice was an excellent tenant. Always paid rent on time and kept the property in great condition. Would happily rent to her again.",
    created_at: "2023-08-16T14:45:00Z",
    flagged: false,
  },
  {
    id: "review3",
    tenancy_id: "tenancy2",
    reviewer_id: "tenant2",
    reviewer_name: "Bob Williams",
    reviewer_role: "tenant",
    reviewee_id: "landlord1",
    reviewee_name: "John Smith",
    reviewee_role: "landlord",
    property_id: null,
    property_name: null,
    review_type: "tenant_to_landlord",
    rating: 2,
    comment:
      "Slow to respond to maintenance issues. The heating was broken for two weeks in winter before it was fixed.",
    created_at: "2023-07-20T09:15:00Z",
    flagged: true,
    flag_reason: "Inaccurate information",
  },
  {
    id: "review4",
    tenancy_id: "tenancy1",
    reviewer_id: "tenant1",
    reviewer_name: "Alice Johnson",
    reviewer_role: "tenant",
    reviewee_id: null,
    reviewee_name: null,
    property_id: "prop1",
    property_name: "Riverside Apartment",
    review_type: "tenant_to_property",
    rating: 4,
    comment:
      "Great location and well-maintained property. The kitchen is a bit small but overall a very comfortable place to live.",
    created_at: "2023-08-20T11:30:00Z",
    flagged: false,
  },
]

export function ReviewList({
  tenancyId,
  userId,
  userRole,
}: { tenancyId?: string; userId?: string; userRole?: string }) {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [flagReason, setFlagReason] = useState("")
  const [isFlagging, setIsFlagging] = useState(false)
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const effectiveTenancyId = tenancyId || params.tenancyId
  const effectiveUserId = userId || user?.id

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        let filteredReviews = [...MOCK_REVIEWS]

        // Filter by tenancy if provided
        if (effectiveTenancyId) {
          filteredReviews = filteredReviews.filter((r) => r.tenancy_id === effectiveTenancyId)
        }

        // Filter by user if provided (either as reviewer or reviewee)
        if (effectiveUserId) {
          filteredReviews = filteredReviews.filter(
            (r) => r.reviewer_id === effectiveUserId || r.reviewee_id === effectiveUserId,
          )
        }

        setReviews(filteredReviews)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load reviews. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [effectiveTenancyId, effectiveUserId, toast])

  const handleFlagReview = (review: any) => {
    setSelectedReview(review)
    setFlagDialogOpen(true)
  }

  const submitFlag = async () => {
    if (!flagReason.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a reason for flagging this review.",
        variant: "destructive",
      })
      return
    }

    setIsFlagging(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the review in the local state
      setReviews(
        reviews.map((review) =>
          review.id === selectedReview.id ? { ...review, flagged: true, flag_reason: flagReason } : review,
        ),
      )

      toast({
        title: "Review flagged",
        description: "The review has been flagged for moderation.",
      })

      setFlagDialogOpen(false)
      setFlagReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to flag review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsFlagging(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
      ))
  }

  const filteredReviews =
    activeTab === "all"
      ? reviews
      : reviews.filter((review) => {
          if (activeTab === "landlord") return review.review_type === "tenant_to_landlord"
          if (activeTab === "tenant") return review.review_type === "landlord_to_tenant"
          if (activeTab === "property") return review.review_type === "tenant_to_property"
          return false
        })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const canWriteReview = effectiveTenancyId && user?.role && (user.role === "landlord" || user.role === "tenant")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
          <CardDescription>
            {effectiveTenancyId
              ? "Reviews for this tenancy"
              : effectiveUserId
                ? "Reviews for this user"
                : "All reviews"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No reviews yet</h3>
              <p className="text-muted-foreground mt-2">
                {effectiveTenancyId
                  ? "No reviews have been submitted for this tenancy."
                  : effectiveUserId
                    ? "No reviews have been submitted for this user."
                    : "No reviews have been submitted yet."}
              </p>
              {canWriteReview && (
                <Button className="mt-4" onClick={() => router.push(`/review/${effectiveTenancyId}`)}>
                  Write a Review
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.length > 0 && (
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="landlord">Landlord</TabsTrigger>
                    <TabsTrigger value="tenant">Tenant</TabsTrigger>
                    <TabsTrigger value="property">Property</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {filteredReviews.length === 0 ? (
                <div className="text-center py-6">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews found in this category.</p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className={`border rounded-lg p-4 ${review.flagged ? "bg-red-50 border-red-200" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{review.reviewer_name}</span>
                          <Badge variant="outline" className="capitalize mr-2">
                            {review.reviewer_role}
                          </Badge>
                          {review.review_type === "tenant_to_property" ? (
                            <span className="text-sm text-muted-foreground">
                              reviewed property: <span className="font-medium">{review.property_name}</span>
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              reviewed {review.reviewee_role}:{" "}
                              <span className="font-medium">{review.reviewee_name}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {!review.flagged && user && review.reviewer_id !== user.id && (
                        <Button variant="ghost" size="sm" onClick={() => handleFlagReview(review)}>
                          <Flag className="h-4 w-4 mr-1" /> Flag
                        </Button>
                      )}
                      {review.flagged && <Badge variant="destructive">Flagged</Badge>}
                    </div>
                    <p className="mt-3">{review.comment}</p>
                    {review.flagged && (
                      <div className="mt-2 text-sm text-red-600">
                        <span className="font-medium">Flagged reason:</span> {review.flag_reason}
                      </div>
                    )}
                  </div>
                ))
              )}

              {canWriteReview && (
                <div className="flex justify-center">
                  <Button onClick={() => router.push(`/review/${effectiveTenancyId}`)}>Write a Review</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flag Review Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Inappropriate Review</DialogTitle>
            <DialogDescription>
              Please provide a reason for flagging this review. Our team will review your report.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for flagging..."
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitFlag} disabled={isFlagging}>
              {isFlagging && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
