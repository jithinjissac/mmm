"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"
import { MessageItem } from "./message-item"
import { MessageForm } from "./message-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageHeader } from "./message-header"

// Mock message data
const MOCK_MESSAGES = [
  {
    id: "msg1",
    tenancy_id: "tenancy1",
    sender_id: "landlord1",
    sender_name: "John Smith",
    sender_role: "landlord",
    message:
      "Hi Alice, just checking in to see if everything is going well with the apartment. Let me know if you need anything.",
    created_at: "2023-08-10T10:30:00Z",
  },
  {
    id: "msg2",
    tenancy_id: "tenancy1",
    sender_id: "tenant1",
    sender_name: "Alice Johnson",
    sender_role: "tenant",
    message:
      "Hi John, everything is great! The heating is working perfectly now after the repair. Thanks for checking in.",
    created_at: "2023-08-10T11:15:00Z",
  },
  {
    id: "msg3",
    tenancy_id: "tenancy1",
    sender_id: "landlord1",
    sender_name: "John Smith",
    sender_role: "landlord",
    message:
      "That's great to hear! I'll be sending over the updated tenancy agreement for next year soon. Would you like to renew?",
    created_at: "2023-08-10T14:45:00Z",
  },
  {
    id: "msg4",
    tenancy_id: "tenancy1",
    sender_id: "tenant1",
    sender_name: "Alice Johnson",
    sender_role: "tenant",
    message: "Yes, I'd definitely like to renew. I'm very happy with the apartment and the location is perfect for me.",
    created_at: "2023-08-11T09:20:00Z",
  },
]

export function MessageList() {
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAuth()

  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tenancyDetails, setTenancyDetails] = useState<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Filter messages for the current tenancy
        const tenancyId = typeof params.tenancyId === "string" ? params.tenancyId : "tenancy1"
        const tenancyMessages = MOCK_MESSAGES.filter((m) => m.tenancy_id === tenancyId)
        setMessages(tenancyMessages)

        // Mock tenancy details
        setTenancyDetails({
          id: tenancyId,
          property_name: "Modern City Apartment",
          room_name: "Master Bedroom",
          landlord_name: "John Smith",
          tenant_name: "Alice Johnson",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [params.tenancyId, toast])

  const handleMessageSent = () => {
    // In a real app, we would fetch the latest messages
    // For now, we'll simulate adding a new message
    const newMessage = {
      id: `msg${messages.length + 1}`,
      tenancy_id: typeof params.tenancyId === "string" ? params.tenancyId : "tenancy1",
      sender_id: user?.id || "current-user",
      sender_name: user?.name || "Current User",
      sender_role: user?.role || "tenant",
      message: "Thanks for the information. I'll review the agreement when it arrives.",
      created_at: new Date().toISOString(),
    }

    setMessages([...messages, newMessage])
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-3/4" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">{tenancyDetails && <MessageHeader tenancyDetails={tenancyDetails} />}</CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 max-h-[500px] overflow-y-auto p-2">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isCurrentUser={message.sender_id === (user?.id || "current-user")}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="pt-4 border-t">
          <MessageForm
            tenancyId={typeof params.tenancyId === "string" ? params.tenancyId : "tenancy1"}
            onMessageSent={handleMessageSent}
          />
        </div>
      </CardContent>
    </Card>
  )
}
