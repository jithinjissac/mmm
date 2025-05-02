"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface UserRatingProps {
  userId: string
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  className?: string
}

export function UserRating({ userId, size = "md", showCount = true, className = "" }: UserRatingProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [reviewCount, setReviewCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserRating = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock ratings data
        const mockRatings = {
          tenant1: { average: 4.5, count: 6 },
          landlord1: { average: 3.8, count: 12 },
          tenant2: { average: 4.2, count: 3 },
          landlord2: { average: 4.7, count: 9 },
        }

        const userRating = mockRatings[userId as keyof typeof mockRatings]

        if (userRating) {
          setRating(userRating.average)
          setReviewCount(userRating.count)
        } else {
          setRating(null)
          setReviewCount(0)
        }
      } catch (error) {
        console.error("Failed to fetch user rating:", error)
        setRating(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserRating()
  }, [userId])

  const starSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"

  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        <Skeleton className="h-4 w-20" />
      </div>
    )
  }

  if (rating === null || reviewCount === 0) {
    return <span className={`text-muted-foreground ${textSize} ${className}`}>No reviews yet</span>
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center">
        <Star className={`${starSize} text-yellow-400 fill-yellow-400 mr-1`} />
        <span className={`font-medium ${textSize}`}>{rating.toFixed(1)}</span>
      </div>
      {showCount && (
        <Badge variant="outline" className={`ml-2 ${textSize}`}>
          {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </Badge>
      )}
    </div>
  )
}
