"use client"

import { useParams } from "next/navigation"
import { ReviewList } from "@/components/reviews/review-list"
import { PropertyReviewSummary } from "@/components/reviews/property-review-summary"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"

export default function PropertyReviewsPage() {
  const params = useParams()
  const { toast } = useToast()
  const [propertyName, setPropertyName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock property data
        const mockProperties = {
          prop1: "Riverside Apartment",
          prop2: "City View Flat",
          prop3: "Garden Cottage",
        }

        setPropertyName(mockProperties[params.propertyId as keyof typeof mockProperties] || "Unknown Property")
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load property details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPropertyDetails()
  }, [params.propertyId, toast])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-2">{propertyName} Reviews</h1>
      <p className="text-muted-foreground mb-6">See what tenants are saying about this property</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <PropertyReviewSummary propertyId={params.propertyId as string} />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <ReviewList />
        </div>
      </div>
    </div>
  )
}
