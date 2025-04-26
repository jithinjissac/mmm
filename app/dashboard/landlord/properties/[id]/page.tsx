"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Edit,
  MapPin,
  Wifi,
  Tv,
  Utensils,
  Thermometer,
  Car,
  Trash2,
  Plus,
  User,
  CreditCard,
  Calendar,
  Wrench,
  Bed,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { getProperty, deleteProperty } from "../actions"
import { getRooms } from "../../rooms/actions"
import type { Database } from "@/lib/database.types"

type Property = Database["public"]["Tables"]["properties"]["Row"] & {
  property_images: Database["public"]["Tables"]["property_images"]["Row"][]
}

type Room = Database["public"]["Tables"]["rooms"]["Row"] & {
  room_images: Database["public"]["Tables"]["room_images"]["Row"][]
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    async function loadData() {
      try {
        const [propertyData, roomsData] = await Promise.all([getProperty(propertyId), getRooms(propertyId)])
        setProperty(propertyData)
        setRooms(roomsData)
      } catch (error) {
        console.error("Error loading property data:", error)
        toast({
          title: "Error loading property",
          description: "Could not load the property details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [propertyId, toast])

  const handleDeleteProperty = async () => {
    if (!property) return

    setIsDeleting(true)
    try {
      await deleteProperty(propertyId)
      toast({
        title: "Property deleted",
        description: "The property has been deleted successfully.",
      })
      router.push("/dashboard/landlord/properties")
    } catch (error) {
      console.error("Error deleting property:", error)
      toast({
        title: "Error deleting property",
        description: "There was an error deleting the property. Please try again.",
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
          <h1 className="text-3xl font-bold tracking-tight">Property Details</h1>
        </div>
        <div className="flex justify-center p-8">
          <p>Loading property details...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h1 className="text-2xl font-bold">Property not found</h1>
        <p className="text-muted-foreground">The property you are looking for does not exist.</p>
        <Link href="/dashboard/landlord/properties">
          <Button className="mt-4">Back to Properties</Button>
        </Link>
      </div>
    )
  }

  // Calculate occupancy rate
  const occupiedRooms = rooms.filter((room) => room.status === "occupied").length
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0

  // Calculate monthly income
  const monthlyIncome = rooms.reduce((total, room) => {
    return room.status === "occupied" ? total + room.rent : total
  }, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{property.name}</h1>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {property.address}, {property.city}, {property.postcode}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/landlord/properties/${propertyId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit Property
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
                <DialogTitle>Are you sure you want to delete this property?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the property and all associated data
                  including rooms, tenant information, and payment records.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteProperty} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete Property"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Property Images */}
          <Card>
            <CardContent className="p-0 overflow-hidden">
              <div className="relative">
                {property.property_images && property.property_images.length > 0 ? (
                  <img
                    src={
                      property.property_images[selectedImage]?.url ||
                      "/placeholder.svg?height=400&width=600&query=property" ||
                      "/placeholder.svg"
                    }
                    alt={`${property.name} - Image ${selectedImage + 1}`}
                    className="w-full h-[400px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[400px] flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                )}
              </div>
              {property.property_images && property.property_images.length > 0 && (
                <div className="flex p-2 gap-2 overflow-x-auto">
                  {property.property_images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url || "/placeholder.svg"}
                      alt={`${property.name} - Thumbnail ${index + 1}`}
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

          {/* Property Details */}
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              <TabsTrigger value="tenants">Tenants</TabsTrigger>
              <TabsTrigger value="finances">Finances</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Property Type</p>
                      <p className="font-medium">
                        {property.property_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Rooms</p>
                      <p className="font-medium">{rooms.length}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Occupancy</p>
                      <p className="font-medium">
                        {occupiedRooms}/{rooms.length} Rooms
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Monthly Income</p>
                      <p className="font-medium">£{monthlyIncome}</p>
                    </div>
                  </div>

                  {property.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p>{property.description}</p>
                    </div>
                  )}

                  {property.amenities && property.amenities.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {amenity === "WiFi" && <Wifi className="h-3 w-3" />}
                            {amenity === "TV" && <Tv className="h-3 w-3" />}
                            {amenity === "Kitchen" && <Utensils className="h-3 w-3" />}
                            {amenity === "Heating" && <Thermometer className="h-3 w-3" />}
                            {amenity === "Parking" && <Car className="h-3 w-3" />}
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rooms" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Rooms ({rooms.length})</h3>
                <Link href={`/dashboard/landlord/rooms/add?property=${propertyId}`}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Room
                  </Button>
                </Link>
              </div>

              {rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <Bed className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No rooms yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add your first room to start managing your rental spaces.
                  </p>
                  <Link href={`/dashboard/landlord/rooms/add?property=${propertyId}`} className="mt-4">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Room
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rooms.map((room) => (
                    <Card key={room.id} className="overflow-hidden">
                      <div className="h-40 w-full overflow-hidden">
                        {room.room_images && room.room_images.length > 0 ? (
                          <img
                            src={
                              room.room_images.find((img) => img.is_primary)?.url ||
                              room.room_images[0].url ||
                              "/placeholder.svg?height=200&width=300&query=room" ||
                              "/placeholder.svg"
                            }
                            alt={`${room.name}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Bed className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-bold">{room.name}</h3>
                          <Badge variant={room.status === "vacant" ? "outline" : "default"}>
                            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Type:</span>{" "}
                            {room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Max:</span> {room.max_occupants} occupants
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Rent:</span> £{room.rent}/month
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Deposit:</span> £{room.deposit}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Link href={`/dashboard/landlord/rooms/${room.id}`}>
                            <Button size="sm">View Details</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tenants" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Tenants</CardTitle>
                  <CardDescription>Manage tenants currently living in this property</CardDescription>
                </CardHeader>
                <CardContent>
                  {occupiedRooms === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">No tenants yet</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Assign tenants to rooms to see them listed here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p>Tenant information will be displayed here once tenants are assigned to rooms.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="finances" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                  <CardDescription>Track income and expenses for this property</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">£{monthlyIncome}</div>
                        <p className="text-xs text-muted-foreground">From {occupiedRooms} occupied rooms</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Annual Income</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">£{monthlyIncome * 12}</div>
                        <p className="text-xs text-muted-foreground">Projected at current occupancy</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{occupancyRate}%</div>
                        <p className="text-xs text-muted-foreground">
                          {occupiedRooms}/{rooms.length} rooms occupied
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">No transactions yet</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Transaction history will appear here once payments are recorded.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Property Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="ml-auto" variant="outline">
                    Active
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Type</span>
                  <span className="font-medium">
                    {property.property_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Rooms</span>
                  <span className="font-medium">{rooms.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Occupied Rooms</span>
                  <span className="font-medium">{occupiedRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vacant Rooms</span>
                  <span className="font-medium">{rooms.length - occupiedRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Occupancy Rate</span>
                  <span className="font-medium">{occupancyRate}%</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Income</span>
                  <span className="font-medium">£{monthlyIncome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Income</span>
                  <span className="font-medium">£{monthlyIncome * 12}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/landlord/rooms/add?property=${propertyId}`}>
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Add Room
                </Button>
              </Link>
              <Link href={`/dashboard/landlord/properties/${propertyId}/tenants/add`}>
                <Button className="w-full justify-start" variant="outline">
                  <User className="mr-2 h-4 w-4" /> Add Tenant
                </Button>
              </Link>
              <Link href={`/dashboard/landlord/properties/${propertyId}/maintenance/new`}>
                <Button className="w-full justify-start" variant="outline">
                  <Wrench className="mr-2 h-4 w-4" /> Create Maintenance Request
                </Button>
              </Link>
              <Link href={`/dashboard/landlord/properties/${propertyId}/finances`}>
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No upcoming events</h3>
                <p className="text-sm text-muted-foreground mt-2">Events will appear here once scheduled.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
