"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLocalStorageData, resetLocalStorage } from "@/lib/local-storage/storage-service"

export function DebugAuth() {
  const [showData, setShowData] = useState(false)
  const [data, setData] = useState<any>(null)

  const handleShowData = () => {
    const storageData = getLocalStorageData()
    setData(storageData)
    setShowData(true)
  }

  const handleResetData = () => {
    resetLocalStorage()
    handleShowData()
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Button onClick={handleShowData}>Show Local Storage Data</Button>
          <Button variant="destructive" onClick={handleResetData}>
            Reset Local Storage
          </Button>
        </div>

        {showData && data && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Users</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-40">{JSON.stringify(data.users, null, 2)}</pre>

            <h3 className="text-lg font-semibold mb-2 mt-4">Profiles</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-40">
              {JSON.stringify(data.profiles, null, 2)}
            </pre>

            <h3 className="text-lg font-semibold mb-2 mt-4">Sessions</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-40">
              {JSON.stringify(data.sessions, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
