"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Loader2, Home, Building, Hotel, MapPin, PoundSterling, Users } from "lucide-react"
import { useAuth } from "@/components/mock-auth-provider"
import { useToast } from "@/components/ui/use-toast"

// Mock listing data
const MOCK_LISTINGS = [
  {
    id: "listing1",
    title: "Modern City Apartment",
    description: "A beautiful modern apartment in the heart of the city",
    type: "flat",
    is_shared: true,
    location: "Manchester",
    rooms: [
      {
        id: "room1",
        name: "Master Bedroom",
        type: "double",
        max_occupancy: 2,
        rent: 800,
        deposit: 1000,
      },
      {
        id: "room2",
        name: "Single Room",
        type: "single",
        max_occupancy: 1,
        rent: 600,
        deposit: 750,
      },
    ],
    created_at: "2023-05-10T14:30:00Z",
    landlord_id: "landlord1",
    image: "/cozy-city-apartment.png",
  },
  {
    id: "listing2",
    title: "Spacious Family House",
    description: "A large family house with garden in a quiet neighborhood",
    type: "house",
    is_shared: false,
    location: "Birmingham",
    rooms: [
      {
        id: "room3",
        name: "Entire House",
        type: "house",
        max_occupancy: 4,
        rent: 1500,
        deposit: 2000,
      },
    ],
    created_at: "2023-05-15T10:15:00Z",
    landlord_id: "landlord2",
    image: "/suburban-house-exterior.png",
  },
  {
    id: "listing3",
    title: "Cozy Studio Apartment",
    description: "A compact studio apartment perfect for students or young professionals",
    type: "studio",
    is_shared: false,
    location: "London",
    rooms: [
      {
        id: "room4",
        name: "Studio",
        type: "studio",
        max_occupancy: 1,
        rent: 950,
        deposit: 1200,
      },
    ],
    created_at: "2023-05-20T09:45:00Z",
    landlord_id: "landlord1",
    image: "/cozy-city-studio.png",
  },
]

// Mock tenant preferences
const MOCK_TENANT_PREFERENCES = {
  type: "flat",
  is_shared: true,
  max_rent: 800,
  location: "Manchester",
}

export function ListingDirectory() {
  const [listings, setListings] = useState<any[]>([])
  const [filteredListings, setFilteredListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: "",
    maxRent: 2000,
    location: "",
    isShared: "",
  })

  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()

  // Initialize filters from URL params
  useEffect(() => {
    const type = searchParams.get("type") || ""
    const maxRent = searchParams.get("maxRent") ? Number.parseInt(searchParams.get("maxRent")!) : 2000
    const location = searchParams.get("location") || ""
    const isShared = searchParams.get("isShared") || ""

    setFilters({
      type,
      maxRent,
      location,
      isShared,
    })
  }, [searchParams])

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        // In a real app, this would be an API call with filters
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setListings(MOCK_LISTINGS)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load listings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchListings()
  }, [toast])

  // Fetch tenant preferences if user is a tenant
  const [preferences, setPreferences] = useState<any>(null)
  useEffect(() => {
    const fetchPreferences = async () => {
      if (user?.role === "tenant") {
        try {
          // In a real app, this would be an API call
          await new Promise((resolve) => setTimeout(resolve, 500))
          setPreferences(MOCK_TENANT_PREFERENCES)
        } catch (error) {
          console.error("Failed to load preferences:", error)
        }
      }
    }

    fetchPreferences()
  }, [user])

  // Apply filters
  useEffect(() => {
    let result = [...listings]

    if (filters.type) {
      result = result.filter((listing) => listing.type === filters.type)
    }

    if (filters.location) {
      result = result.filter((listing) => listing.location.toLowerCase().includes(filters.location.toLowerCase()))
    }

    if (filters.isShared !== "") {
      const isSharedBool = filters.isShared === "true"
      result = result.filter((listing) => listing.is_shared === isSharedBool)
    }

    // Filter by max rent (find the cheapest room in each listing)
    result = result.filter((listing) => {
      const cheapestRoom = listing.rooms.reduce(
        (min: any, room: any) => (room.rent < min.rent ? room : min),
        listing.rooms[0],
      )
      return cheapestRoom.rent <= filters.maxRent
    })

    setFilteredListings(result)
  }, [listings, filters])

  // Check if a listing is recommended based on tenant preferences
  const isRecommended = (listing: any) => {
    if (!preferences) return false

    const matchesType = !preferences.type || listing.type === preferences.type
    const matchesShared = preferences.is_shared === undefined || listing.is_shared === preferences.is_shared
    const matchesLocation = !preferences.location || listing.location === preferences.location

    // Check if any room matches the max rent preference
    const matchesRent = listing.rooms.some((room: any) => room.rent <= preferences.max_rent)

    return matchesType && matchesShared && matchesLocation && matchesRent
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      type: "",
      maxRent: 2000,
      location: "",
      isShared: "",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Filter Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Property Type</label>
            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input
              placeholder="Enter location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Shared Property</label>
            <Select value={filters.isShared} onValueChange={(value) => setFilters({ ...filters, isShared: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="true">Shared Only</SelectItem>
                <SelectItem value="false">Non-Shared Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Max Rent</label>
              <span className="text-sm">£{filters.maxRent}</span>
            </div>
            <Slider
              value={[filters.maxRent]}
              min={300}
              max={2000}
              step={50}
              onValueChange={(value) => setFilters({ ...filters, maxRent: value[0] })}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={resetFilters} className="mr-2">
            Reset Filters
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Available Properties</h2>
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No properties found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={listing.image || "/placeholder.svg"}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {isRecommended(listing) && <Badge className="absolute top-2 right-2 bg-green-500">Recommended</Badge>}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{listing.title}</CardTitle>
                    {listing.type === "flat" ? (
                      <Building className="h-5 w-5 text-muted-foreground" />
                    ) : listing.type === "house" ? (
                      <Home className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Hotel className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription>{listing.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <PoundSterling className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>
                      From £
                      {listing.rooms.reduce(
                        (min: number, room: any) => (room.rent < min ? room.rent : min),
                        listing.rooms[0].rent,
                      )}
                      /month
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{listing.is_shared ? "Shared accommodation" : "Entire property"}</span>
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline" className="mr-2">
                      {listing.type}
                    </Badge>
                    <Badge variant="outline">
                      {listing.rooms.length} room{listing.rooms.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/listings/${listing.id}`} className="w-full">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
