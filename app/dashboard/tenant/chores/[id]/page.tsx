"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChoreDetail } from "@/components/chores/chore-detail"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Chore, ChoreComment, ChoreStatus } from "@/types/chores"
import {
  getChoreById,
  getChoreComments,
  updateChoreStatus,
  addChoreComment,
  deleteChore,
} from "@/lib/mock-chore-service"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"

export default function ChoreDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [chore, setChore] = useState<Chore | null>(null)
  const [comments, setComments] = useState<ChoreComment[]>([])
  const [loading, setLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    const fetchChoreData = async () => {
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
        const commentsData = await getChoreComments(params.id)
        setComments(commentsData)
      } catch (error) {
        console.error("Failed to fetch chore details:", error)
        toast({
          title: "Error",
          description: "Failed to load chore details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchChoreData()
  }, [params.id, router, toast])

  const handleStatusChange = async (id: string, status: ChoreStatus) => {
    if (!user) return

    setIsActionLoading(true)
    try {
      const updatedChore = await updateChoreStatus(id, status)
      setChore(updatedChore)
      toast({
        title: "Success",
        description: `Chore marked as ${status}`,
      })
    } catch (error) {
      console.error("Failed to update chore status:", error)
      toast({
        title: "Error",
        description: "Failed to update chore status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleAddComment = async (content: string) => {
    if (!user || !chore) return

    setIsActionLoading(true)
    try {
      const newComment = await addChoreComment(chore.id, user.id, user.name, content)
      setComments((prev) => [newComment, ...prev])
      toast({
        title: "Success",
        description: "Comment added",
      })
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!chore) return

    setIsActionLoading(true)
    try {
      await deleteChore(chore.id)
      toast({
        title: "Success",
        description: "Chore deleted successfully",
      })
      router.push("/dashboard/tenant/chores")
    } catch (error) {
      console.error("Failed to delete chore:", error)
      toast({
        title: "Error",
        description: "Failed to delete chore. Please try again.",
        variant: "destructive",
      })
      setIsActionLoading(false)
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
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-20 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!chore || !user) {
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

  // Ensure user has name property
  const userName = user.name || "User"
  const userId = user.id

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/tenant/chores")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Chores
        </Button>
      </div>

      <ChoreDetail
        chore={chore}
        comments={comments}
        onStatusChange={handleStatusChange}
        onAddComment={handleAddComment}
        onDelete={handleDelete}
        isLoading={isActionLoading}
        currentUserId={userId}
        currentUserName={userName}
      />
    </div>
  )
}
