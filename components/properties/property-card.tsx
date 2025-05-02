import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Home, MapPin, ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format-helpers"

interface PropertyCardProps {
  property: any
}

export function PropertyCard({ property }: PropertyCardProps) {
  // Get primary image or placeholder
  const primaryImage = property.property_images?.find((img: any) => img.is_primary)?.url || "/suburban-house-exterior.png"

  const propertyTypeLabels: Record<string, string> = {
    apartment: "Apartment",
    apartment_building: "Apartment Building",
    house: "House",
    studio: "Studio",
    shared_house: "Shared House",
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video">
        <Image src={primaryImage || "/placeholder.svg"} alt={property.name} fill className="object-cover" />
        <Badge className="absolute top-2 right-2" variant={property.status === "available" ? "default" : "secondary"}>
          {property.status === "available" ? "Available" : "Rented"}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{property.name}</h3>
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span>
            {property.address}, {property.city}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm">
            <Home className="h-4 w-4 mr-1 text-primary" />
            <span>{propertyTypeLabels[property.property_type] || property.property_type}</span>
          </div>
          <div className="font-medium">{formatCurrency(property.monthly_income || 0)}/month</div>
        </div>

        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {property.amenities.slice(0, 3).map((amenity: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs bg-primary/10">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{property.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/dashboard/landlord/properties/${property.id}`}>
            View Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
