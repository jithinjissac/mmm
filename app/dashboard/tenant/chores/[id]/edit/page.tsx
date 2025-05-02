"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChoreForm } from "@/components/chores/chore-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Chore, ChoreFormData } from "@/types/chores"
import { getChoreById, updateChore } from "@/lib/mock-chore-service"
import { useToast } from "@/components/ui/use-toast"

// Mock roommates data
const mockRoommates = [
  { id: "user1", name: "John Doe" },
  { id: "user3", name: "Alice Johnson" },
  { id: "user4", name: "Bob Brown" },
]

export default function EditChorePage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()

  const [chore, setChore] = useState<Chore | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchChore = async () => {
      setLoading(true)
      try {
        const choreData = await getChoreById(params.id)
        if (!choreData) {
          toast({
            title: "Error",
            description: "Chore not found",
            variant: "destructive",
          })
          router.push("/dashboard/tenant/chores")
          return
        }
        setChore(choreData)
      } catch (error) {
        console.error("Failed to fetch chore:", error)
        toast({
          title: "Error",
          description: "Failed to load chore details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchChore()
  }, [params.id, router, toast])

  const handleSubmit = async (data: ChoreFormData) => {
    if (!chore) return

    setIsSubmitting(true)
    try {
      await updateChore(chore.id, data)
      toast({
        title: "Success",
        description: "Chore updated successfully",
      })
      router.push(`/dashboard/tenant/chores/${chore.id}`)
    } catch (error) {
      console.error("Failed to update chore:", error)
      toast({
        title: "Error",
        description: "Failed to update chore. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!chore) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Chore not found</h3>
        <Button onClick={() => router.push("/dashboard/tenant/chores")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Chores
        </Button>
      </div>
    )
  }

  const initialData: ChoreFormData = {
    title: chore.title,
    description: chore.description,
    assignedToId: chore.assignedToId,
    priority: chore.priority,
    dueDate: chore.dueDate,
    frequency: chore.frequency,
    isRecurring: chore.isRecurring,
    notes: chore.notes,
    tags: chore.tags,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/tenant/chores/${chore.id}`)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Chore
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Edit Chore</h1>
        <p className="text-muted-foreground">Update the details of this chore</p>
      </div>

      <ChoreForm initialData={initialData} onSubmit={handleSubmit} isLoading={isSubmitting} roommates={mockRoommates} />
    </div>
  )
}
