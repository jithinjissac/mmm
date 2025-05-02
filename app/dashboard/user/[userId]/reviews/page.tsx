"use client"

import { useParams } from "next/navigation"
import { ReviewList } from "@/components/reviews/review-list"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function UserReviewsPage() {
  const params = useParams()
  const { toast } = useToast()
  const [userName, setUserName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock user data
        const mockUsers = {
          tenant1: "Alice Johnson",
          landlord1: "John Smith",
          tenant2: "Bob Williams",
          landlord2: "Sarah Davis",
        }

        setUserName(mockUsers[params.userId as keyof typeof mockUsers] || "Unknown User")
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load user details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserDetails()
  }, [params.userId, toast])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Reviews for {userName}</h1>
      <p className="text-muted-foreground mb-6">See what others are saying</p>
      <ReviewList userId={params.userId as string} />
    </div>
  )
}
