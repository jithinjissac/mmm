"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"
import { Star, Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

type ReviewType = "landlord_to_tenant" | "tenant_to_landlord" | "tenant_to_property"

export function ReviewForm() {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [reviewType, setReviewType] = useState<ReviewType>("tenant_to_landlord")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tenancyDetails, setTenancyDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchTenancyDetails = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock tenancy data
        const mockTenancy = {
          id: params.tenancyId,
          landlord_id: "landlord1",
          landlord_name: "John Smith",
          tenant_id: "tenant1",
          tenant_name: "Alice Johnson",
          property_id: "prop1",
          property_name: "Riverside Apartment",
          start_date: "2023-01-01",
          end_date: "2023-12-31",
        }

        setTenancyDetails(mockTenancy)

        // Set default review type based on user role
        if (user?.role === "landlord") {
          setReviewType("landlord_to_tenant")
        } else if (user?.role === "tenant") {
          setReviewType("tenant_to_landlord")
        }
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

    fetchTenancyDetails()
  }, [params.tenancyId, toast, user?.role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0 || !comment) {
      toast({
        title: "Missing information",
        description: "Please provide both a rating and a comment",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const reviewData = {
        tenancy_id: params.tenancyId,
        reviewer_id: user?.id,
        reviewer_role: user?.role,
        reviewee_id: reviewType === "landlord_to_tenant" ? tenancyDetails.tenant_id : tenancyDetails.landlord_id,
        reviewee_role: reviewType === "landlord_to_tenant" ? "tenant" : "landlord",
        property_id: reviewType === "tenant_to_property" ? tenancyDetails.property_id : null,
        review_type: reviewType,
        rating,
        comment,
        created_at: new Date().toISOString(),
      }

      console.log("Submitting review:", reviewData)

      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully",
      })

      router.push(`/tenancy/${params.tenancyId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return "Poor"
      case 2:
        return "Fair"
      case 3:
        return "Good"
      case 4:
        return "Very Good"
      case 5:
        return "Excellent"
      default:
        return ""
    }
  }

  const getReviewTypeLabel = () => {
    switch (reviewType) {
      case "landlord_to_tenant":
        return `Review Tenant: ${tenancyDetails?.tenant_name}`
      case "tenant_to_landlord":
        return `Review Landlord: ${tenancyDetails?.landlord_name}`
      case "tenant_to_property":
        return `Review Property: ${tenancyDetails?.property_name}`
      default:
        return "Write a Review"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getReviewTypeLabel()}</CardTitle>
        <CardDescription>Share your honest experience</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {user?.role === "tenant" && (
            <div className="space-y-2">
              <Label>What would you like to review?</Label>
              <RadioGroup
                value={reviewType}
                onValueChange={(value) => setReviewType(value as ReviewType)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tenant_to_landlord" id="landlord" />
                  <Label htmlFor="landlord">Landlord</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tenant_to_property" id="property" />
                  <Label htmlFor="property">Property</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && <p className="text-sm text-muted-foreground">{getRatingLabel(rating)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={5}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Review...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
