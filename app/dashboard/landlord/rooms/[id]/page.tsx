"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Edit, Trash2, Building, CreditCard, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getRoomById, deleteRoom } from "@/lib/local-storage/storage-service"
import { TenantManagement } from "@/components/tenant-management"
import { useAuth } from "@/components/mock-auth-provider"
import type { LocalRoom } from "@/lib/local-storage/storage-service"

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [room, setRoom] = useState<LocalRoom | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRoom() {
      try {
        if (!params.id || typeof params.id !== "string") {
          setError("Invalid room ID")
          setIsLoading(false)
          return
        }

        const roomData = await getRoomById(params.id)

        if (!roomData) {
          setError("Room not found")
          setIsLoading(false)
          return
        }

        // Check if user is the landlord of this room
        if (user && roomData.properties && roomData.properties.landlord_id !== user.id) {
          setError("You don't have permission to view this room")
          setIsLoading(false)
          return
        }

        setRoom(roomData)
        setIsLoading(false)
      } catch (err) {
        console.error("Error loading room:", err)
        setError("Failed to load room details")
        setIsLoading(false)
      }
    }

    loadRoom()
  }, [params.id, user])

  const handleDeleteRoom = async () => {
    if (!room) return

    setIsDeleting(true)
    try {
      await deleteRoom(params.id as string)
      toast({
        title: "Room deleted",
        description: "The room has been deleted successfully.",
      })
      router.push(`/dashboard/landlord/properties/${room.property_id}`)
    } catch (error) {
      console.error("Error deleting room:", error)
      toast({
        title: "Error deleting room",
        description: "There was an error deleting the room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/landlord/rooms">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Room Details</h1>
        </div>
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading room details...</span>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/landlord/rooms">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Room Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p>{error || "The room you are looking for does not exist or you don't have permission to view it."}</p>
            <Link href="/dashboard/landlord/rooms">
              <Button className="mt-4">Back to Rooms</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/landlord/rooms">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
          <Badge variant={room.status === "vacant" ? "outline" : "default"}>
            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/landlord/rooms/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit Room
            </Button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete this room?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the room and all associated data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteRoom} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete Room"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Room Images */}
          <Card>
            <CardContent className="p-0 overflow-hidden">
              <div className="relative">
                {room.room_images && room.room_images.length > 0 ? (
                  <img
                    src={room.room_images[selectedImage]?.url || "/placeholder.svg?height=400&width=600&query=room"}
                    alt={`${room.name} - Image ${selectedImage + 1}`}
                    className="w-full h-[400px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[400px] flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                )}
              </div>
              {room.room_images && room.room_images.length > 0 && (
                <div className="flex p-2 gap-2 overflow-x-auto">
                  {room.room_images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url || "/placeholder.svg"}
                      alt={`${room.name} - Thumbnail ${index + 1}`}
                      className={`h-16 w-24 object-cover cursor-pointer rounded-md ${
                        selectedImage === index ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room Details */}
          <Card>
            <CardHeader>
              <CardTitle>Room Information</CardTitle>
              <CardDescription>Details about this room</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Room Type</p>
                  <p className="font-medium">{room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Max Occupants</p>
                  <p className="font-medium">{room.max_occupants}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Monthly Rent</p>
                  <p className="font-medium">£{room.rent}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Deposit</p>
                  <p className="font-medium">£{room.deposit}</p>
                </div>
              </div>

              {room.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p>{room.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Property</p>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <Link
                    href={`/dashboard/landlord/properties/${room.property_id}`}
                    className="text-primary hover:underline"
                  >
                    {room.properties?.name}
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {room.properties?.address}, {room.properties?.city}, {room.properties?.postcode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Management */}
          <TenantManagement room={room} />
        </div>

        {/* Room Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Room Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="ml-auto" variant={room.status === "vacant" ? "outline" : "default"}>
                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Type</span>
                  <span className="font-medium">
                    {room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Occupants</span>
                  <span className="font-medium">{room.max_occupants}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Rent</span>
                  <span className="font-medium">£{room.rent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deposit</span>
                  <span className="font-medium">£{room.deposit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Income</span>
                  <span className="font-medium">£{Number(room.rent) * 12}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/landlord/rooms/${params.id}/edit`}>
                <Button className="w-full justify-start" variant="outline">
                  <Edit className="mr-2 h-4 w-4" /> Edit Room Details
                </Button>
              </Link>
              <Link href={`/dashboard/landlord/rooms/${params.id}/payments`}>
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
