"use client"

import type { Chore } from "@/types/chores"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2, Clock, Tag, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface ChoreCardProps {
  chore: Chore
  onStatusChange?: (id: string, status: "pending" | "in-progress" | "completed") => void
}

export function ChoreCard({ chore, onStatusChange }: ChoreCardProps) {
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

  const dueDate = new Date(chore.dueDate)
  const isPastDue = dueDate < new Date() && chore.status !== "completed"
  const dueText = isPastDue
    ? `Overdue by ${formatDistanceToNow(dueDate)}`
    : `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{chore.title}</h3>
            <Badge className={getStatusColor(chore.status)} variant="outline">
              {chore.status}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-1">{chore.description}</div>
        </div>
        <Badge className={getPriorityColor(chore.priority)} variant="outline">
          {chore.priority}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-2">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Assigned to: {chore.assignedToName || "Unassigned"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={isPastDue ? "text-red-600 font-medium" : ""}>{dueText}</span>
          </div>
          {chore.isRecurring && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Repeats: {chore.frequency}</span>
            </div>
          )}
          {chore.tags && chore.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {chore.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">Created by {chore.createdByName}</div>
        <div className="flex gap-2">
          {onStatusChange && chore.status !== "completed" && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange(chore.id, "completed")}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complete
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <Link href={`/dashboard/tenant/chores/${chore.id}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
