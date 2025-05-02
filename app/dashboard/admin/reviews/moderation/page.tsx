"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Star, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Mock flagged reviews data
const MOCK_FLAGGED_REVIEWS = [
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
    flag_date: "2023-07-25T14:30:00Z",
    flag_by: "landlord1",
    flag_by_name: "John Smith",
    moderation_status: "pending",
  },
  {
    id: "review5",
    tenancy_id: "tenancy3",
    reviewer_id: "tenant3",
    reviewer_name: "Emma Thompson",
    reviewer_role: "tenant",
    reviewee_id: "landlord2",
    reviewee_name: "Sarah Davis",
    reviewee_role: "landlord",
    property_id: null,
    property_name: null,
    review_type: "tenant_to_landlord",
    rating: 1,
    comment: "Terrible landlord. Never responds to messages and tried to charge extra fees not in the contract.",
    created_at: "2023-08-05T16:20:00Z",
    flagged: true,
    flag_reason: "Defamatory content",
    flag_date: "2023-08-06T09:15:00Z",
    flag_by: "landlord2",
    flag_by_name: "Sarah Davis",
    moderation_status: "pending",
  },
  {
    id: "review6",
    tenancy_id: "tenancy4",
    reviewer_id: "landlord3",
    reviewer_name: "Michael Brown",
    reviewer_role: "landlord",
    reviewee_id: "tenant4",
    reviewee_name: "David Wilson",
    reviewee_role: "tenant",
    property_id: null,
    property_name: null,
    review_type: "landlord_to_tenant",
    rating: 1,
    comment: "This tenant caused significant damage to the property and was consistently late with rent payments.",
    created_at: "2023-07-30T11:45:00Z",
    flagged: true,
    flag_reason: "Inaccurate information",
    flag_date: "2023-08-01T13:20:00Z",
    flag_by: "tenant4",
    flag_by_name: "David Wilson",
    moderation_status: "pending",
  },
]

export default function ReviewModerationPage() {
  const { toast } = useToast()
  const [flaggedReviews, setFlaggedReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [moderationNote, setModerationNote] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [moderationAction, setModerationAction] = useState<"approve" | "reject">("approve")
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    const fetchFlaggedReviews = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setFlaggedReviews(MOCK_FLAGGED_REVIEWS)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load flagged reviews. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFlaggedReviews()
  }, [toast])

  const handleModerateReview = (review: any, action: "approve" | "reject") => {
    setSelectedReview(review)
    setModerationAction(action)
    setModerationNote("")
    setDialogOpen(true)
  }

  const submitModeration = async () => {
    if (!moderationNote.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a note explaining your moderation decision.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the review in the local state
      setFlaggedReviews(
        flaggedReviews.map((review) =>
          review.id === selectedReview.id
            ? {
                ...review,
                moderation_status: moderationAction === "approve" ? "approved" : "rejected",
                moderation_note: moderationNote,
                moderation_date: new Date().toISOString(),
              }
            : review,
        ),
      )

      toast({
        title: `Review ${moderationAction === "approve" ? "approved" : "rejected"}`,
        description: `The review has been ${
          moderationAction === "approve" ? "approved and will remain visible" : "rejected and hidden"
        }.`,
      })

      setDialogOpen(false)
      setModerationNote("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process moderation. Please try again.",
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

  const filteredReviews = flaggedReviews.filter((review) => {
    if (activeTab === "pending") return review.moderation_status === "pending"
    if (activeTab === "approved") return review.moderation_status === "approved"
    if (activeTab === "rejected") return review.moderation_status === "rejected"
    return true
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Review Moderation</h1>
      <p className="text-muted-foreground mb-6">Manage flagged reviews that have been reported by users</p>

      <Card>
        <CardHeader>
          <CardTitle>Flagged Reviews</CardTitle>
          <CardDescription>Review and moderate content that has been flagged as inappropriate</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No {activeTab} reviews</h3>
                  <p className="text-muted-foreground mt-2">There are no reviews with {activeTab} moderation status.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-6">
                      <div className="flex flex-col md:flex-row justify-between mb-4">
                        <div>
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="font-medium">{review.reviewer_name}</span>
                            <Badge variant="outline" className="capitalize">
                              {review.reviewer_role}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              reviewed {review.reviewee_role}:{" "}
                              <span className="font-medium">{review.reviewee_name}</span>
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-sm text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <Badge variant="destructive" className="mb-2 md:mb-0">
                            Flagged
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-muted p-4 rounded-md mb-4">
                        <p className="font-medium">Review Content:</p>
                        <p className="mt-2">{review.comment}</p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div>
                          <span className="text-sm font-medium">Flagged by:</span>{" "}
                          <span className="text-sm">
                            {review.flag_by_name} ({review.flag_by})
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Flag reason:</span>{" "}
                          <span className="text-sm">{review.flag_reason}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Flag date:</span>{" "}
                          <span className="text-sm">{new Date(review.flag_date).toLocaleDateString()}</span>
                        </div>
                        {review.moderation_status !== "pending" && (
                          <>
                            <div>
                              <span className="text-sm font-medium">Moderation status:</span>{" "}
                              <Badge
                                variant={review.moderation_status === "approved" ? "success" : "destructive"}
                                className="ml-1"
                              >
                                {review.moderation_status}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Moderation note:</span>{" "}
                              <span className="text-sm">{review.moderation_note}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Moderation date:</span>{" "}
                              <span className="text-sm">{new Date(review.moderation_date).toLocaleDateString()}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {review.moderation_status === "pending" && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => handleModerateReview(review, "reject")}
                            className="flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject & Hide
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => handleModerateReview(review, "approve")}
                            className="flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Moderation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{moderationAction === "approve" ? "Approve Review" : "Reject & Hide Review"}</DialogTitle>
            <DialogDescription>
              {moderationAction === "approve"
                ? "This review will remain visible to all users."
                : "This review will be hidden from all users."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium mb-2">Moderation Note (visible to admins only)</p>
            <Textarea
              placeholder="Explain your moderation decision..."
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={moderationAction === "approve" ? "default" : "destructive"}
              onClick={submitModeration}
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {moderationAction === "approve" ? "Approve Review" : "Reject & Hide Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
