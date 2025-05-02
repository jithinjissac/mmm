"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"
import { Loader2 } from "lucide-react"

// Mock listing data
const MOCK_LISTING = {
  id: "listing123",
  title: "Spacious 3-bedroom house in North London",
  property_type: "house",
  is_shared: true,
  rooms: [
    { id: "room1", name: "Master Bedroom", type: "ensuite", rent: 800, deposit: 1200 },
    { id: "room2", name: "Double Room", type: "double", rent: 700, deposit: 1050 },
    { id: "room3", name: "Single Room", type: "single", rent: 550, deposit: 825 },
  ],
}

export function ApplicationForm() {
  const [selectedRoom, setSelectedRoom] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [occupation, setOccupation] = useState("")
  const [income, setIncome] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [listing, setListing] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchListing = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock fetching the listing data
        setListing(MOCK_LISTING)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load listing details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRoom || !fullName || !email || !phone || !occupation || !income) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const applicationData = {
        listing_id: listing.id,
        room_id: selectedRoom,
        tenant_id: user?.id,
        full_name: fullName,
        email,
        phone,
        occupation,
        monthly_income: Number.parseFloat(income),
        additional_info: additionalInfo,
        status: "pending",
        created_at: new Date().toISOString(),
      }

      console.log("Submitting application:", applicationData)

      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
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

  if (!listing) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Listing not found. Please try again.</p>
          <Button className="mt-4" onClick={() => router.push("/listings")}>
            Back to Listings
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for Room</CardTitle>
        <CardDescription>Complete this form to apply for a room in {listing.title}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room">
                Select Room <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom} required>
                <SelectTrigger id="room">
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {listing.rooms.map((room: any) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} - £{room.rent}/month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">
                Occupation <span className="text-destructive">*</span>
              </Label>
              <Input
                id="occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Enter your occupation"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="income">
                Monthly Income (£) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="income"
                type="number"
                min="0"
                step="0.01"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="Enter your monthly income"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional-info">Additional Information</Label>
              <Textarea
                id="additional-info"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Provide any additional information that might support your application"
                rows={4}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting Application..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
