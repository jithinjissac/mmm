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

    // Fetch properties
    const { data: properties, error } = await supabase
      .from("properties")
      .select("id, name, address, city, postcode, property_type, status, monthly_income, created_at")
      .eq("landlord_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching properties:", error)
      return NextResponse.json({ error: `Error fetching properties: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ properties: properties || [] })
  } catch (error: any) {
    console.error("Error in properties API:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch properties" }, { status: 500 })
  }
}
