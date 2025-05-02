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

    // Get maintenance request with related data
    const { data: maintenanceRequest, error } = await supabase
      .from("maintenance_requests")
      .select(`
        *,
        properties(name, address, landlord_id),
        rooms(name),
        assigned_to(full_name),
        tenant:tenant_id(full_name, email)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching maintenance request:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has access to this maintenance request
    if (
      userProfile?.role !== "admin" &&
      maintenanceRequest.tenant_id !== session.user.id &&
      maintenanceRequest.assigned_to_id !== session.user.id &&
      maintenanceRequest.properties.landlord_id !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ maintenance_request: maintenanceRequest })
  } catch (error) {
    console.error("Error in maintenance request details API:", error)
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

    // Get maintenance request to check access
    const { data: maintenanceRequest, error: requestError } = await supabase
      .from("maintenance_requests")
      .select(`
        tenant_id,
        assigned_to_id,
        properties(landlord_id)
      `)
      .eq("id", params.id)
      .single()

    if (requestError) {
      console.error("Error fetching maintenance request:", requestError)
      return NextResponse.json({ error: requestError.message }, { status: 500 })
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has permission to update this maintenance request
    const isAdmin = userProfile?.role === "admin"
    const isLandlord = maintenanceRequest.properties.landlord_id === session.user.id
    const isMaintenance = maintenanceRequest.assigned_to_id === session.user.id
    const isTenant = maintenanceRequest.tenant_id === session.user.id

    if (!isAdmin && !isLandlord && !isMaintenance && !isTenant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Different roles can update different fields
    let updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (isAdmin || isLandlord) {
      // Admins and landlords can update all fields
      updateData = {
        ...updateData,
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: body.status,
        assigned_to_id: body.assigned_to_id,
        scheduled_date: body.scheduled_date,
        notes: body.notes,
      }
    } else if (isMaintenance) {
      // Maintenance staff can update status, notes, and completion details
      updateData = {
        ...updateData,
        status: body.status,
        notes: body.notes,
        completed_date: body.completed_date,
        resolution: body.resolution,
      }
    } else if (isTenant) {
      // Tenants can only update description and cancel their own requests
      updateData = {
        ...updateData,
        description: body.description,
        status: body.status === "cancelled" ? "cancelled" : undefined,
      }
    }

    // Remove undefined values
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key])

    // Update maintenance request
    const { data, error } = await supabase
      .from("maintenance_requests")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating maintenance request:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ maintenance_request: data })
  } catch (error) {
    console.error("Error in maintenance request update API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
