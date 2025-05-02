"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, AlertTriangle, BarChart } from "lucide-react"
import { getChores } from "@/lib/mock-chore-service"

export function ChoreStatistics() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChoreStats = async () => {
      try {
        const chores = await getChores()

        const total = chores.length
        const completed = chores.filter((chore) => chore.status === "completed").length
        const pending = chores.filter((chore) => chore.status === "pending").length
        const inProgress = chores.filter((chore) => chore.status === "in-progress").length
        const overdue = chores.filter((chore) => chore.status === "overdue").length

        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

        setStats({
          total,
          completed,
          pending,
          inProgress,
          overdue,
          completionRate,
        })
      } catch (error) {
        console.error("Failed to fetch chore statistics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChoreStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Chore Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Chore Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span className="font-medium">{stats.completionRate}%</span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center justify-center p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mb-1" />
              <span className="text-xl font-bold">{stats.completed}</span>
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 mb-1" />
              <span className="text-xl font-bold">{stats.pending}</span>
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 mb-1" />
              <span className="text-xl font-bold">{stats.inProgress}</span>
              <span className="text-xs text-muted-foreground">In Progress</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mb-1" />
              <span className="text-xl font-bold">{stats.overdue}</span>
              <span className="text-xs text-muted-foreground">Overdue</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
