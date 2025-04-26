import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building, Plus } from "lucide-react"
import { getProperties } from "./actions"
import { PropertyListSkeleton } from "@/components/skeletons/property-list-skeleton"
import { PropertyCard } from "@/components/property-card"

export default function PropertiesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
        <Link href="/dashboard/landlord/properties/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Button>
        </Link>
      </div>

      <Suspense fallback={<PropertyListSkeleton />}>
        <PropertyList />
      </Suspense>
    </div>
  )
}

async function PropertyList() {
  const properties = await getProperties()

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Building className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No properties yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your first property to start managing your rental business.
        </p>
        <Link href="/dashboard/landlord/properties/add" className="mt-4">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
