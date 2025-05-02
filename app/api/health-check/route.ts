import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Check Supabase connection
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from("profiles").select("id").limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          database: "unavailable",
          message: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "ok",
      database: "available",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Internal server error",
      },
      { status: 500 },
    )
  }
}
