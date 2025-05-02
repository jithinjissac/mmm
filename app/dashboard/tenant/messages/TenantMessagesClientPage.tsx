"use client"

import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/mock-auth-provider"
import WithAuthProtection from "@/components/auth/with-auth-protection"
import { useToast } from "@/hooks/use-toast"
import { MessagingLayout } from "@/components/messaging/messaging-layout"

// Mock conversation data
const mockConversations = [
  {
    id: 1,
    recipient: {
      id: "landlord-1",
      name: "John Smith",
      role: "landlord",
      avatar: null,
    },
    lastMessage: {
      content: "I'll send someone to fix the issue tomorrow morning.",
      timestamp: "2023-06-15T14:30:00Z",
      isRead: true,
      senderId: "landlord-1",
    },
    unreadCount: 0,
  },
  {
    id: 2,
    recipient: {
      id: "maintenance-1",
      name: "Mike Johnson",
      role: "maintenance",
      avatar: null,
    },
    lastMessage: {
      content: "I'll be there at 10 AM to check the heating system.",
      timestamp: "2023-06-14T09:15:00Z",
      isRead: false,
      senderId: "maintenance-1",
    },
    unreadCount: 2,
  },
  {
    id: 3,
    recipient: {
      id: "admin-1",
      name: "Sarah Williams",
      role: "admin",
      avatar: null,
    },
    lastMessage: {
      content: "Your contract renewal documents have been sent to your email.",
      timestamp: "2023-06-10T11:45:00Z",
      isRead: true,
      senderId: "admin-1",
    },
    unreadCount: 0,
  },
]

// Mock messages for a conversation
const mockMessages = [
  {
    id: 1,
    conversationId: 1,
    content: "Hello, I wanted to report an issue with the kitchen sink. It's leaking.",
    timestamp: "2023-06-15T10:30:00Z",
    senderId: "tenant-1",
    senderName: "You",
    isRead: true,
  },
  {
    id: 2,
    conversationId: 1,
    content: "Hi there, thanks for letting me know. Can you send a photo of the issue?",
    timestamp: "2023-06-15T11:15:00Z",
    senderId: "landlord-1",
    senderName: "John Smith",
    isRead: true,
  },
  {
    id: 3,
    conversationId: 1,
    content: "I've attached a photo of the leaking sink. As you can see, it's coming from the pipe underneath.",
    timestamp: "2023-06-15T11:45:00Z",
    senderId: "tenant-1",
    senderName: "You",
    isRead: true,
    attachment: {
      name: "sink_leak.jpg",
      url: "#",
    },
  },
  {
    id: 4,
    conversationId: 1,
    content: "Thank you for the photo. I'll send someone to fix the issue tomorrow morning.",
    timestamp: "2023-06-15T14:30:00Z",
    senderId: "landlord-1",
    senderName: "John Smith",
    isRead: true,
  },
]

export default function TenantMessagesClientPage() {
  const { user, isLoading } = useAuth()
  const [conversations, setConversations] = useState(mockConversations)
  const [messages, setMessages] = useState(mockMessages)
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const { toast } = useToast()

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) =>
    conversation.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Select a conversation and load its messages
  const selectConversation = (conversation: any) => {
    setIsLoadingMessages(true)
    setSelectedConversation(conversation)

    // Simulate loading messages
    setTimeout(() => {
      // Mark messages as read
      const updatedConversations = conversations.map((conv) =>
        conv.id === conversation.id
          ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, isRead: true } }
          : conv,
      )
      setConversations(updatedConversations)
      setIsLoadingMessages(false)
    }, 500)
  }

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setIsSendingMessage(true)

    // Simulate sending a message
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newMessageObj = {
      id: messages.length + 1,
      conversationId: selectedConversation.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      senderId: "tenant-1",
      senderName: "You",
      isRead: false,
    }

    // Add new message to messages
    setMessages([...messages, newMessageObj])

    // Update conversation with last message
    const updatedConversations = conversations.map((conv) =>
      conv.id === selectedConversation.id
        ? {
            ...conv,
            lastMessage: {
              content: newMessage,
              timestamp: new Date().toISOString(),
              isRead: false,
              senderId: "tenant-1",
            },
          }
        : conv,
    )

    setConversations(updatedConversations)
    setNewMessage("")
    setIsSendingMessage(false)
  }

  // Handle key press for sending message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading messages...</span>
      </div>
    )
  }

  return (
    <WithAuthProtection requiredRole="tenant">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with your landlord about your rental, maintenance requests, and more.
          </p>
        </div>

        <MessagingLayout
          conversations={conversations}
          setConversations={setConversations}
          messages={messages}
          setMessages={setMessages}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isLoadingMessages={isLoadingMessages}
          setIsLoadingMessages={setIsLoadingMessages}
          isSendingMessage={isSendingMessage}
          setIsSendingMessage={setIsSendingMessage}
          toast={toast}
        />
      </div>
    </WithAuthProtection>
  )
}
