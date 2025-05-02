"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, MapPin, Bed, Edit, Trash2, Plus, Users, Wrench } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/utils/format-helpers"
import { deleteProperty } from "@/app/dashboard/landlord/actions"
import { toast } from "@/hooks/use-toast"

const propertyTypeLabels = {
  apartment: "Apartment",
  apartment_building: "Apartment Building",
  house: "House",
  studio: "Studio",
  shared_house: "Shared House",
}

export function PropertyDetailsView({ property, rooms, tenants, maintenanceRequests }: any) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteProperty(property.id)
      if (result.success) {
        toast({
          title: "Property deleted",
          description: "The property has been successfully deleted.",
          variant: "default",
        })
        router.push("/dashboard/landlord/properties")
      } else {
        throw new Error(result.error || "Failed to delete property")
      }
    } catch (error) {
      console.error("Error deleting property:", error)
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  // Get primary image or placeholder
  const primaryImage = property.property_images?.find((img: any) => img.is_primary)?.url || "/suburban-house-exterior.png"

  // Calculate stats
  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter((room: any) => room.status === "occupied").length
  const vacantRooms = rooms.filter((room: any) => room.status === "vacant").length
  const totalIncome = rooms.reduce((sum: number, room: any) => sum + (room.rent || 0), 0)
  const activeMaintenanceRequests = maintenanceRequests.filter(
    (req: any) => req.status !== "completed" && req.status !== "cancelled",
  ).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{property.name}</h1>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {property.address}, {property.city}, {property.postcode}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/landlord/properties/${property.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Property</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this property? This action cannot be undone and will remove all
                  associated rooms, images, and data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <span className="mr-2">Deleting...</span>
                      <span className="animate-spin">⏳</span>
                    </>
                  ) : (
                    "Delete Property"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-t-lg">
            <Image
              src={primaryImage || "/placeholder.svg"}
              alt={property.name}
              fill
              className="object-cover"
              priority
            />
            <Badge
              className="absolute top-2 right-2"
              variant={property.status === "available" ? "default" : "secondary"}
            >
              {property.status === "available" ? "Available" : "Rented"}
            </Badge>
          </div>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Home className="h-5 w-5 mb-1 text-primary" />
                <span className="text-sm font-medium">
                  {propertyTypeLabels[property.property_type as keyof typeof propertyTypeLabels]}
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Bed className="h-5 w-5 mb-1 text-primary" />
                <span className="text-sm font-medium">{totalRooms} Rooms</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Users className="h-5 w-5 mb-1 text-primary" />
                <span className="text-sm font-medium">{tenants.length} Tenants</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Wrench className="h-5 w-5 mb-1 text-primary" />
                <span className="text-sm font-medium">{activeMaintenanceRequests} Issues</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground mb-4">{property.description || "No description provided."}</p>

            {property.amenities && property.amenities.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.amenities.map((amenity: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-primary/10">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Rooms:</span>
              <span className="font-medium">{totalRooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Occupied:</span>
              <span className="font-medium">{occupiedRooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vacant:</span>
              <span className="font-medium">{vacantRooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Occupancy Rate:</span>
              <span className="font-medium">
                {totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Income:</span>
              <span className="font-medium">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">{formatDate(property.created_at)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href={`/dashboard/landlord/properties/${property.id}/rooms/add`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="rooms">
        <TabsList>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        <TabsContent value="rooms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Rooms</CardTitle>
              <CardDescription>Manage rooms in this property</CardDescription>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No rooms found for this property.</p>
                  <Button asChild>
                    <Link href={`/dashboard/landlord/properties/${property.id}/rooms/add`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Room
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room: any) => (
                    <div key={room.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{room.name}</h3>
                          <p className="text-sm text-muted-foreground">{room.room_type} room</p>
                        </div>
                        <Badge
                          variant={
                            room.status === "vacant"
                              ? "outline"
                              : room.status === "maintenance"
                                ? "destructive"
                                : "default"
                          }
                        >
                          {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Rent: </span>
                          <span className="font-medium">{formatCurrency(room.rent)}/month</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Deposit: </span>
                          <span className="font-medium">{formatCurrency(room.deposit)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Max Occupants: </span>
                          <span className="font-medium">{room.max_occupants}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/landlord/rooms/${room.id}`}>View</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/landlord/rooms/${room.id}/edit`}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tenants" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tenants</CardTitle>
              <CardDescription>Manage tenants in this property</CardDescription>
            </CardHeader>
            <CardContent>
              {tenants.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No tenants found for this property.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tenants.map((tenant: any) => (
                    <div key={tenant.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{tenant.user.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{tenant.user.email}</p>
                        </div>
                        <Badge variant={tenant.status === "active" ? "default" : "outline"}>
                          {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Room: </span>
                          <span className="font-medium">{tenant.room.name}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Rent: </span>
                          <span className="font-medium">{formatCurrency(tenant.rent_amount)}/month</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Start Date: </span>
                          <span className="font-medium">{formatDate(tenant.start_date)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">End Date: </span>
                          <span className="font-medium">
                            {tenant.end_date ? formatDate(tenant.end_date) : "Ongoing"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/landlord/tenants/${tenant.id}`}>View</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/messages?userId=${tenant.user.id}`}>Message</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="maintenance" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Maintenance Requests</CardTitle>
                  <CardDescription>Manage maintenance issues for this property</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/landlord/maintenance/new?propertyId=${property.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {maintenanceRequests.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No maintenance requests found for this property.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceRequests.map((request: any) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{request.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {request.room ? `Room: ${request.room.name}` : "Common Area"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "completed"
                              ? "outline"
                              : request.status === "in_progress"
                                ? "secondary"
                                : request.priority === "emergency"
                                  ? "destructive"
                                  : "default"
                          }
                        >
                          {request.status === "in_progress"
                            ? "In Progress"
                            : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2 line-clamp-2">{request.description}</p>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Priority: </span>
                          <span className="font-medium capitalize">{request.priority}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Reported: </span>
                          <span className="font-medium">{formatDate(request.reported_date)}</span>
                        </div>
                        {request.tenant && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Reported by: </span>
                            <span className="font-medium">{request.tenant.full_name}</span>
                          </div>
                        )}
                        {request.assigned_to && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Assigned to: </span>
                            <span className="font-medium">{request.assigned_to.full_name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/landlord/maintenance/${request.id}`}>View</Link>
                        </Button>
                        {request.status !== "completed" && request.status !== "cancelled" && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/landlord/maintenance/${request.id}/edit`}>
                              <Edit className="h-3 w-3 mr-1" />
                              Update
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
