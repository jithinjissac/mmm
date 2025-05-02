"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock tenancy data (simplified)
const MOCK_TENANCIES = [
  {
    id: "tenancy1",
    listing_title: "Modern City Apartment",
    room_name: "Master Bedroom",
  },
  // Other tenancies...
]

// Mock issue categories
const ISSUE_CATEGORIES = [
  { id: "plumbing", name: "Plumbing" },
  { id: "electrical", name: "Electrical" },
  { id: "heating", name: "Heating" },
  { id: "appliance", name: "Appliance" },
  { id: "structural", name: "Structural" },
  { id: "pest", name: "Pest Control" },
  { id: "other", name: "Other" },
]

export function IssueForm() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [tenancy, setTenancy] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    urgency: "medium",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    const fetchTenancy = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const foundTenancy = MOCK_TENANCIES.find((t) => t.id === params.id)
        if (!foundTenancy) {
          toast({
            title: "Tenancy not found",
            description: "The tenancy you're looking for doesn't exist or has been removed.",
            variant: "destructive",
          })
          router.push("/tenancies")
          return
        }

        setTenancy(foundTenancy)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load tenancy details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchTenancy()
    }
  }, [params.id, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.category || !formData.title || !formData.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to submit the issue
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Issue reported",
        description: "Your maintenance issue has been reported successfully.",
      })

      router.push(`/tenancy/${params.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to report issue. Please try again.",
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

  if (!tenancy) return null

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Report Maintenance Issue</CardTitle>
          <CardDescription>
            Report a maintenance issue for {tenancy.listing_title} - {tenancy.room_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Issue Category <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Issue Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Brief title of the issue"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Please provide details about the issue..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleSelectChange("urgency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Can be fixed when convenient</SelectItem>
                    <SelectItem value="medium">Medium - Needs attention within a week</SelectItem>
                    <SelectItem value="high">High - Needs urgent attention</SelectItem>
                    <SelectItem value="emergency">Emergency - Immediate attention required</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Upload Image (Optional)</Label>
                <div className="border-2 border-dashed rounded-md p-4 text-center">
                  <Input id="image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  <Label htmlFor="image" className="cursor-pointer block">
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">Click to upload an image</span>
                      <span className="text-xs text-muted-foreground mt-1">PNG, JPG or JPEG (max. 5MB)</span>
                    </div>
                  </Label>

                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Issue preview"
                        className="max-h-40 mx-auto rounded-md"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Important Note</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      For emergency issues that pose immediate danger (gas leaks, flooding, electrical hazards), please
                      also contact emergency services or your landlord directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => router.push(`/tenancy/${params.id}`)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Issue
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
