"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getLocalStorageData, resetLocalStorage, clearLocalStorage } from "@/lib/local-storage/storage-service"

export function DebugStorage() {
  const [showData, setShowData] = useState(false)
  const [data, setData] = useState(() => {
    if (typeof window !== "undefined") {
      return getLocalStorageData()
    }
    return null
  })

  const refreshData = () => {
    if (typeof window !== "undefined") {
      setData(getLocalStorageData())
    }
  }

  const handleReset = () => {
    resetLocalStorage()
    refreshData()
  }

  const handleClear = () => {
    clearLocalStorage()
    refreshData()
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Debug Storage</CardTitle>
        <CardDescription>View and manage local storage data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={() => setShowData(!showData)}>{showData ? "Hide Data" : "Show Data"}</Button>
            <Button onClick={refreshData} variant="outline">
              Refresh Data
            </Button>
          </div>

          {showData && data && (
            <div className="max-h-96 overflow-auto rounded border p-4">
              <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleReset} variant="outline">
          Reset to Default Data
        </Button>
        <Button onClick={handleClear} variant="destructive">
          Clear All Data
        </Button>
      </CardFooter>
    </Card>
  )
}
