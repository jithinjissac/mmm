"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Loader2, Star, Flag, CheckCircle, X, AlertTriangle, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"

// Mock review data
const MOCK_REVIEWS = [
  {
    id: "review1",
    tenancy_id: "tenancy1",
    property_name: "Riverside Apartment",
    reviewer_id: "tenant1",
    reviewer_name: "Alice Johnson",
    reviewer_role: "tenant",
    reviewee_id: "landlord1",
    reviewee_name: "John Smith",
    reviewee_role: "landlord",
    rating: 4,
    comment:
      "Great landlord, very responsive to maintenance requests. The property was well-maintained and any issues were addressed promptly.",
    created_at: "2023-08-15T10:30:00Z",
    flagged: false,
  },
  {
    id: "review2",
    tenancy_id: "tenancy1",
    property_name: "Riverside Apartment",
    reviewer_id: "landlord1",
    reviewer_name: "John Smith",
    reviewer_role: "landlord",
    reviewee_id: "tenant1",
    reviewee_name: "Alice Johnson",
    reviewee_role: "tenant",
    rating: 5,
    comment:
      "Alice was an excellent tenant. Always paid rent on time and kept the property in great condition. Would happily rent to her again.",
    created_at: "2023-08-16T14:45:00Z",
    flagged: false,
  },
  {
    id: "review3",
    tenancy_id: "tenancy2",
    property_name: "Garden Cottage",
    reviewer_id: "tenant2",
    reviewer_name: "Bob Williams",
    reviewer_role: "tenant",
    reviewee_id: "landlord1",
    reviewee_name: "John Smith",
    reviewee_role: "landlord",
    rating: 2,
    comment:
      "Slow to respond to maintenance issues. The heating was broken for two weeks in winter before it was fixed.",
    created_at: "2023-07-20T09:15:00Z",
    flagged: true,
    flag_reason: "Inaccurate information",
    flag_date: "2023-07-22T11:30:00Z",
    flagged_by: "John Smith",
  },
  {
    id: "review4",
    tenancy_id: "tenancy3",
    property_name: "City View Flat",
    reviewer_id: "tenant3",
    reviewer_name: "Charlie Brown",
    reviewer_role: "tenant",
    reviewee_id: "landlord2",
    reviewee_name: "Jane Doe",
    reviewee_role: "landlord",
    rating: 1,
    comment:
      "Terrible experience. The landlord was unresponsive and rude. The property had multiple issues that were never fixed despite numerous complaints.",
    created_at: "2023-08-05T16:20:00Z",
    flagged: true,
    flag_reason: "Offensive content",
    flag_date: "2023-08-06T09:45:00Z",
    flagged_by: "Jane Doe",
  },
]

export default function AdminReviewModerationPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [flaggedReviews, setFlaggedReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [moderationNote, setModerationNote] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const loadReviews = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setReviews(MOCK_REVIEWS)
        setFlaggedReviews(MOCK_REVIEWS.filter((review) => review.flagged))
      } catch (error) {
        console.error("Error loading reviews:", error)
        toast({
          title: "Error",
          description: "Failed to load reviews. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadReviews()
  }, [toast])

  const handleViewReview = (review: any) => {
    setSelectedReview(review)
    setIsDialogOpen(true)
  }

  const handleApproveReview = async (reviewId: string) => {
    setIsProcessing(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the reviews in state
      const updatedReviews = reviews.map((review) => (review.id === reviewId ? { ...review, flagged: false } : review))
      setReviews(updatedReviews)
      setFlaggedReviews(updatedReviews.filter((review) => review.flagged))

      toast({
        title: "Review approved",
        description: "The review has been approved and will remain visible.",
      })

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error approving review:", error)
      toast({
        title: "Error",
        description: "Failed to approve review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveReview = async (reviewId: string) => {
    setIsProcessing(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Remove the review from state
      const updatedReviews = reviews.filter((review) => review.id !== reviewId)
      setReviews(updatedReviews)
      setFlaggedReviews(updatedReviews.filter((review) => review.flagged))

      toast({
        title: "Review removed",
        description: "The review has been removed from the system.",
      })

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error removing review:", error)
      toast({
        title: "Error",
        description: "Failed to remove review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
      ))
  }

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
        <h1 className="text-3xl font-bold tracking-tight">Review Moderation</h1>
        <p className="text-muted-foreground">
          Manage and moderate user reviews that have been flagged for inappropriate content.
        </p>
      </div>

      <Tabs defaultValue="flagged">
        <TabsList>
          <TabsTrigger value="flagged">
            Flagged Reviews{" "}
            <Badge variant="secondary" className="ml-2">
              {flaggedReviews.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="flagged" className="mt-6">
          {flaggedReviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No flagged reviews</p>
                <p className="text-muted-foreground">There are no reviews that require moderation at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {flaggedReviews.map((review) => (
                <Card key={review.id} className="border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-semibold">{review.reviewer_name}</h3>
                          <Badge variant="outline" className="ml-2 capitalize">
                            {review.reviewer_role}
                          </Badge>
                          <span className="mx-2 text-muted-foreground">→</span>
                          <h3 className="font-semibold">{review.reviewee_name}</h3>
                          <Badge variant="outline" className="ml-2 capitalize">
                            {review.reviewee_role}
                          </Badge>
                        </div>
                        <div className="flex items-center mt-1">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-2">{review.comment}</p>
                        <div className="mt-2 p-2 bg-red-100 rounded-md">
                          <div className="flex items-center">
                            <Flag className="h-4 w-4 text-red-500 mr-2" />
                            <span className="font-medium text-red-700">Flagged:</span>
                            <span className="ml-2 text-red-700">{review.flag_reason}</span>
                          </div>
                          <div className="text-sm text-red-600 mt-1">
                            Flagged by {review.flagged_by} on {new Date(review.flag_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewReview(review)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Reviews</CardTitle>
              <CardDescription>Complete list of all reviews in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className={`border rounded-lg p-4 ${review.flagged ? "bg-red-50 border-red-200" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{review.reviewer_name}</span>
                          <Badge variant="outline" className="ml-2 capitalize">
                            {review.reviewer_role}
                          </Badge>
                          <span className="mx-2 text-muted-foreground">reviewed</span>
                          <span className="font-medium">{review.reviewee_name}</span>
                          <Badge variant="outline" className="ml-2 capitalize">
                            {review.reviewee_role}
                          </Badge>
                        </div>
                        <div className="flex items-center mt-1">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-2">{review.comment}</p>
                        {review.flagged && (
                          <div className="mt-2 text-sm text-red-600">
                            <span className="font-medium">Flagged reason:</span> {review.flag_reason}
                          </div>
                        )}
                      </div>
                      {review.flagged && <Badge variant="destructive">Flagged</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Moderation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Moderation</DialogTitle>
            <DialogDescription>
              Review the flagged content and decide whether to approve or remove it.
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedReview.property_name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm">{selectedReview.reviewer_name}</span>
                        <Badge variant="outline" className="ml-2 capitalize">
                          {selectedReview.reviewer_role}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {renderStars(selectedReview.rating)}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {new Date(selectedReview.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="mt-4">{selectedReview.comment}</p>
                </div>

                <div className="p-4 border rounded-md bg-red-50">
                  <div className="flex items-center">
                    <Flag className="h-4 w-4 text-red-500 mr-2" />
                    <h3 className="font-semibold text-red-700">Flag Information</h3>
                  </div>
                  <div className="mt-2">
                    <p>
                      <span className="font-medium">Reason:</span> {selectedReview.flag_reason}
                    </p>
                    <p>
                      <span className="font-medium">Flagged by:</span> {selectedReview.flagged_by}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span> {new Date(selectedReview.flag_date).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Moderation Notes</label>
                  <Textarea
                    value={moderationNote}
                    onChange={(e) => setModerationNote(e.target.value)}
                    placeholder="Add notes about your moderation decision..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 mr-2" />
              This action cannot be undone
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => selectedReview && handleApproveReview(selectedReview.id)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve Review
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedReview && handleRemoveReview(selectedReview.id)}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                Remove Review
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
