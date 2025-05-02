"use client"

import type React from "react"

import { useState } from "react"
import { MessageList } from "./message-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"

// Mock tenancy data
const MOCK_TENANCIES = [
  {
    id: "tenancy1",
    property_name: "Modern City Apartment",
    room_name: "Master Bedroom",
    tenant_name: "Alice Johnson",
    unread_count: 2,
    last_message_date: "2023-08-11T09:20:00Z",
  },
  {
    id: "tenancy2",
    property_name: "Suburban House",
    room_name: "Single Room",
    tenant_name: "Bob Williams",
    unread_count: 0,
    last_message_date: "2023-08-09T14:30:00Z",
  },
  {
    id: "tenancy3",
    property_name: "Downtown Loft",
    room_name: "Studio",
    tenant_name: "Charlie Brown",
    unread_count: 1,
    last_message_date: "2023-08-10T11:45:00Z",
  },
]

interface MessagingLayoutProps {
  conversations?: any[]
  setConversations?: React.Dispatch<React.SetStateAction<any[]>>
  messages?: any[]
  setMessages?: React.Dispatch<React.SetStateAction<any[]>>
  selectedConversation?: any
  setSelectedConversation?: React.Dispatch<React.SetStateAction<any>>
  newMessage?: string
  setNewMessage?: React.Dispatch<React.SetStateAction<string>>
  searchQuery?: string
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>
  isLoadingMessages?: boolean
  setIsLoadingMessages?: React.Dispatch<React.SetStateAction<boolean>>
  isSendingMessage?: boolean
  setIsSendingMessage?: React.Dispatch<React.SetStateAction<boolean>>
  toast?: any
}

export function MessagingLayout({
  conversations = [],
  setConversations = () => {},
  messages = [],
  setMessages = () => {},
  selectedConversation = null,
  setSelectedConversation = () => {},
  newMessage = "",
  setNewMessage = () => {},
  searchQuery = "",
  setSearchQuery = () => {},
  isLoadingMessages = false,
  setIsLoadingMessages = () => {},
  isSendingMessage = false,
  setIsSendingMessage = () => {},
  toast = null,
}: MessagingLayoutProps) {
  const [selectedTenancyId, setSelectedTenancyId] = useState<string>("tenancy1")
  const [searchQueryLocal, setSearchQueryLocal] = useState("")

  const filteredTenancies = MOCK_TENANCIES.filter(
    (tenancy) =>
      tenancy.property_name.toLowerCase().includes(searchQueryLocal.toLowerCase()) ||
      tenancy.tenant_name.toLowerCase().includes(searchQueryLocal.toLowerCase()),
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)] min-h-[600px]">
      <Card className="md:col-span-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Conversations</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-8"
              value={searchQueryLocal}
              onChange={(e) => setSearchQueryLocal(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-2">
              <div className="space-y-2">
                {filteredTenancies.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">No conversations found</div>
                ) : (
                  filteredTenancies.map((tenancy) => (
                    <div
                      key={tenancy.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedTenancyId === tenancy.id ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedTenancyId(tenancy.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium truncate">{tenancy.property_name}</div>
                        {tenancy.unread_count > 0 && (
                          <div className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                            {tenancy.unread_count}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {tenancy.room_name} - {tenancy.tenant_name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(tenancy.last_message_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="unread" className="mt-2">
              <div className="space-y-2">
                {filteredTenancies.filter((t) => t.unread_count > 0).length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">No unread messages</div>
                ) : (
                  filteredTenancies
                    .filter((t) => t.unread_count > 0)
                    .map((tenancy) => (
                      <div
                        key={tenancy.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedTenancyId === tenancy.id ? "bg-primary/10" : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedTenancyId(tenancy.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium truncate">{tenancy.property_name}</div>
                          <div className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                            {tenancy.unread_count}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {tenancy.room_name} - {tenancy.tenant_name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(tenancy.last_message_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <div className="p-3 border-t">
          <Button variant="outline" className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </Card>

      <div className="md:col-span-2">
        <MessageList key={selectedTenancyId} />
      </div>
    </div>
  )
}
