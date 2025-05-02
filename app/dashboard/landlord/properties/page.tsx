import { Suspense } from "react"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PropertyListSkeleton } from "@/components/skeletons/property-list-skeleton"
import { PropertyCard } from "@/components/properties/property-card"

async function getProperties() {
  const supabase = createServerSupabaseClient()

  // Get the current user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return []
  }

  const userId = session.user.id

  try {
    const { data: properties, error } = await supabase
      .from("properties")
      .select(`
        *,
        property_images(*)
      `)
      .eq("landlord_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return properties || []
  } catch (error) {
    console.error("Error fetching properties:", error)
    return []
  }
}

async function PropertiesContent() {
  const properties = await getProperties()

  return (
    <>
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No properties found</h3>
          <p className="text-muted-foreground mb-6">
            You haven't added any properties yet. Get started by adding your first property.
          </p>
          <Button asChild>
            <Link href="/dashboard/landlord/properties/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </>
  )
}

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">Manage your rental properties and rooms.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/landlord/properties/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Link>
        </Button>
      </div>

      <Suspense fallback={<PropertyListSkeleton />}>
        <PropertiesContent />
      </Suspense>
    </div>
  )
}
