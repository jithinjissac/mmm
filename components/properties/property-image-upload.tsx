"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Upload, Check } from "lucide-react"
import { uploadImage, deleteImage } from "@/lib/local-storage/upload-service"
import { toast } from "@/components/ui/use-toast"

interface PropertyImageUploadProps {
  existingImages: any[]
  onImagesChange: (images: any[]) => void
  propertyId: string
}

export default function PropertyImageUpload({
  existingImages = [],
  onImagesChange,
  propertyId,
}: PropertyImageUploadProps) {
  const [images, setImages] = useState<any[]>(existingImages)
  const [uploading, setUploading] = useState(false)

  // Handle file upload
  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      setUploading(true)

      // Upload each file
      const uploadPromises = Array.from(files).map(async (file) => {
        const result = await uploadImage(file, `properties/${propertyId}`)
        return result
      })

      const uploadedImages = await Promise.all(uploadPromises)
      const validImages = uploadedImages.filter(Boolean)

      // Update images state
      const newImages = [...images, ...validImages]
      setImages(newImages)
      onImagesChange(newImages)

      toast({
        title: "Images uploaded",
        description: `Successfully uploaded ${validImages.length} images`,
      })
    } catch (error) {
      console.error("Error uploading images:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Reset the input
      event.target.value = ""
    }
  }

  // Set image as primary
  function setPrimaryImage(imageId: string) {
    const updatedImages = images.map((img) => ({
      ...img,
      is_primary: img.id === imageId,
    }))
    setImages(updatedImages)
    onImagesChange(updatedImages)

    toast({
      title: "Primary image set",
      description: "The primary image has been updated",
    })
  }

  // Delete image
  async function handleDeleteImage(imageId: string) {
    try {
      // Delete image from storage
      await deleteImage(imageId)

      // Update images state
      const updatedImages = images.filter((img) => img.id !== imageId)

      // If we deleted the primary image, set a new one
      if (updatedImages.length > 0 && !updatedImages.some((img) => img.is_primary)) {
        updatedImages[0].is_primary = true
      }

      setImages(updatedImages)
      onImagesChange(updatedImages)

      toast({
        title: "Image deleted",
        description: "The image has been deleted",
      })
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="relative overflow-hidden group">
            <div className="aspect-square relative">
              <Image
                src={image.url || "/placeholder.svg"}
                alt="Property"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              {image.is_primary && (
                <div className="absolute top-2 left-2 bg-green-500 text-white p-1 rounded-full">
                  <Check size={16} />
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!image.is_primary && (
                <Button size="sm" variant="secondary" onClick={() => setPrimaryImage(image.id)} title="Set as primary">
                  <Check size={16} />
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => handleDeleteImage(image.id)} title="Delete image">
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}

        {/* Upload button */}
        <Card className="flex items-center justify-center aspect-square">
          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
            <div className="flex flex-col items-center justify-center p-4">
              <Upload className="h-8 w-8 mb-2 text-gray-400" />
              <span className="text-sm text-gray-500">{uploading ? "Uploading..." : "Upload Images"}</span>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </Card>
      </div>

      <p className="text-sm text-gray-500">
        Upload property images. Click on an image to set it as the primary image or delete it.
      </p>
    </div>
  )
}
