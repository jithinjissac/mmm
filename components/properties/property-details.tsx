import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PropertyImageGallery } from "@/components/properties/property-image-gallery"
import { Bed, Bath, Home, Calendar, PoundSterlingIcon as Pound } from "lucide-react"

interface PropertyDetailsProps {
  property: any
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const {
    name,
    address,
    city,
    postal_code,
    property_type,
    bedrooms,
    bathrooms,
    description,
    monthly_rent,
    deposit_amount,
    available_from,
    is_available,
    features,
    images,
  } = property

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <PropertyImageGallery images={images} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Address</h3>
              <p className="text-muted-foreground">{address}</p>
              <p className="text-muted-foreground">
                {city}, {postal_code}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Property Type</h3>
                <div className="flex items-center mt-1">
                  <Home className="h-4 w-4 mr-2" />
                  <span className="capitalize">{property_type}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Availability</h3>
                <div className="mt-1">
                  {is_available ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Rented
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Bedrooms</h3>
                <div className="flex items-center mt-1">
                  <Bed className="h-4 w-4 mr-2" />
                  <span>{bedrooms}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Bathrooms</h3>
                <div className="flex items-center mt-1">
                  <Bath className="h-4 w-4 mr-2" />
                  <span>{bathrooms}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Monthly Rent</h3>
                <div className="flex items-center mt-1">
                  <Pound className="h-4 w-4 mr-2" />
                  <span>£{monthly_rent}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Deposit</h3>
                <div className="flex items-center mt-1">
                  <Pound className="h-4 w-4 mr-2" />
                  <span>£{deposit_amount}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Available From</h3>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(available_from)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Features</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {features &&
                  features.map((feature: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
