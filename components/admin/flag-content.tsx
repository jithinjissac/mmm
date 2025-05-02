"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"

// Mock data for flagged content
const MOCK_FLAGGED_CONTENT = [
  {
    id: "flag1",
    content_type: "listing",
    content_id: "listing123",
    content_title: "Cozy Apartment in London",
    reason: "Misleading information about amenities",
    reported_by: "user456",
    reported_at: "2023-06-15T10:30:00Z",
  },
  {
    id: "flag2",
    content_type: "review",
    content_id: "review789",
    content_title: "Review for 123 Main St",
    reason: "Contains offensive language",
    reported_by: "user789",
    reported_at: "2023-06-14T15:45:00Z",
  },
]

export function FlagContent() {
  const [contentType, setContentType] = useState("")
  const [contentId, setContentId] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [flaggedContent, setFlaggedContent] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const { toast } = useToast()
  const { user, userRole } = useAuth()

  useEffect(() => {
    // Check if user is admin
    setIsAdmin(userRole === "admin")

    // Load flagged content for admins
    if (userRole === "admin") {
      // In a real app, this would be an API call
      setFlaggedContent(MOCK_FLAGGED_CONTENT)
    }

    setIsLoading(false)
  }, [userRole])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contentType || !contentId || !reason) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Content flagged",
        description: "Thank you for your report. An admin will review it shortly.",
      })

      // Reset form
      setContentType("")
      setContentId("")
      setReason("")

      // Redirect to home
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolveFlag = async (flagId: string) => {
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Remove the flag from the list
      setFlaggedContent(flaggedContent.filter((flag) => flag.id !== flagId))

      toast({
        title: "Flag resolved",
        description: "The flagged content has been resolved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve flag. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {!isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Flag Content</CardTitle>
            <CardDescription>Report inappropriate or misleading content</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType} required>
                  <SelectTrigger id="content-type">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="listing">Listing</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-id">Content ID</Label>
                <Input
                  id="content-id"
                  value={contentId}
                  onChange={(e) => setContentId(e.target.value)}
                  placeholder="Enter the ID of the content"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you are flagging this content"
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Flagged Content</CardTitle>
            <CardDescription>Review and moderate flagged content</CardDescription>
          </CardHeader>
          <CardContent>
            {flaggedContent.length === 0 ? (
              <p>No flagged content to review.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedContent.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell className="capitalize">{flag.content_type}</TableCell>
                      <TableCell>{flag.content_title}</TableCell>
                      <TableCell>{flag.reason}</TableCell>
                      <TableCell>{flag.reported_by}</TableCell>
                      <TableCell>{new Date(flag.reported_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="destructive" size="sm" onClick={() => handleResolveFlag(flag.id)}>
                            Remove
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleResolveFlag(flag.id)}>
                            Keep
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
