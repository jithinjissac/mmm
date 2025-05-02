"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/components/mock-auth-provider"

export function ListingForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [isShared, setIsShared] = useState(false)
  const [rooms, setRooms] = useState([{ id: "1", name: "", type: "", maxOccupancy: 1, rent: 0, deposit: 0 }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const addRoom = () => {
    setRooms([
      ...rooms,
      {
        id: Date.now().toString(),
        name: "",
        type: "",
        maxOccupancy: 1,
        rent: 0,
        deposit: 0,
      },
    ])
  }

  const removeRoom = (id: string) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((room) => room.id !== id))
    } else {
      toast({
        title: "Cannot remove room",
        description: "A listing must have at least one room",
        variant: "destructive",
      })
    }
  }

  const updateRoom = (id: string, field: string, value: any) => {
    setRooms(rooms.map((room) => (room.id === id ? { ...room, [field]: value } : room)))
  }

  const validateForm = () => {
    // Basic validation
    if (!title || !description || !propertyType) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return false
    }

    // Validate rooms
    for (const room of rooms) {
      if (!room.name || !room.type || room.rent <= 0 || room.deposit <= 0) {
        toast({
          title: "Invalid room details",
          description: "Please ensure all rooms have a name, type, and positive rent/deposit values",
          variant: "destructive",
        })
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const listingData = {
        title,
        description,
        property_type: propertyType,
        is_shared: isShared,
        rooms: rooms.map((room) => ({
          name: room.name,
          type: room.type,
          max_occupancy: room.maxOccupancy,
          rent: room.rent,
          deposit: room.deposit,
        })),
        landlord_id: user?.id,
        created_at: new Date().toISOString(),
      }

      console.log("Creating listing:", listingData)

      toast({
        title: "Listing created",
        description: "Your property listing has been created successfully",
      })

      router.push("/dashboard/landlord/properties")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Property Listing</CardTitle>
        <CardDescription>Add a new property to rent out</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Listing Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spacious 2-bedroom apartment in Central London"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your property..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property-type">
                  Property Type <span className="text-destructive">*</span>
                </Label>
                <Select value={propertyType} onValueChange={setPropertyType} required>
                  <SelectTrigger id="property-type">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 h-full pt-8">
                <Checkbox
                  id="is-shared"
                  checked={isShared}
                  onCheckedChange={(checked) => setIsShared(checked as boolean)}
                />
                <Label htmlFor="is-shared">This is a shared property</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Rooms</h3>
              <Button type="button" variant="outline" size="sm" onClick={addRoom}>
                <Plus className="h-4 w-4 mr-2" /> Add Room
              </Button>
            </div>

            {rooms.map((room, index) => (
              <Card key={room.id} className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Room {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRoom(room.id)}
                    disabled={rooms.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`room-name-${room.id}`}>
                      Room Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`room-name-${room.id}`}
                      value={room.name}
                      onChange={(e) => updateRoom(room.id, "name", e.target.value)}
                      placeholder="e.g. Master Bedroom"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`room-type-${room.id}`}>
                      Room Type <span className="text-destructive">*</span>
                    </Label>
                    <Select value={room.type} onValueChange={(value) => updateRoom(room.id, "type", value)} required>
                      <SelectTrigger id={`room-type-${room.id}`}>
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
                    <Label htmlFor={`max-occupancy-${room.id}`}>
                      Maximum Occupancy <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`max-occupancy-${room.id}`}
                      type="number"
                      min="1"
                      value={room.maxOccupancy}
                      onChange={(e) => updateRoom(room.id, "maxOccupancy", Number.parseInt(e.target.value))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`rent-${room.id}`}>
                      Monthly Rent (£) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`rent-${room.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={room.rent}
                      onChange={(e) => updateRoom(room.id, "rent", Number.parseFloat(e.target.value))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`deposit-${room.id}`}>
                      Deposit (£) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`deposit-${room.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={room.deposit}
                      onChange={(e) => updateRoom(room.id, "deposit", Number.parseFloat(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Listing..." : "Create Listing"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
