"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, AlertTriangle, Info, RefreshCw } from "lucide-react"

// Error log storage
type ErrorLog = {
  id: string
  timestamp: number
  operationId: string
  category: string
  message: string
  attempt: number
  maxAttempts: number
  duration: number
  context?: Record<string, any>
}

// In-memory storage for error logs (only in development)
const errorLogs: ErrorLog[] = []

// Maximum number of logs to keep
const MAX_LOGS = 100

// Add error log
export function addErrorLog(log: Omit<ErrorLog, "id">) {
  if (process.env.NODE_ENV !== "development") return

  // Generate a unique ID
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Add to logs
  errorLogs.unshift({ ...log, id })

  // Trim logs if needed
  if (errorLogs.length > MAX_LOGS) {
    errorLogs.length = MAX_LOGS
  }

  // Dispatch event to notify viewers
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("error-log-added"))
  }
}

// Clear all logs
export function clearErrorLogs() {
  errorLogs.length = 0

  // Dispatch event to notify viewers
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("error-logs-cleared"))
  }
}

// Get category color
function getCategoryColor(category: string): string {
  switch (category) {
    case "NETWORK_ERROR":
      return "bg-red-500"
    case "AUTH_ERROR":
      return "bg-yellow-500"
    case "TIMEOUT_ERROR":
      return "bg-orange-500"
    case "RATE_LIMIT_ERROR":
      return "bg-purple-500"
    case "SERVER_ERROR":
      return "bg-red-700"
    case "DATABASE_ERROR":
      return "bg-blue-600"
    case "VALIDATION_ERROR":
      return "bg-green-600"
    default:
      return "bg-gray-500"
  }
}

export default function ErrorLogViewer() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [isVisible, setIsVisible] = useState(false)

  // Update logs when new ones are added
  useEffect(() => {
    const updateLogs = () => {
      setLogs([...errorLogs])
    }

    // Initial load
    updateLogs()

    // Listen for new logs
    window.addEventListener("error-log-added", updateLogs)
    window.addEventListener("error-logs-cleared", updateLogs)

    return () => {
      window.removeEventListener("error-log-added", updateLogs)
      window.removeEventListener("error-logs-cleared", updateLogs)
    }
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  // Filter logs
  const filteredLogs = filter === "all" ? logs : logs.filter((log) => log.category === filter)

  // Get unique categories
  const categories = Array.from(new Set(logs.map((log) => log.category)))

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button variant="destructive" size="sm" onClick={() => setIsVisible(true)} className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {logs.length > 0 ? `${logs.length} Errors` : "Error Log"}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[600px] max-w-[calc(100vw-2rem)]">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Error Logs
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} errors
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-2 w-full">
              <TabsTrigger value="all" onClick={() => setFilter("all")}>
                All
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} onClick={() => setFilter(category)}>
                  {category.replace("_ERROR", "")}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="h-[300px] rounded border p-2">
              {filteredLogs.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  <Info className="mr-2 h-4 w-4" />
                  No errors logged
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="rounded border p-2 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium">{log.operationId}</div>
                        <Badge className={`${getCategoryColor(log.category)} text-white`}>{log.category}</Badge>
                      </div>
                      <div className="text-muted-foreground mb-1">
                        {new Date(log.timestamp).toLocaleTimeString()} • Attempt {log.attempt}/{log.maxAttempts} •
                        {log.duration}ms
                      </div>
                      <div className="font-mono text-xs bg-muted p-1 rounded">{log.message}</div>
                      {log.context && (
                        <div className="mt-1 text-xs">
                          <span className="font-medium">Context:</span>{" "}
                          {Object.entries(log.context).map(([key, value]) => (
                            <span key={key} className="mr-2">
                              {key}={JSON.stringify(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => clearErrorLogs()} className="text-xs">
            Clear Logs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLogs([...errorLogs])}
            className="text-xs flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
