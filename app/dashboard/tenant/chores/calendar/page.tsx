"use client"

import { Button } from "@/components/ui/button"
import { ChoreCalendar } from "@/components/chores/chore-calendar"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ChoreCalendarPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/tenant/chores")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Chores
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Chore Calendar</h1>
      </div>

      <ChoreCalendar />
    </div>
  )
}
