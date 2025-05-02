"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, Flag, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"

export function FlagReview() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [flagReason, setFlagReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const reason = flagReason === "other" ? customReason : flagReason

    if (!reason) {
      toast({
        title: "Missing information",
        description: "Please provide a reason for flagging this review.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Review flagged",
        description: "Thank you for your feedback. Our team will review this content.",
      })

      // Redirect back to the tenancy page
      router.push(`/tenancy/${params.tenancyId}`)
    } catch (error) {
      console.error("Error flagging review:", error)
      toast({
        title: "Error",
        description: "Failed to flag review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="outline" size="sm" className="mb-6" onClick={() => router.push(`/tenancy/${params.tenancyId}`)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tenancy
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Flag Inappropriate Review</CardTitle>
          <CardDescription>
            Please provide a reason for flagging this review. Our team will review your report.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Reason for flagging</Label>
              <RadioGroup value={flagReason} onValueChange={setFlagReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inappropriate" id="inappropriate" />
                  <Label htmlFor="inappropriate">Inappropriate or offensive content</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inaccurate" id="inaccurate" />
                  <Label htmlFor="inaccurate">Inaccurate information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spam" id="spam" />
                  <Label htmlFor="spam">Spam or misleading</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other reason</Label>
                </div>
              </RadioGroup>
            </div>

            {flagReason === "other" && (
              <div className="space-y-2">
                <Label htmlFor="custom-reason">Please specify</Label>
                <Textarea
                  id="custom-reason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please provide details about why you're flagging this review..."
                  rows={3}
                />
              </div>
            )}

            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <div className="flex items-start">
                <Flag className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">Important Note</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Flagged content will be reviewed by our moderation team. Abuse of the flagging system may result in
                    account restrictions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex justify-between w-full">
              <Button type="button" variant="outline" onClick={() => router.push(`/tenancy/${params.tenancyId}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Report
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
