"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface LandlordMessagesClientPageProps {
  conversations: any[]
  currentUserId: string
}

export default function LandlordMessagesClientPage({ conversations, currentUserId }: LandlordMessagesClientPageProps) {
  const [message, setMessage] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    if (selectedConversation) {
      // Mock fetching messages for the selected conversation
      const mockMessages = [
        { id: 1, senderId: selectedConversation.participants[0].user_id, content: "Hello!", createdAt: new Date() },
        { id: 2, senderId: currentUserId, content: "Hi there!", createdAt: new Date() },
      ]
      setMessages(mockMessages)
    }
  }, [selectedConversation, currentUserId])

  const handleSendMessage = () => {
    if (message && selectedConversation) {
      // Mock sending message
      const newMessage = {
        id: messages.length + 1,
        senderId: currentUserId,
        content: message,
        createdAt: new Date(),
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Conversation List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className={`w-full text-left p-2 rounded hover:bg-accent hover:text-accent-foreground ${
                    selectedConversation?.id === conversation.id ? "bg-accent text-accent-foreground" : ""
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  {conversation.participants.map((participant: any) => {
                    if (participant.user_id !== currentUserId) {
                      return (
                        <div key={participant.user_id} className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarImage
                              src={participant.users?.avatar_url || ""}
                              alt={participant.users?.first_name}
                            />
                            <AvatarFallback>
                              {participant.users?.first_name?.charAt(0)}
                              {participant.users?.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {participant.users?.first_name} {participant.users?.last_name}
                          </span>
                        </div>
                      )
                    }
                    return null
                  })}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Message Area */}
        <div className="md:col-span-3">
          {selectedConversation ? (
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle>
                  {selectedConversation.participants.map((participant: any) => {
                    if (participant.user_id !== currentUserId) {
                      return (
                        <div key={participant.user_id} className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarImage
                              src={participant.users?.avatar_url || ""}
                              alt={participant.users?.first_name}
                            />
                            <AvatarFallback>
                              {participant.users?.first_name?.charAt(0)}
                              {participant.users?.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {participant.users?.first_name} {participant.users?.last_name}
                          </span>
                        </div>
                      )
                    }
                    return null
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto">
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-lg ${
                        msg.senderId === currentUserId ? "bg-blue-100 ml-auto text-right" : "bg-gray-100 mr-auto"
                      }`}
                    >
                      {msg.content}
                      <p className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex items-center space-x-2 w-full">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button onClick={handleSendMessage} disabled={!message}>
                    Send <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center">Select a conversation to view messages.</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
