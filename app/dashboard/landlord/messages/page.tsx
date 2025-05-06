import { Suspense } from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import LandlordMessagesClientPage from "./LandlordMessagesClientPage"

export default async function LandlordMessagesPage() {
  const supabase = createServerComponentClient({ cookies })

  // Fetch conversations from Supabase
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      id,
      created_at,
      updated_at,
      last_message,
      last_message_time,
      participants:conversation_participants(
        user_id,
        users(id, first_name, last_name, avatar_url)
      )
    `)
    .order("last_message_time", { ascending: false })

  if (error) {
    console.error("Error fetching conversations:", error)
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <Suspense fallback={<div>Loading messages...</div>}>
      <LandlordMessagesClientPage conversations={conversations || []} currentUserId={user?.id || ""} />
    </Suspense>
  )
}
