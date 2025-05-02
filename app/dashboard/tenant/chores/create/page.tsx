"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChoreForm } from "@/components/chores/chore-form"
import type { ChoreFormData } from "@/types/chores"
import { createChore } from "@/lib/mock-chore-service"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"

// Mock roommates data
const mockRoommates = [
  { id: "user1", name: "John Doe" },
  { id: "user3", name: "Alice Johnson" },
  { id: "user4", name: "Bob Brown" },
]

export default function CreateChorePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: ChoreFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a chore",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await createChore(data, user.id, user.name, "prop1") // Using mock property ID
      toast({
        title: "Success",
        description: "Chore created successfully",
      })
      router.push("/dashboard/tenant/chores")
    } catch (error) {
      console.error("Failed to create chore:", error)
      toast({
        title: "Error",
        description: "Failed to create chore. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Chore</h1>
        <p className="text-muted-foreground">Add a new chore or task for your household</p>
      </div>

      <ChoreForm onSubmit={handleSubmit} isLoading={isLoading} roommates={mockRoommates} />
    </div>
  )
}
