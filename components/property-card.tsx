import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Home, MapPin } from "lucide-react"
import { UserRating } from "@/components/reviews/user-rating"

interface PropertyCardProps {
  property: any
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { id, name, address, city, property_type, bedrooms, bathrooms, monthly_rent, is_available, images } = property

  // Get the first image or use a placeholder
  const imageUrl = images && images.length > 0 ? images[0] : `/placeholder.svg?height=300&width=500&query=property`

  return (
    <Link href={`/dashboard/landlord/properties/${id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
          />
          {!is_available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Badge variant="destructive" className="text-lg font-semibold px-3 py-1.5">
                Rented
              </Badge>
            </div>
          )}
        </div>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{name}</CardTitle>
            {is_available && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Available
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 pb-2">
          <div className="flex items-center text-muted-foreground mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm truncate">{address}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-1" />
              <span className="capitalize">{property_type}</span>
            </div>
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{bathrooms}</span>
            </div>
          </div>
          <div className="mt-2">
            <UserRating userId={property.landlord_id} size="sm" />
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-2 border-t">
          <div className="text-lg font-bold">£{monthly_rent}/month</div>
        </CardFooter>
      </Card>
    </Link>
  )
}
