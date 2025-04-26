"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, X, Upload } from "lucide-react"
import { createRoom } from "../actions"
import { getProperties } from "../../properties/actions"
import type { Database } from "@/lib/database.types"

type Property = Database["public"]["Tables"]["properties"]["Row"]

export default function AddRoomPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [properties, setProperties] = useState<Property[]>([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(true)

  const [formData, setFormData] = useState({
    property_id: "",
    name: "",
    room_type: "" as "single" | "double" | "ensuite" | "studio",
    max_occupants: 1,
    rent: 0,
    deposit: 0,
    status: "vacant" as "vacant" | "occupied" | "maintenance" | "reserved",
    description: "",
  })

  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    async function loadProperties() {
      try {
        const propertiesData = await getProperties()
        setProperties(propertiesData)
      } catch (error) {
        console.error("Error loading properties:", error)
        toast({
          title: "Error loading properties",
          description: "Could not load your properties. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProperties(false)
      }
    }

    loadProperties()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))
      setImages((prev) => [...prev, ...newImages])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }

  const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const data = await response.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (
        !formData.property_id ||
        !formData.name ||
        !formData.room_type ||
        formData.rent <= 0 ||
        formData.deposit <= 0
      ) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Upload images
      const uploadedImages = []
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          setUploadProgress(Math.round((i / images.length) * 100))
          const url = await uploadImage(images[i].file)
          uploadedImages.push({
            url,
            is_primary: i === 0, // First image is primary
          })
        }
      }

      // Create room
      await createRoom(
        {
          property_id: formData.property_id,
          name: formData.name,
          room_type: formData.room_type,
          max_occupants: formData.max_occupants,
          rent: formData.rent,
          deposit: formData.deposit,
          status: formData.status,
          description: formData.description || null,
        },
        uploadedImages,
      )

      toast({
        title: "Room added",
        description: "Your room has been added successfully.",
      })

      router.push(`/dashboard/landlord/properties/${formData.property_id}`)
    } catch (error) {
      console.error("Error adding room:", error)
      toast({
        title: "Error adding room",
        description: "There was an error adding your room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  if (isLoadingProperties) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/landlord/rooms">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Add New Room</h1>
        </div>
        <div className="flex justify-center p-8">
          <p>Loading properties...</p>
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/landlord/rooms">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Add New Room</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Properties Found</CardTitle>
            <CardDescription>You need to add a property before you can add rooms.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/landlord/properties/add">
              <Button>Add Property</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/landlord/rooms">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add New Room</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Details</CardTitle>
                <CardDescription>Enter the basic information about the room</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="property_id">
                    Property <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.property_id}
                    onValueChange={(value) => handleSelectChange("property_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    Room Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Room 1, Master Bedroom"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room_type">
                    Room Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.room_type}
                    onValueChange={(value) =>
                      handleSelectChange("room_type", value as "single" | "double" | "ensuite" | "studio")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="ensuite">Ensuite</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_occupants">Maximum Occupants</Label>
                  <Input
                    id="max_occupants"
                    name="max_occupants"
                    type="number"
                    min="1"
                    value={formData.max_occupants}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rent">
                      Monthly Rent (£) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="rent"
                      name="rent"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.rent}
                      onChange={handleNumberChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deposit">
                      Deposit (£) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="deposit"
                      name="deposit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.deposit}
                      onChange={handleNumberChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value as "vacant" | "occupied" | "maintenance" | "reserved")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacant">Vacant</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the room..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Images</CardTitle>
                <CardDescription>Upload images of the room</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                  <label
                    htmlFor="image-upload"
                    className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="font-medium">Click to upload images</p>
                    <p className="text-sm text-muted-foreground">Upload high-quality images of the room</p>
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Images ({images.length})</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.preview || "/placeholder.svg"}
                            alt={`Room image ${index + 1}`}
                            className="h-24 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isSubmitting && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm">Uploading images: {uploadProgress}%</p>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Save Room</CardTitle>
                <CardDescription>Add this room to your property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Once your room is created, you'll be able to:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Assign tenants to this room</li>
                  <li>Track rent payments</li>
                  <li>Manage maintenance requests</li>
                  <li>Update room details and status</li>
                </ul>
                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating Room..." : "Create Room"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
