"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChoreCard } from "@/components/chores/chore-card"
import { ChoreFilter } from "@/components/chores/chore-filter"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Calendar } from "lucide-react"
import type { Chore, ChoreFilter as ChoreFilterType, ChoreStatus } from "@/types/chores"
import { getChores, updateChoreStatus } from "@/lib/mock-chore-service"
import { useToast } from "@/components/ui/use-toast"

export default function ChoresPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [chores, setChores] = useState<Chore[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ChoreFilterType>({
    status: (searchParams.get("status") as ChoreStatus) || undefined,
    priority: (searchParams.get("priority") as any) || undefined,
    search: searchParams.get("search") || undefined,
  })

  useEffect(() => {
    const fetchChores = async () => {
      setLoading(true)
      try {
        const data = await getChores(filters)
        setChores(data)
      } catch (error) {
        console.error("Failed to fetch chores:", error)
        toast({
          title: "Error",
          description: "Failed to load chores. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchChores()
  }, [filters, toast])

  const handleStatusChange = async (id: string, status: ChoreStatus) => {
    try {
      const updatedChore = await updateChoreStatus(id, status)
      setChores((prev) => prev.map((chore) => (chore.id === id ? updatedChore : chore)))
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
    }
  }

  const handleFilterChange = (newFilters: Partial<ChoreFilterType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chores & Tasks</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/tenant/chores/calendar")}>
            <Calendar className="h-4 w-4 mr-1" />
            Calendar View
          </Button>
          <Button onClick={() => router.push("/dashboard/tenant/chores/create")}>
            <Plus className="h-4 w-4 mr-1" />
            New Chore
          </Button>
        </div>
      </div>

      <ChoreFilter onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : chores.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No chores found</h3>
          <p className="text-muted-foreground mt-1">
            {filters.status || filters.priority || filters.search
              ? "Try changing your filters"
              : "Create a new chore to get started"}
          </p>
          <Button onClick={() => router.push("/dashboard/tenant/chores/create")} className="mt-4">
            <Plus className="h-4 w-4 mr-1" />
            Create Chore
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {chores.map((chore) => (
            <ChoreCard key={chore.id} chore={chore} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  )
}
