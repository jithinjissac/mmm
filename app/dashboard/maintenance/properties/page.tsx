"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building, Home, Search, MapPin, Wrench } from "lucide-react"
import { MockDataService, simulateApiDelay } from "@/lib/mock-data-service"
import { useAuth } from "@/components/mock-auth-provider"

export default function MaintenancePropertiesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [properties, setProperties] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true)
      try {
        // Simulate API delay
        await simulateApiDelay(800)

        // Load properties
        const { data } = await MockDataService.getProperties()
        setProperties(data || [])
      } catch (error) {
        console.error("Error loading properties:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [])

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
        <p className="text-muted-foreground">View and manage properties under maintenance management.</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search properties..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No properties found</p>
            <p className="text-muted-foreground">Try adjusting your search query.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}

function PropertyCard({ property }: { property: any }) {
  // Mock maintenance data for each property
  const maintenanceStats = {
    pending: Math.floor(Math.random() * 3),
    inProgress: Math.floor(Math.random() * 2),
    completed: Math.floor(Math.random() * 5) + 1,
  }

  const PropertyIcon = property.property_type === "house" ? Home : Building

  return (
    <Card className="overflow-hidden">
      <div className="relative h-40">
        <img
          src={property.image_url || "/suburban-house-exterior.png"}
          alt={property.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{property.name}</CardTitle>
          <Badge variant="outline" className="capitalize">
            {property.property_type}
          </Badge>
        </div>
        <CardDescription className="flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          {property.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted p-2 rounded-md">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="font-medium">{maintenanceStats.pending}</p>
          </div>
          <div className="bg-muted p-2 rounded-md">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="font-medium">{maintenanceStats.inProgress}</p>
          </div>
          <div className="bg-muted p-2 rounded-md">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="font-medium">{maintenanceStats.completed}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/dashboard/maintenance/properties/${property.id}`}>
            <Wrench className="h-4 w-4 mr-2" />
            View Maintenance
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
