"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function SupabaseDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    setError(null)

    try {
      // Check health endpoint
      const healthResponse = await fetch("/api/health")
      const healthData = await healthResponse.json()

      // Try a direct Supabase query
      const { data, error: supabaseError } = await supabase.from("profiles").select("count").limit(1)

      setDiagnostics({
        timestamp: new Date().toISOString(),
        health: healthData,
        directQuery: {
          success: !supabaseError,
          data,
          error: supabaseError,
        },
        browser: {
          online: navigator.onLine,
          userAgent: navigator.userAgent,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Supabase Connection Diagnostics
          <Button variant="outline" size="sm" onClick={runDiagnostics} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>Troubleshoot Supabase connection issues</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && !diagnostics && (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {diagnostics && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2 font-medium">Environment Variables</div>
              {Object.entries(diagnostics.health.environment).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center border p-2 rounded-md">
                  <span className="text-sm font-mono">{key}</span>
                  <Badge variant={value === "set" ? "default" : "destructive"}>{value}</Badge>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="font-medium">Supabase Health Check</div>
              <div className="border p-3 rounded-md">
                <div className="flex items-center mb-2">
                  <span className="font-medium mr-2">Status:</span>
                  {diagnostics.health.supabase.status === "ok" ? (
                    <Badge className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" /> Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center">
                      <XCircle className="h-3 w-3 mr-1" /> Error
                    </Badge>
                  )}
                </div>
                {diagnostics.health.supabase.status !== "ok" && (
                  <div className="text-sm text-red-500 mt-1">{diagnostics.health.supabase.message}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="font-medium">Direct Query Test</div>
              <div className="border p-3 rounded-md">
                <div className="flex items-center mb-2">
                  <span className="font-medium mr-2">Status:</span>
                  {diagnostics.directQuery.success ? (
                    <Badge className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" /> Success
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center">
                      <XCircle className="h-3 w-3 mr-1" /> Failed
                    </Badge>
                  )}
                </div>
                {!diagnostics.directQuery.success && (
                  <div className="text-sm text-red-500 mt-1">
                    {diagnostics.directQuery.error?.message || "Unknown error"}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="font-medium">Network Status</div>
              <div className="border p-3 rounded-md">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Browser Online:</span>
                  {diagnostics.browser.online ? (
                    <Badge className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" /> Online
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center">
                      <XCircle className="h-3 w-3 mr-1" /> Offline
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Last updated: {diagnostics?.timestamp ? new Date(diagnostics.timestamp).toLocaleString() : "Never"}
      </CardFooter>
    </Card>
  )
}
