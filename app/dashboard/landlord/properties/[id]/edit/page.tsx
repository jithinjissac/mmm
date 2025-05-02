import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { PropertyForm } from "@/components/properties/property-form"
import { Skeleton } from "@/components/ui/skeleton"

async function getProperty(propertyId: string) {
  const supabase = createServerSupabaseClient()

  // Get the current user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const userId = session.user.id

  try {
    const { data: property, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .eq("landlord_id", userId)
      .single()

    if (error) throw error
    return property
  } catch (error) {
    console.error("Error fetching property:", error)
    return null
  }
}

async function EditPropertyContent({ propertyId }: { propertyId: string }) {
  const property = await getProperty(propertyId)

  if (!property) {
    notFound()
  }

  return <PropertyForm property={property} propertyId={propertyId} />
}

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Property</h1>
        <p className="text-muted-foreground">Update your property details and settings.</p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        }
      >
        <EditPropertyContent propertyId={params.id} />
      </Suspense>
    </div>
  )
}
