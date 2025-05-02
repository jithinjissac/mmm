import { NextResponse } from "next/server"
import { checkSupabaseHealth } from "@/lib/supabase"

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "missing",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "missing",
    }

    // Check Supabase connection
    const supabaseHealth = await checkSupabaseHealth()

    // Check network connectivity
    let networkCheck
    try {
      const response = await fetch("https://www.google.com")
      networkCheck = {
        status: response.ok ? "ok" : "error",
        statusCode: response.status,
        statusText: response.statusText,
      }
    } catch (error) {
      networkCheck = {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown network error",
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      supabase: supabaseHealth,
      network: networkCheck,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
