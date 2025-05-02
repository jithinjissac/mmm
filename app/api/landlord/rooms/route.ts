import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export async function GET() {
  try {
    // Use the route handler client which is designed for API routes
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get the current user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch rooms
    const { data: rooms, error } = await supabase
      .from("rooms")
      .select(
        "id, name, room_type, rent, deposit, status, created_at, properties!inner(id, name, address, city, landlord_id)",
      )
      .eq("properties.landlord_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching rooms:", error)
      return NextResponse.json({ error: `Error fetching rooms: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ rooms: rooms || [] })
  } catch (error: any) {
    console.error("Error in rooms API:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch rooms" }, { status: 500 })
  }
}
