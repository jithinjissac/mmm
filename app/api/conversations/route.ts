import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get conversations where the user is a participant
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        *,
        user1:user1_id(id, full_name, role, avatar_url),
        user2:user2_id(id, full_name, role, avatar_url),
        unread_count:messages(count)
      `)
      .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
      .eq("messages.is_read", false)
      .neq("messages.sender_id", session.user.id)
      .order("last_message_at", { ascending: false })

    if (error) {
      console.error("Error fetching conversations:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format conversations to include the other user's details
    const formattedConversations = conversations.map((conversation) => {
      const isUser1 = conversation.user1.id === session.user.id
      const otherUser = isUser1 ? conversation.user2 : conversation.user1

      return {
        id: conversation.id,
        otherUser: {
          id: otherUser.id,
          fullName: otherUser.full_name,
          role: otherUser.role,
          avatarUrl: otherUser.avatar_url,
        },
        lastMessage: conversation.last_message,
        lastMessageAt: conversation.last_message_at,
        unreadCount: conversation.unread_count,
      }
    })

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error) {
    console.error("Error in conversations API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.userId) {
      return NextResponse.json({ error: "Missing required field: userId" }, { status: 400 })
    }

    // Check if the other user exists
    const { data: otherUser, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", body.userId)
      .single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if a conversation already exists between these users
    const { data: existingConversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(user1_id.eq.${session.user.id},user2_id.eq.${body.userId}),and(user1_id.eq.${body.userId},user2_id.eq.${session.user.id})`,
      )
      .maybeSingle()

    if (conversationError) {
      console.error("Error checking existing conversation:", conversationError)
      return NextResponse.json({ error: conversationError.message }, { status: 500 })
    }

    // If conversation exists, return it
    if (existingConversation) {
      return NextResponse.json({ conversationId: existingConversation.id, isNew: false })
    }

    // Create a new conversation
    const { data: newConversation, error } = await supabase
      .from("conversations")
      .insert({
        user1_id: session.user.id,
        user2_id: body.userId,
        created_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating conversation:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ conversationId: newConversation.id, isNew: true })
  } catch (error) {
    console.error("Error in conversations API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
