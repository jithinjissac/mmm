"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"

export default function NewWorkOrderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    property: "",
    priority: "medium",
    description: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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
    if (!formData.title || !formData.property || !formData.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to create the work order
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Work order created",
        description: "The work order has been created successfully.",
      })

      router.push("/dashboard/maintenance/work-orders")
    } catch (error) {
      console.error("Error creating work order:", error)
      toast({
        title: "Error",
        description: "Failed to create work order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/maintenance/work-orders")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work Orders
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Work Order</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Work Order Details</CardTitle>
            <CardDescription>Create a new maintenance work order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Brief title of the work order"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="property">
                Property <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.property} onValueChange={(value) => handleSelectChange("property", value)}>
                <SelectTrigger id="property">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prop1">Riverside Apartment</SelectItem>
                  <SelectItem value="prop2">Garden Cottage</SelectItem>
                  <SelectItem value="prop3">City View Flat</SelectItem>
                  <SelectItem value="prop4">Suburban House</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
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
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed description of the work order..."
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
              />
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
                      alt="Work order preview"
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
          </CardContent>
          <CardFooter>
            <div className="flex justify-between w-full">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/maintenance/work-orders")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Work Order
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
