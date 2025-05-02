"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Chore, ChoreComment, ChoreStatus } from "@/types/chores"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, CheckCircle2, Clock, Edit, MessageSquare, PlayCircle, Tag, Trash2, User } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

interface ChoreDetailProps {
  chore: Chore
  comments: ChoreComment[]
  onStatusChange: (id: string, status: ChoreStatus) => void
  onAddComment: (content: string) => void
  onDelete: () => void
  isLoading?: boolean
  currentUserId: string
  currentUserName: string
}

export function ChoreDetail({
  chore,
  comments,
  onStatusChange,
  onAddComment,
  onDelete,
  isLoading = false,
  currentUserId,
  currentUserName,
}: ChoreDetailProps) {
  const router = useRouter()
  const [commentText, setCommentText] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-green-100 text-green-800 border-green-300"
    }
  }

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onAddComment(commentText)
      setCommentText("")
    }
  }

  const dueDate = new Date(chore.dueDate)
  const isPastDue = dueDate < new Date() && chore.status !== "completed"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{chore.title}</h2>
                <Badge className={getStatusColor(chore.status)} variant="outline">
                  {chore.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{chore.description}</p>
            </div>
            <Badge className={getPriorityColor(chore.priority)} variant="outline">
              {chore.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Assigned to:</span>
                <span>{chore.assignedToName || "Unassigned"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Due date:</span>
                <span className={isPastDue ? "text-red-600" : ""}>
                  {format(dueDate, "PPP")} ({formatDistanceToNow(dueDate, { addSuffix: true })})
                </span>
              </div>
              {chore.completedDate && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Completed:</span>
                  <span>{format(new Date(chore.completedDate), "PPP")}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {chore.isRecurring && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Frequency:</span>
                  <span>{chore.frequency}</span>
                </div>
              )}
              {chore.notes && (
                <div>
                  <span className="font-medium">Notes:</span>
                  <p className="mt-1 text-sm">{chore.notes}</p>
                </div>
              )}
              {chore.tags && chore.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {chore.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Created by {chore.createdByName} on {format(new Date(chore.createdAt), "PPP")}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            {chore.status !== "completed" && (
              <>
                {chore.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(chore.id, "in-progress")}
                    disabled={isLoading}
                  >
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusChange(chore.id, "completed")}
                  disabled={isLoading}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/tenant/chores/${chore.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the chore.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Comments</h3>
        </div>

        <div className="flex gap-4">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{currentUserName ? currentUserName.charAt(0) : "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="resize-none"
            />
            <Button onClick={handleSubmitComment} disabled={!commentText.trim() || isLoading} size="sm">
              Post Comment
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{comment.userName ? comment.userName.charAt(0) : "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.userName || "Unknown User"}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
