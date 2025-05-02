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

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    let query = supabase.from("maintenance_requests").select(`
      *,
      properties(name, address, landlord_id),
      rooms(name),
      assigned_to(full_name)
    `)

    // Filter based on user role
    if (userProfile.role === "tenant") {
      // Tenants can only see their own requests
      query = query.eq("tenant_id", session.user.id)
    } else if (userProfile.role === "landlord") {
      // Landlords can see requests for their properties
      query = query.eq("properties.landlord_id", session.user.id)
    } else if (userProfile.role === "maintenance") {
      // Maintenance staff can see requests assigned to them
      query = query.eq("assigned_to_id", session.user.id)
    }
    // Admins can see all requests

    const { data, error } = await query

    if (error) {
      console.error("Error fetching maintenance requests:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ maintenance_requests: data })
  } catch (error) {
    console.error("Error in maintenance requests API:", error)
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
    const requiredFields = ["property_id", "title", "description", "priority"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Create maintenance request
    const { data, error } = await supabase
      .from("maintenance_requests")
      .insert({
        property_id: body.property_id,
        room_id: body.room_id || null,
        tenant_id: session.user.id,
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: "new",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating maintenance request:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ maintenance_request: data })
  } catch (error) {
    console.error("Error in maintenance requests API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
