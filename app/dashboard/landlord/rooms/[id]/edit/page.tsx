"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function EditRoomPage() {
  const { id } = useParams()
  const roomId = Array.isArray(id) ? id[0] : id
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [room, setRoom] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    size: "",
    status: "available",
    propertyId: "",
    amenities: "",
    images: [],
  })

  useEffect(() => {
    async function fetchRoom() {
      if (!roomId) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/rooms/${roomId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch room")
        }

        const data = await response.json()
        setRoom({
          id: data.id,
          name: data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          size: data.size?.toString() || "",
          status: data.status || "available",
          propertyId: data.propertyId || "",
          amenities: data.amenities || "",
          images: data.images || [],
        })
      } catch (error) {
        console.error("Error fetching room:", error)
        toast({
          title: "Error",
          description: "Failed to load room details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchRoom()
    }
  }, [roomId, user, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRoom((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setRoom((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update a room",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      const roomData = {
        ...room,
        price: Number.parseFloat(room.price),
        size: Number.parseFloat(room.size),
      }

      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      })

      if (!response.ok) {
        throw new Error("Failed to update room")
      }

      toast({
        title: "Success",
        description: "Room updated successfully",
      })

      router.push(`/dashboard/landlord/rooms/${roomId}`)
    } catch (error) {
      console.error("Error updating room:", error)
      toast({
        title: "Error",
        description: "Failed to update room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading room details...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Room</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Room Name</Label>
              <Input id="name" name="name" value={room.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={room.description} onChange={handleChange} rows={4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (£ per month)</Label>
                <Input id="price" name="price" type="number" value={room.price} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size (sq ft)</Label>
                <Input id="size" name="size" type="number" value={room.size} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={room.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (comma separated)</Label>
              <Input
                id="amenities"
                name="amenities"
                value={room.amenities}
                onChange={handleChange}
                placeholder="e.g. En-suite bathroom, Built-in wardrobe, Desk"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
