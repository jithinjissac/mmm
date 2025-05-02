"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import type { Chore } from "@/types/chores"
import { getChores } from "@/lib/mock-chore-service"
import { useRouter } from "next/navigation"

export function ChoreCalendar() {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [chores, setChores] = useState<Chore[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDateChores, setSelectedDateChores] = useState<Chore[]>([])

  useEffect(() => {
    const fetchChores = async () => {
      setLoading(true)
      try {
        const data = await getChores()
        setChores(data)
      } catch (error) {
        console.error("Failed to fetch chores:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChores()
  }, [])

  useEffect(() => {
    if (date && chores.length > 0) {
      const selectedDay = format(date, "yyyy-MM-dd")
      const filteredChores = chores.filter((chore) => {
        const choreDate = format(new Date(chore.dueDate), "yyyy-MM-dd")
        return choreDate === selectedDay
      })
      setSelectedDateChores(filteredChores)
    } else {
      setSelectedDateChores([])
    }
  }, [date, chores])

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

  // Function to get dates with chores for calendar highlighting
  const getDatesWithChores = () => {
    const dates: Record<string, { status: string; count: number }> = {}

    chores.forEach((chore) => {
      const dateStr = format(new Date(chore.dueDate), "yyyy-MM-dd")

      if (!dates[dateStr]) {
        dates[dateStr] = { status: chore.status, count: 1 }
      } else {
        dates[dateStr].count += 1
        // Prioritize overdue > in-progress > pending > completed for the dot color
        if (chore.status === "overdue") {
          dates[dateStr].status = "overdue"
        } else if (chore.status === "in-progress" && dates[dateStr].status !== "overdue") {
          dates[dateStr].status = "in-progress"
        } else if (chore.status === "pending" && !["overdue", "in-progress"].includes(dates[dateStr].status)) {
          dates[dateStr].status = "pending"
        }
      }
    })

    return dates
  }

  const datesWithChores = getDatesWithChores()

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Chore Calendar</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="p-4 border-r">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                booked: (date) => {
                  const dateStr = format(date, "yyyy-MM-dd")
                  return !!datesWithChores[dateStr]
                },
              }}
              modifiersStyles={{
                booked: {
                  fontWeight: "bold",
                },
              }}
              components={{
                DayContent: ({ date, ...props }) => {
                  const dateStr = format(date, "yyyy-MM-dd")
                  const hasChores = datesWithChores[dateStr]

                  return (
                    <div {...props} className="relative">
                      <div>{date.getDate()}</div>
                      {hasChores && (
                        <div
                          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                            hasChores.status === "overdue"
                              ? "bg-red-500"
                              : hasChores.status === "in-progress"
                                ? "bg-blue-500"
                                : hasChores.status === "pending"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                          }`}
                        />
                      )}
                    </div>
                  )
                },
              }}
            />
          </div>
          <div className="col-span-2 p-4">
            <h3 className="text-lg font-medium mb-4">{date ? format(date, "MMMM d, yyyy") : "Select a date"}</h3>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-md animate-pulse" />
                ))}
              </div>
            ) : selectedDateChores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No chores scheduled for this date</div>
            ) : (
              <div className="space-y-3">
                {selectedDateChores.map((chore) => (
                  <div
                    key={chore.id}
                    className="p-3 border rounded-md cursor-pointer hover:bg-accent"
                    onClick={() => router.push(`/dashboard/tenant/chores/${chore.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{chore.title}</h4>
                          <Badge className={getStatusColor(chore.status)} variant="outline">
                            {chore.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{chore.description}</p>
                      </div>
                      <div className="text-sm">
                        {chore.assignedToName ? `Assigned to: ${chore.assignedToName}` : "Unassigned"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
