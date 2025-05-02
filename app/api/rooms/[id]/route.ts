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

    // Get room with images
    const { data: room, error } = await supabase
      .from("rooms")
      .select(`
        *,
        room_images(*),
        properties(landlord_id)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching room:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has access to this room
    if (
      userProfile?.role !== "admin" &&
      userProfile?.role !== "maintenance" &&
      room.properties.landlord_id !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ room })
  } catch (error) {
    console.error("Error in room details API:", error)
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

    // Get room to check ownership
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select(`
        property_id,
        properties(landlord_id)
      `)
      .eq("id", params.id)
      .single()

    if (roomError) {
      console.error("Error fetching room:", roomError)
      return NextResponse.json({ error: roomError.message }, { status: 500 })
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has permission to update this room
    if (userProfile?.role !== "admin" && room.properties.landlord_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Update room
    const { data, error } = await supabase
      .from("rooms")
      .update({
        name: body.name,
        room_type: body.room_type,
        max_occupants: body.max_occupants,
        rent: body.rent,
        deposit: body.deposit,
        status: body.status,
        description: body.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating room:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ room: data })
  } catch (error) {
    console.error("Error in room update API:", error)
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

    // Get room to check ownership
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select(`
        property_id,
        properties(landlord_id)
      `)
      .eq("id", params.id)
      .single()

    if (roomError) {
      console.error("Error fetching room:", roomError)
      return NextResponse.json({ error: roomError.message }, { status: 500 })
    }

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Check if user has permission to delete this room
    if (userProfile?.role !== "admin" && room.properties.landlord_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete room (this will cascade delete related images)
    const { error } = await supabase.from("rooms").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting room:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in room delete API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
