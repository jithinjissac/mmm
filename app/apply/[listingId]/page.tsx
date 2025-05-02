"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { VerificationCheck } from "@/components/verification/verification-check"

export default function RentalApplicationPage({ params }: { params: { listingId: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { listingId } = params

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Application Submitted",
        description: "Your rental application has been successfully submitted.",
      })

      router.push("/dashboard/tenant")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error submitting your application. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <VerificationCheck requiredFor={["/apply"]}>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Rental Application</h1>
        <Card>
          <CardHeader>
            <CardTitle>Apply for Property</CardTitle>
            <CardDescription>Complete this form to apply for the rental property.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john.doe@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="07123456789" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentAddress">Current Address</Label>
                  <Input id="currentAddress" placeholder="123 Current Street, London" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Input id="employmentStatus" placeholder="Employed, Self-employed, etc." required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="income">Monthly Income (£)</Label>
                  <Input id="income" type="number" placeholder="3000" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moveInDate">Desired Move-in Date</Label>
                  <Input id="moveInDate" type="date" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Any additional information you'd like to share..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm">
                    I confirm that all information provided is accurate and I authorize background and credit checks.
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </VerificationCheck>
  )
}
