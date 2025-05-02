import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get property with images and rooms
    const { data: property, error } = await supabase
      .from("properties")
      .select(`
        *,
        property_images(*),
        rooms(*)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching property:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check if user has access to this property
    if (
      userProfile?.role !== "admin" &&
      userProfile?.role !== "maintenance" &&
      property.landlord_id !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error("Error in property details API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get property to check ownership
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("landlord_id")
      .eq("id", params.id)
      .single()

    if (propertyError) {
      console.error("Error fetching property:", propertyError)
      return NextResponse.json({ error: propertyError.message }, { status: 500 })
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has permission to update this property
    if (userProfile?.role !== "admin" && property.landlord_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Update property
    const { data, error } = await supabase
      .from("properties")
      .update({
        name: body.name,
        address: body.address,
        city: body.city,
        postcode: body.postcode,
        property_type: body.property_type,
        description: body.description,
        amenities: body.amenities,
        monthly_income: body.monthly_income,
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating property:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ property: data })
  } catch (error) {
    console.error("Error in property update API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get property to check ownership
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("landlord_id")
      .eq("id", params.id)
      .single()

    if (propertyError) {
      console.error("Error fetching property:", propertyError)
      return NextResponse.json({ error: propertyError.message }, { status: 500 })
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has permission to delete this property
    if (userProfile?.role !== "admin" && property.landlord_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete property (this will cascade delete related rooms and images)
    const { error } = await supabase.from("properties").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting property:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in property delete API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
