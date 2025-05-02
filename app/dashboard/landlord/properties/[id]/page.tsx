import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { PropertyDetailsView } from "@/components/properties/property-details-view"
import { Skeleton } from "@/components/ui/skeleton"

async function getPropertyDetails(propertyId: string) {
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
    // Get property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select(`
        *,
        property_images(*)
      `)
      .eq("id", propertyId)
      .eq("landlord_id", userId)
      .single()

    if (propertyError) throw propertyError
    if (!property) return null

    // Get rooms
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select(`
        *,
        room_images(*)
      `)
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false })

    if (roomsError) throw roomsError

    // Get tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from("tenants")
      .select(`
        *,
        user:user_id(*),
        room:room_id(*)
      `)
      .eq("room.property_id", propertyId)
      .order("created_at", { ascending: false })

    if (tenantsError) throw tenantsError

    // Get maintenance requests
    const { data: maintenanceRequests, error: maintenanceError } = await supabase
      .from("maintenance_requests")
      .select(`
        *,
        tenant:tenant_id(*),
        room:room_id(*),
        assigned_to(*)
      `)
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false })

    if (maintenanceError) throw maintenanceError

    return {
      property,
      rooms: rooms || [],
      tenants: tenants || [],
      maintenanceRequests: maintenanceRequests || [],
    }
  } catch (error) {
    console.error("Error fetching property details:", error)
    return null
  }
}

async function PropertyDetailsContent({ propertyId }: { propertyId: string }) {
  const data = await getPropertyDetails(propertyId)

  if (!data) {
    notFound()
  }

  return (
    <PropertyDetailsView
      property={data.property}
      rooms={data.rooms}
      tenants={data.tenants}
      maintenanceRequests={data.maintenanceRequests}
    />
  )
}

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-96 mt-2" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>

          <div>
            <Skeleton className="h-10 w-64 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </div>
        </div>
      }
    >
      <PropertyDetailsContent propertyId={params.id} />
    </Suspense>
  )
}
