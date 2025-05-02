"use client"

import { useState, useEffect } from "react"
import { Star, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface PropertyReviewSummaryProps {
  propertyId: string
}

export function PropertyReviewSummary({ propertyId }: PropertyReviewSummaryProps) {
  const [reviewStats, setReviewStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Mock review statistics
        setReviewStats({
          average_rating: 4.2,
          total_reviews: 15,
          rating_distribution: {
            5: 8,
            4: 4,
            3: 2,
            2: 1,
            1: 0,
          },
        })
      } catch (error) {
        console.error("Failed to fetch review statistics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviewStats()
  }, [propertyId])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!reviewStats) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No review data available</p>
      </div>
    )
  }

  const { average_rating, total_reviews, rating_distribution } = reviewStats

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline">
          <h3 className="text-2xl font-bold">{average_rating.toFixed(1)}</h3>
          <span className="text-muted-foreground ml-1">/ 5</span>
        </div>
        <div className="flex items-center">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(average_rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-muted-foreground">
            {total_reviews} {total_reviews === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = rating_distribution[rating] || 0
          const percentage = total_reviews > 0 ? (count / total_reviews) * 100 : 0

          return (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex items-center w-12">
                <span className="text-sm">{rating}</span>
                <Star className="h-4 w-4 ml-1 text-yellow-400 fill-yellow-400" />
              </div>
              <Progress value={percentage} className="h-2 flex-1" />
              <div className="w-12 text-right text-sm text-muted-foreground">{count}</div>
            </div>
          )
        })}
      </div>

      <Button variant="outline" className="w-full mt-4" onClick={() => router.push(`/property/${propertyId}/reviews`)}>
        See all reviews
      </Button>
    </div>
  )
}
