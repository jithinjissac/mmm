import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, MapPin, Home, Bed } from "lucide-react"
import type { Database } from "@/lib/database.types"

type Property = Database["public"]["Tables"]["properties"]["Row"] & {
  property_images?: Database["public"]["Tables"]["property_images"]["Row"][]
  rooms?: Database["public"]["Tables"]["rooms"]["Row"][]
}

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  // Calculate occupancy
  const totalRooms = property.rooms?.length || 0
  const occupiedRooms = property.rooms?.filter((room) => room.status === "occupied").length || 0

  // Calculate monthly income
  const monthlyIncome =
    property.rooms?.reduce((total, room) => {
      return room.status === "occupied" ? total + (Number.parseFloat(room.rent.toString()) || 0) : total
    }, 0) || 0

  return (
    <Link href={`/dashboard/landlord/properties/${property.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        <div className="h-48 w-full overflow-hidden">
          {property.property_images && property.property_images.length > 0 ? (
            <img
              src={
                property.property_images.find((img) => img.is_primary)?.url ||
                property.property_images[0].url ||
                "/placeholder.svg?height=400&width=600&query=property" ||
                "/placeholder.svg"
              }
              alt={property.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Building className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="text-xl font-bold">{property.name}</h3>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {property.address}, {property.city}, {property.postcode}
          </p>
          <div className="grid grid-cols-2 gap-2 my-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {property.property_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{totalRooms} Rooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {occupiedRooms}/{totalRooms} Occupied
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">£{monthlyIncome}/month</span>
            </div>
          </div>

          {property.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{property.description}</p>
          )}

          {property.amenities && property.amenities.length > 0 && (
            <div className="mt-auto">
              <h4 className="text-sm font-medium mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {property.amenities.slice(0, 4).map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {property.amenities.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{property.amenities.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
