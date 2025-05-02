import { DashboardSelector } from "@/components/dashboard-selector"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  // Get the server-side Supabase client
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // If not authenticated, redirect to sign in
    redirect("/signin")
  }

  // Get user profile to determine role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  // If user has a role, redirect to appropriate dashboard
  if (profile?.role) {
    switch (profile.role) {
      case "admin":
        redirect("/dashboard/admin")
      case "landlord":
        redirect("/dashboard/landlord")
      case "tenant":
        redirect("/dashboard/tenant")
      case "maintenance":
        redirect("/dashboard/maintenance/dashboard")
    }
  }

  // If no role is found, show dashboard selector
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <DashboardSelector />
    </div>
  )
}
