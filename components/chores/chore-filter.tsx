"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ChoreStatus, ChorePriority } from "@/types/chores"
import { Search, X } from "lucide-react"

interface ChoreFilterProps {
  onFilterChange: (filters: {
    status?: ChoreStatus
    priority?: ChorePriority
    search?: string
  }) => void
}

export function ChoreFilter({ onFilterChange }: ChoreFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<ChoreStatus | undefined>(
    (searchParams.get("status") as ChoreStatus) || undefined,
  )
  const [priority, setPriority] = useState<ChorePriority | undefined>(
    (searchParams.get("priority") as ChorePriority) || undefined,
  )
  const [search, setSearch] = useState(searchParams.get("search") || "")

  const handleStatusChange = (value: string) => {
    const newStatus = value === "all" ? undefined : (value as ChoreStatus)
    setStatus(newStatus)
    onFilterChange({ status: newStatus, priority, search })

    const params = new URLSearchParams(searchParams)
    if (newStatus) {
      params.set("status", newStatus)
    } else {
      params.delete("status")
    }
    router.push(`?${params.toString()}`)
  }

  const handlePriorityChange = (value: string) => {
    const newPriority = value === "all" ? undefined : (value as ChorePriority)
    setPriority(newPriority)
    onFilterChange({ status, priority: newPriority, search })

    const params = new URLSearchParams(searchParams)
    if (newPriority) {
      params.set("priority", newPriority)
    } else {
      params.delete("priority")
    }
    router.push(`?${params.toString()}`)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({ status, priority, search })

    const params = new URLSearchParams(searchParams)
    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    setStatus(undefined)
    setPriority(undefined)
    setSearch("")
    onFilterChange({})
    router.push("?")
  }

  const hasFilters = status || priority || search

  return (
    <div className="space-y-4">
      <Tabs defaultValue={status || "all"} onValueChange={handleStatusChange} value={status || "all"}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search chores..." className="pl-8" value={search} onChange={handleSearchChange} />
          </form>
        </div>
        <Select value={priority || "all"} onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}
