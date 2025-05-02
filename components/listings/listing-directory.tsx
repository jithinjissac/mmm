"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, MapPin } from "lucide-react"
import { PropertyCard } from "@/components/property-card"

// Mock data for listings
const mockListings = [
  {
    id: "1",
    title: "Cozy Downtown Apartment",
    description: "A beautiful apartment in the heart of the city",
    price: 1200,
    bedrooms: 2,
    bathrooms: 1,
    location: "Downtown",
    imageUrl: "/cozy-city-apartment.png",
    available: true,
  },
  {
    id: "2",
    title: "Spacious Suburban House",
    description: "Perfect family home with a large backyard",
    price: 2500,
    bedrooms: 4,
    bathrooms: 2.5,
    location: "Suburbs",
    imageUrl: "/suburban-house-exterior.png",
    available: true,
  },
  {
    id: "3",
    title: "Modern Studio Apartment",
    description: "Newly renovated studio with all amenities",
    price: 950,
    bedrooms: 0,
    bathrooms: 1,
    location: "Midtown",
    imageUrl: "/cozy-city-studio.png",
    available: true,
  },
  {
    id: "4",
    title: "Rustic Cabin Retreat",
    description: "Escape to nature in this beautiful cabin",
    price: 1800,
    bedrooms: 3,
    bathrooms: 2,
    location: "Countryside",
    imageUrl: "/cozy-cabin-retreat.png",
    available: false,
  },
]

function ListingDirectoryContent() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState(mockListings)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Get initial search term from URL if present
  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setSearchTerm(query)
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchParams])

  // Filter listings based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = mockListings.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setListings(filtered)
    } else {
      setListings(mockListings)
    }
  }, [searchTerm])

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by location, property type, or keywords"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={16} />
          <span>Filters</span>
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <MapPin size={16} />
          <span>Map View</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">Showing {listings.length} properties</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <PropertyCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                description={listing.description}
                price={listing.price}
                bedrooms={listing.bedrooms}
                bathrooms={listing.bathrooms}
                location={listing.location}
                imageUrl={listing.imageUrl}
                available={listing.available}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function ListingDirectory() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingDirectoryContent />
    </Suspense>
  )
}
