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

    // Get conversation ID from query params
    const conversationId = request.nextUrl.searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    // Get conversation to check access
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single()

    if (conversationError) {
      console.error("Error fetching conversation:", conversationError)
      return NextResponse.json({ error: conversationError.message }, { status: 500 })
    }

    // Check if user is a participant in this conversation
    if (conversation.user1_id !== session.user.id && conversation.user2_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get messages for this conversation
    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:sender_id(full_name, role)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Mark messages as read if the user is the recipient
    const unreadMessages = messages?.filter((message) => message.sender_id !== session.user.id && !message.is_read)

    if (unreadMessages && unreadMessages.length > 0) {
      const messageIds = unreadMessages.map((message) => message.id)

      await supabase.from("messages").update({ is_read: true }).in("id", messageIds)
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error in messages API:", error)
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
    if (!body.conversationId || !body.content) {
      return NextResponse.json({ error: "Missing required fields: conversationId, content" }, { status: 400 })
    }

    // Get conversation to check access
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", body.conversationId)
      .single()

    if (conversationError) {
      console.error("Error fetching conversation:", conversationError)
      return NextResponse.json({ error: conversationError.message }, { status: 500 })
    }

    // Check if user is a participant in this conversation
    if (conversation.user1_id !== session.user.id && conversation.user2_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create message
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: body.conversationId,
        sender_id: session.user.id,
        content: body.content,
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating message:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update conversation last_message_at
    await supabase
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message: body.content,
      })
      .eq("id", body.conversationId)

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error in messages API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
