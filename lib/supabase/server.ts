import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// For admin operations that require service role
export function createServerAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase admin configuration is incomplete")
  }

  // Create the admin client with service role key
  const adminClient = createServerComponentClient<Database>({
    cookies,
    options: {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      },
    },
  })

  return adminClient
}
