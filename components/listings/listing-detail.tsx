"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Home, Building, Hotel, MapPin, Users, Flag, Calendar, BedDouble, Bath } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Mock listing data (same as in ListingDirectory)
const MOCK_LISTINGS = [
  {
    id: "listing1",
    title: "Modern City Apartment",
    description:
      "A beautiful modern apartment in the heart of the city. This recently renovated property features high ceilings, large windows, and modern appliances. Located within walking distance to shops, restaurants, and public transportation.",
    type: "flat",
    is_shared: true,
    location: "Manchester",
    address: "123 City Centre, Manchester, M1 1AB",
    rooms: [
      {
        id: "room1",
        name: "Master Bedroom",
        type: "double",
        max_occupancy: 2,
        rent: 800,
        deposit: 1000,
        description: "Spacious master bedroom with en-suite bathroom and built-in wardrobe.",
        features: ["En-suite bathroom", "Built-in wardrobe", "Double bed", "Desk and chair"],
      },
      {
        id: "room2",
        name: "Single Room",
        type: "single",
        max_occupancy: 1,
        rent: 600,
        deposit: 750,
        description: "Cozy single room with plenty of natural light.",
        features: ["Single bed", "Wardrobe", "Desk and chair", "Window overlooking garden"],
      },
    ],
    amenities: [
      "Central heating",
      "Washing machine",
      "Dishwasher",
      "High-speed internet",
      "Shared kitchen",
      "Shared living room",
    ],
    bathrooms: 2,
    created_at: "2023-05-10T14:30:00Z",
    available_from: "2023-07-01",
    minimum_tenancy: 6,
    landlord_id: "landlord1",
    landlord_name: "John Smith",
    images: ["/cozy-city-apartment.png", "/cozy-eclectic-living-room.png", "/cozy-single-bedroom.png"],
  },
  // Other listings...
]

export function ListingDetail() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [listing, setListing] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [flagReason, setFlagReason] = useState("")
  const [isFlagging, setIsFlagging] = useState(false)
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const foundListing = MOCK_LISTINGS.find((l) => l.id === params.id)
        if (!foundListing) {
          toast({
            title: "Listing not found",
            description: "The listing you're looking for doesn't exist or has been removed.",
            variant: "destructive",
          })
          router.push("/listings")
          return
        }

        setListing(foundListing)
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

    if (params.id) {
      fetchListing()
    }
  }, [params.id, router, toast])

  const handleApply = (roomId: string) => {
    router.push(`/apply/${params.id}?roomId=${roomId}`)
  }

  const handleFlagContent = async () => {
    if (!flagReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for flagging this content.",
        variant: "destructive",
      })
      return
    }

    setIsFlagging(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Content flagged",
        description: "Thank you for your feedback. Our team will review this listing.",
      })

      setFlagDialogOpen(false)
      setFlagReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to flag content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsFlagging(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!listing) return null

  const PropertyIcon = listing.type === "flat" ? Building : listing.type === "house" ? Home : Hotel

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <div className="flex items-center mt-2 text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{listing.address}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4 mr-2" /> Flag Listing
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Flag Inappropriate Content</DialogTitle>
                <DialogDescription>
                  Please provide a reason for flagging this listing. Our team will review your report.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea
                  placeholder="Reason for flagging..."
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFlagDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleFlagContent} disabled={isFlagging}>
                  {isFlagging && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-[400px]">
              <img
                src={listing.images[0] || "/placeholder.svg"}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 flex gap-2">
                {listing.images.slice(1).map((image: string, index: number) => (
                  <div key={index} className="h-16 w-16 rounded-md overflow-hidden border-2 border-white">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${listing.title} ${index + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Property Details</h2>
              <p className="mb-4">{listing.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center">
                  <PropertyIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Property Type</p>
                    <p className="font-medium capitalize">{listing.type}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Accommodation</p>
                    <p className="font-medium">{listing.is_shared ? "Shared" : "Entire property"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <BedDouble className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">{listing.rooms.length}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Bath className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">{listing.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Available From</p>
                    <p className="font-medium">{new Date(listing.available_from).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Minimum Tenancy</p>
                    <p className="font-medium">{listing.minimum_tenancy} months</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rooms" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Available Rooms</h2>
              <div className="space-y-6">
                {listing.rooms.map((room: any) => (
                  <Card key={room.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>{room.name}</CardTitle>
                      <CardDescription>{room.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Room Type</p>
                          <p className="font-medium capitalize">{room.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Max Occupancy</p>
                          <p className="font-medium">
                            {room.max_occupancy} {room.max_occupancy === 1 ? "person" : "people"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Rent</p>
                          <p className="font-medium">£{room.rent}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Deposit</p>
                          <p className="font-medium">£{room.deposit}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Features:</p>
                        <ul className="grid grid-cols-2 gap-2">
                          {room.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-center text-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {user?.role === "tenant" && (
                        <Button className="w-full" onClick={() => handleApply(room.id)}>
                          Apply for this Room
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="amenities" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-2">
                {listing.amenities.map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center p-2 rounded-md bg-muted">
                    <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
                    {amenity}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="text-2xl font-bold">
                  £
                  {listing.rooms.reduce(
                    (min: number, room: any) => (room.rent < min ? room.rent : min),
                    listing.rooms[0].rent,
                  )}{" "}
                  - £
                  {listing.rooms.reduce(
                    (max: number, room: any) => (room.rent > max ? room.rent : max),
                    listing.rooms[0].rent,
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deposit</p>
                <p className="text-xl font-semibold">
                  £
                  {listing.rooms.reduce(
                    (min: number, room: any) => (room.deposit < min ? room.deposit : min),
                    listing.rooms[0].deposit,
                  )}{" "}
                  - £
                  {listing.rooms.reduce(
                    (max: number, room: any) => (room.deposit > max ? room.deposit : max),
                    listing.rooms[0].deposit,
                  )}
                </p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">Available From</p>
                <p className="font-medium">{new Date(listing.available_from).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Minimum Tenancy</p>
                <p className="font-medium">{listing.minimum_tenancy} months</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Landlord Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{listing.landlord_name}</p>
                  <p className="text-sm text-muted-foreground">Property Owner</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Contact Landlord
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-[200px] rounded-md flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Map view</span>
              </div>
              <p className="text-sm">{listing.address}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
