import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Get property ID from query params
    const propertyId = request.nextUrl.searchParams.get("propertyId")

    let query = supabase.from("rooms").select(`
      *,
      room_images(*)
    `)

    // Filter by property if provided
    if (propertyId) {
      query = query.eq("property_id", propertyId)
    }

    // If user is a landlord, only show rooms for their properties
    if (userProfile?.role === "landlord") {
      // First get the landlord's properties
      const { data: properties } = await supabase.from("properties").select("id").eq("landlord_id", session.user.id)

      if (properties && properties.length > 0) {
        const propertyIds = properties.map((p) => p.id)
        query = query.in("property_id", propertyIds)
      } else {
        // Landlord has no properties, return empty array
        return NextResponse.json({ rooms: [] })
      }
    } else if (userProfile?.role !== "admin" && userProfile?.role !== "maintenance") {
      // Only landlords, admins, and maintenance staff can view rooms
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching rooms:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rooms: data })
  } catch (error) {
    console.error("Error in rooms API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = ["property_id", "name", "room_type", "rent", "deposit"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Check if user owns the property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("landlord_id")
      .eq("id", body.property_id)
      .single()

    if (propertyError) {
      console.error("Error fetching property:", propertyError)
      return NextResponse.json({ error: propertyError.message }, { status: 500 })
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has permission to add a room to this property
    if (userProfile?.role !== "admin" && property.landlord_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create room
    const { data, error } = await supabase
      .from("rooms")
      .insert({
        property_id: body.property_id,
        name: body.name,
        room_type: body.room_type,
        max_occupants: body.max_occupants || 1,
        rent: body.rent,
        deposit: body.deposit,
        status: body.status || "vacant",
        description: body.description || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating room:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ room: data })
  } catch (error) {
    console.error("Error in rooms API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
