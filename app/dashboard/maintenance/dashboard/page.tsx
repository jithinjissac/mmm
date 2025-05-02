"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  ArrowRight,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle,
  PenToolIcon as Tool,
  Search,
  Filter,
} from "lucide-react"
import { MockDataService, simulateApiDelay } from "@/lib/mock-data-service"
import WithAuthProtection from "@/components/auth/with-auth-protection"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MaintenanceDashboardPage() {
  const router = useRouter()
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([])
  const [filteredRequests, setFilteredRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const loadMaintenanceRequests = async () => {
      setIsLoading(true)
      try {
        await simulateApiDelay(800)
        const { data } = await MockDataService.getMaintenanceRequests()
        setMaintenanceRequests(data)
        setFilteredRequests(data)
      } catch (error) {
        console.error("Error loading maintenance requests:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMaintenanceRequests()
  }, [])

  useEffect(() => {
    // Apply filters
    let result = [...maintenanceRequests]

    // Apply tab filter
    if (activeTab !== "all") {
      result = result.filter((request) => {
        if (activeTab === "new") return request.status === "new"
        if (activeTab === "in-progress") return request.status === "in-progress"
        if (activeTab === "scheduled") return request.status === "scheduled"
        if (activeTab === "completed") return request.status === "completed"
        return true
      })
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((request) => request.status === statusFilter)
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((request) => request.priority === priorityFilter)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (request) =>
          request.title.toLowerCase().includes(query) ||
          request.description.toLowerCase().includes(query) ||
          request.category.toLowerCase().includes(query),
      )
    }

    setFilteredRequests(result)
  }, [activeTab, statusFilter, priorityFilter, searchQuery, maintenanceRequests])

  return (
    <WithAuthProtection requiredRole="maintenance">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance Dashboard</h1>
            <p className="text-muted-foreground">View and manage all maintenance requests</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/maintenance/schedule")}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button onClick={() => router.push("/dashboard/maintenance/work-orders/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Work Order
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                  setPriorityFilter("all")
                }}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                    <CardFooter>
                      <div className="h-9 bg-muted rounded w-full"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{request.title}</CardTitle>
                        <StatusBadge status={request.status} />
                      </div>
                      <CardDescription>
                        Property: {request.property_id} • Reported on{" "}
                        {new Date(request.reported_date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3 text-sm text-muted-foreground">{request.description}</p>
                      <div className="mt-4 flex items-center">
                        <Badge variant="outline" className="capitalize">
                          {request.category}
                        </Badge>
                        <PriorityBadge priority={request.priority} className="ml-2" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/dashboard/maintenance/details/${request.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          View Details
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Tool className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">No maintenance requests found</h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                      ? "Try adjusting your filters to see more results."
                      : "There are no maintenance requests to display."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </WithAuthProtection>
  )
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  let color = ""
  let icon = null

  switch (status) {
    case "new":
      color = "bg-blue-500"
      icon = <Clock className="h-3 w-3 mr-1" />
      break
    case "scheduled":
      color = "bg-amber-500"
      icon = <Calendar className="h-3 w-3 mr-1" />
      break
    case "in-progress":
      color = "bg-purple-500"
      icon = <Tool className="h-3 w-3 mr-1" />
      break
    case "completed":
      color = "bg-green-500"
      icon = <CheckCircle className="h-3 w-3 mr-1" />
      break
    case "cancelled":
      color = "bg-red-500"
      icon = <AlertTriangle className="h-3 w-3 mr-1" />
      break
    default:
      color = "bg-gray-500"
  }

  return (
    <Badge className={color}>
      <div className="flex items-center">
        {icon}
        {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    </Badge>
  )
}

// Priority Badge Component
function PriorityBadge({ priority, className = "" }: { priority: string; className?: string }) {
  let color = ""
  let icon = null

  switch (priority) {
    case "low":
      color = "bg-green-100 text-green-800 border-green-200"
      break
    case "medium":
      color = "bg-amber-100 text-amber-800 border-amber-200"
      break
    case "high":
      color = "bg-red-100 text-red-800 border-red-200"
      icon = <AlertTriangle className="h-3 w-3 mr-1" />
      break
    case "emergency":
      color = "bg-red-500 text-white"
      icon = <AlertTriangle className="h-3 w-3 mr-1" />
      break
    default:
      color = "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <Badge variant="outline" className={`${color} flex items-center capitalize ${className}`}>
      {icon}
      {priority}
    </Badge>
  )
}
