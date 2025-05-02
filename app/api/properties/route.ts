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

    let query = supabase.from("properties").select(`
      *,
      property_images(*)
    `)

    // Filter properties based on user role
    if (userProfile?.role === "landlord") {
      query = query.eq("landlord_id", session.user.id)
    } else if (userProfile?.role !== "admin") {
      // Only landlords and admins can view all properties
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching properties:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ properties: data })
  } catch (error) {
    console.error("Error in properties API:", error)
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

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Only landlords and admins can create properties
    if (userProfile?.role !== "landlord" && userProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "address", "city", "postcode", "property_type"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create property
    const { data, error } = await supabase
      .from("properties")
      .insert({
        landlord_id: session.user.id,
        name: body.name,
        address: body.address,
        city: body.city,
        postcode: body.postcode,
        property_type: body.property_type,
        description: body.description || null,
        amenities: body.amenities || null,
        monthly_income: body.monthly_income || null,
        status: body.status || "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating property:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ property: data })
  } catch (error) {
    console.error("Error in properties API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
