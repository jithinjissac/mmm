"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import { revalidatePath } from "next/cache"

export async function getConversations() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { conversations: [], error: "You must be logged in to view conversations" }
    }

    // Get conversations where the user is a participant
    const { data, error } = await supabase
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
      return { conversations: [], error: error.message }
    }

    // Format conversations to include the other user's details
    const formattedConversations = data.map((conversation) => {
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

    return { conversations: formattedConversations, error: null }
  } catch (error) {
    console.error("Error in getConversations action:", error)
    return { conversations: [], error: "An unexpected error occurred" }
  }
}

export async function getMessages(conversationId: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { messages: [], error: "You must be logged in to view messages" }
    }

    // Get conversation to check access
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single()

    if (conversationError) {
      console.error("Error fetching conversation:", conversationError)
      return { messages: [], error: conversationError.message }
    }

    // Check if user is a participant in this conversation
    if (conversation.user1_id !== session.user.id && conversation.user2_id !== session.user.id) {
      return { messages: [], error: "You don't have permission to view these messages" }
    }

    // Get messages for this conversation
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:sender_id(id, full_name, role, avatar_url)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
      return { messages: [], error: error.message }
    }

    // Mark messages as read if the user is the recipient
    const unreadMessages = data.filter((message) => message.sender.id !== session.user.id && !message.is_read)

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map((message) => message.id)

      await supabase.from("messages").update({ is_read: true }).in("id", messageIds)

      // Revalidate the conversations list to update unread counts
      revalidatePath("/dashboard/messages")
    }

    return { messages: data, error: null }
  } catch (error) {
    console.error("Error in getMessages action:", error)
    return { messages: [], error: "An unexpected error occurred" }
  }
}

export async function sendMessage(conversationId: string, formData: FormData) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "You must be logged in to send messages" }
    }

    // Get conversation to check access
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single()

    if (conversationError) {
      console.error("Error fetching conversation:", conversationError)
      return { error: conversationError.message }
    }

    // Check if user is a participant in this conversation
    if (conversation.user1_id !== session.user.id && conversation.user2_id !== session.user.id) {
      return { error: "You don't have permission to send messages in this conversation" }
    }

    // Extract message content
    const content = formData.get("content") as string

    if (!content || content.trim() === "") {
      return { error: "Message cannot be empty" }
    }

    // Create message
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: session.user.id,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error sending message:", error)
      return { error: error.message }
    }

    // Update conversation last_message_at and last_message
    await supabase
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message: content,
      })
      .eq("id", conversationId)

    // Revalidate the messages and conversations pages
    revalidatePath(`/dashboard/messages/${conversationId}`)
    revalidatePath("/dashboard/messages")

    return { success: true }
  } catch (error) {
    console.error("Error in sendMessage action:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function createConversation(userId: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { conversationId: null, error: "You must be logged in to create conversations" }
    }

    // Check if the other user exists
    const { data: otherUser, error: userError } = await supabase.from("profiles").select("id").eq("id", userId).single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return { conversationId: null, error: "User not found" }
    }

    // Check if a conversation already exists between these users
    const { data: existingConversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(user1_id.eq.${session.user.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${session.user.id})`,
      )
      .maybeSingle()

    if (conversationError) {
      console.error("Error checking existing conversation:", conversationError)
      return { conversationId: null, error: conversationError.message }
    }

    // If conversation exists, return it
    if (existingConversation) {
      return { conversationId: existingConversation.id, isNew: false, error: null }
    }

    // Create a new conversation
    const { data: newConversation, error } = await supabase
      .from("conversations")
      .insert({
        user1_id: session.user.id,
        user2_id: userId,
        created_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating conversation:", error)
      return { conversationId: null, error: error.message }
    }

    // Revalidate the conversations page
    revalidatePath("/dashboard/messages")

    return { conversationId: newConversation.id, isNew: true, error: null }
  } catch (error) {
    console.error("Error in createConversation action:", error)
    return { conversationId: null, error: "An unexpected error occurred" }
  }
}
