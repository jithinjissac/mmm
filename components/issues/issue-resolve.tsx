"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock issue data
const MOCK_ISSUES = [
  {
    id: "issue1",
    tenancy_id: "tenancy1",
    description: "Leaking tap in bathroom",
    category: "plumbing",
    title: "Bathroom Tap Leak",
    urgency: "medium",
    status: "pending",
    created_at: "2023-07-20T09:15:00Z",
    tenant_name: "Alice Johnson",
    property_title: "Modern City Apartment",
    room_name: "Master Bedroom",
  },
  {
    id: "issue2",
    tenancy_id: "tenancy1",
    description:
      "Heating not working properly in the living room. It only heats up for a short time and then turns off.",
    category: "heating",
    title: "Heating System Issue",
    urgency: "high",
    status: "pending",
    created_at: "2023-08-10T16:45:00Z",
    tenant_name: "Alice Johnson",
    property_title: "Modern City Apartment",
    room_name: "Master Bedroom",
  },
]

export function IssueResolve() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [issue, setIssue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState("")

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const foundIssue = MOCK_ISSUES.find((i) => i.id === params.id)
        if (!foundIssue) {
          toast({
            title: "Issue not found",
            description: "The issue you're looking for doesn't exist or has been removed.",
            variant: "destructive",
          })
          router.push("/dashboard/landlord/maintenance")
          return
        }

        setIssue(foundIssue)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load issue details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchIssue()
    }
  }, [params.id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!resolutionNotes.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide resolution notes.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to resolve the issue
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Issue resolved",
        description: "The maintenance issue has been marked as resolved.",
      })

      router.push(`/tenancy/${issue.tenancy_id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve issue. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!issue) return null

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Resolve Maintenance Issue</CardTitle>
          <CardDescription>Provide resolution details for the reported issue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">Issue Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p className="font-medium">{issue.property_title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-medium">{issue.room_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reported By</p>
                  <p className="font-medium">{issue.tenant_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date Reported</p>
                  <p className="font-medium">{new Date(issue.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">{issue.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Urgency</p>
                  <p className="font-medium capitalize">{issue.urgency}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Issue Title</p>
                <p className="font-medium">{issue.title}</p>
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{issue.description}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="resolutionNotes" className="text-sm font-medium">
                  Resolution Notes <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="resolutionNotes"
                  placeholder="Describe how the issue was resolved..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="min-h-[150px]"
                />
                <p className="text-sm text-muted-foreground">
                  Please provide details about how the issue was resolved, any parts replaced, and any follow-up actions
                  required.
                </p>
              </div>
            </form>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => router.push(`/tenancy/${issue.tenancy_id}`)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Mark as Resolved
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
