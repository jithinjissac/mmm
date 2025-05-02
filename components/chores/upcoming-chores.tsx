"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, ArrowRight } from "lucide-react"
import type { Chore } from "@/types/chores"
import { getChores, updateChoreStatus } from "@/lib/mock-chore-service"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

export function UpcomingChores() {
  const router = useRouter()
  const { toast } = useToast()
  const [chores, setChores] = useState<Chore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcomingChores = async () => {
      try {
        // Get all non-completed chores
        const allChores = await getChores({ status: "pending" })

        // Sort by due date (closest first) and take the first 5
        const sortedChores = allChores
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, 5)

        setChores(sortedChores)
      } catch (error) {
        console.error("Failed to fetch upcoming chores:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingChores()
  }, [])

  const handleComplete = async (id: string) => {
    try {
      await updateChoreStatus(id, "completed")
      setChores(chores.filter((chore) => chore.id !== id))
      toast({
        title: "Success",
        description: "Chore marked as completed",
      })
    } catch (error) {
      console.error("Failed to complete chore:", error)
      toast({
        title: "Error",
        description: "Failed to update chore status",
        variant: "destructive",
      })
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Upcoming Chores
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : chores.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No upcoming chores</p>
            <Button variant="link" onClick={() => router.push("/dashboard/tenant/chores/create")} className="mt-2">
              Create a new chore
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {chores.map((chore) => {
              const dueDate = new Date(chore.dueDate)
              const isPastDue = dueDate < new Date()

              return (
                <div key={chore.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{chore.title}</span>
                      <Badge className={getPriorityColor(chore.priority)} variant="outline">
                        {chore.priority}
                      </Badge>
                    </div>
                    <p className={`text-sm ${isPastDue ? "text-red-600" : "text-muted-foreground"}`}>
                      Due {formatDistanceToNow(dueDate, { addSuffix: true })}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleComplete(chore.id)}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full" onClick={() => router.push("/dashboard/tenant/chores")}>
          View All Chores
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}
