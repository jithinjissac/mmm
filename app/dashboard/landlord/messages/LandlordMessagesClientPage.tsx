"use client"

import { MessagingLayout } from "@/components/messaging/messaging-layout"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useAuth, WithAuthProtection } from "@/lib/auth"

// Mock messages data
const mockMessages = [
  {
    id: 1,
    sender: "John Smith",
    senderRole: "tenant",
    senderAvatar: "/cozy-city-studio.png",
    property: "Riverside Apartments",
    room: "Room 2",
    subject: "Water pressure issue",
    message: "The water pressure in the shower has been very low for the past few days. Could you please look into it?",
    status: "Unread",
    timestamp: "2023-06-03T14:30:00",
    isUrgent: false,
  },
  {
    id: 2,
    sender: "Michael Brown",
    senderRole: "tenant",
    senderAvatar: "/cozy-single-bedroom.png",
    property: "City View Flat",
    room: "Room 1",
    subject: "Heating not working",
    message:
      "The heating in my room is not working at all. It's getting very cold, especially at night. Can this be fixed as soon as possible?",
    status: "Unread",
    timestamp: "2023-06-02T09:15:00",
    isUrgent: true,
  },
  {
    id: 3,
    sender: "Sarah Johnson",
    senderRole: "tenant",
    senderAvatar: "/cozy-eclectic-living-room.png",
    property: "Park House",
    room: "Room 4",
    subject: "Noise complaint",
    message:
      "I wanted to let you know that there has been excessive noise coming from Room 5 late at night for the past week. It's making it difficult for me to sleep.",
    status: "Read",
    timestamp: "2023-06-01T18:45:00",
    isUrgent: false,
  },
  {
    id: 4,
    sender: "Maintenance Team",
    senderRole: "maintenance",
    senderAvatar: "/leaky-pipe-under-sink.png",
    property: "Garden Cottage",
    room: "Living Room",
    subject: "Repair completed",
    message:
      "We've completed the repair of the electrical outlet in the living room. Everything is working properly now. Please let us know if you notice any issues.",
    status: "Read",
    timestamp: "2023-05-30T11:20:00",
    isUrgent: false,
  },
  {
    id: 5,
    sender: "Admin",
    senderRole: "admin",
    senderAvatar: "/mystical-forest-spirit.png",
    property: "All Properties",
    room: "N/A",
    subject: "System maintenance",
    message:
      "We will be performing system maintenance this weekend. The property management portal will be unavailable from Saturday 10 PM to Sunday 2 AM.",
    status: "Read",
    timestamp: "2023-05-28T16:00:00",
    isUrgent: false,
  },
]

export default function LandlordMessagesClientPage() {
  const { user, isLoading } = useAuth()
  const [messages, setMessages] = useState(mockMessages)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMessages = messages.filter(
    (message) =>
      message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.property.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const unreadMessages = filteredMessages.filter((message) => message.status === "Unread")
  const readMessages = filteredMessages.filter((message) => message.status === "Read")
  const urgentMessages = filteredMessages.filter((message) => message.isUrgent)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading messages...</span>
      </div>
    )
  }

  return (
    <WithAuthProtection requiredRole="landlord">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with your tenants about properties, maintenance, and more.
          </p>
        </div>

        <MessagingLayout />
      </div>
    </WithAuthProtection>
  )
}
