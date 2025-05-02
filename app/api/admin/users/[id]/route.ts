import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

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

    // Only admins can access this endpoint
    if (userProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", params.id)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Get user auth data
    const adminClient = createAdminSupabaseClient()
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(params.id)

    if (userError) {
      console.error("Error fetching user auth data:", userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    return NextResponse.json({ user: { ...profile, auth: userData.user } })
  } catch (error) {
    console.error("Error in admin user details API:", error)
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

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Only admins can access this endpoint
    if (userProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: body.fullName,
        role: body.role,
        phone: body.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (profileError) {
      console.error("Error updating user profile:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Update user metadata
    const adminClient = createAdminSupabaseClient()
    const { error: userError } = await adminClient.auth.admin.updateUserById(params.id, {
      user_metadata: {
        full_name: body.fullName,
        role: body.role,
      },
    })

    if (userError) {
      console.error("Error updating user metadata:", userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Update password if provided
    if (body.password) {
      const { error: passwordError } = await adminClient.auth.admin.updateUserById(params.id, {
        password: body.password,
      })

      if (passwordError) {
        console.error("Error updating user password:", passwordError)
        return NextResponse.json({ error: passwordError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in admin user update API:", error)
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

    // Get user role
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Only admins can access this endpoint
    if (userProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete user
    const adminClient = createAdminSupabaseClient()
    const { error: userError } = await adminClient.auth.admin.deleteUser(params.id)

    if (userError) {
      console.error("Error deleting user:", userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in admin user delete API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
