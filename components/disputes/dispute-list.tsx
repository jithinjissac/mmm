"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import { AlertCircle, CheckCircle, Clock, Eye, MessageSquare } from "lucide-react"

// Mock dispute data
const MOCK_DISPUTES = [
  {
    id: "dispute1",
    tenancyId: "tenancy1",
    propertyName: "Modern City Apartment",
    roomName: "Master Bedroom",
    title: "Deposit deduction dispute",
    description:
      "I believe the deduction from my deposit for repainting was excessive as the walls only had minor marks that should be considered normal wear and tear.",
    disputeType: "deposit",
    status: "pending",
    createdAt: "2023-07-15T10:30:00Z",
    updatedAt: "2023-07-15T10:30:00Z",
    evidenceFiles: ["/ancient-scroll.png"],
    messages: [
      {
        id: "msg1",
        sender: "tenant",
        senderName: "Alice Johnson",
        message: "I've submitted all the evidence showing the condition of the walls when I moved out.",
        createdAt: "2023-07-15T10:35:00Z",
      },
    ],
  },
  {
    id: "dispute2",
    tenancyId: "tenancy2",
    propertyName: "Suburban House",
    roomName: "Single Room",
    title: "Maintenance issue not resolved",
    description:
      "The leaking bathroom faucet reported three weeks ago has still not been fixed despite multiple reminders.",
    disputeType: "maintenance",
    status: "in_progress",
    createdAt: "2023-07-20T14:45:00Z",
    updatedAt: "2023-07-25T09:15:00Z",
    evidenceFiles: ["/dripping-chrome-faucet.png", "/damp-basement-corner.png"],
    messages: [
      {
        id: "msg1",
        sender: "tenant",
        senderName: "Bob Williams",
        message: "I've been waiting for three weeks now and the issue is getting worse.",
        createdAt: "2023-07-20T14:50:00Z",
      },
      {
        id: "msg2",
        sender: "landlord",
        senderName: "John Smith",
        message: "I've scheduled a plumber to visit next Monday.",
        createdAt: "2023-07-25T09:15:00Z",
      },
    ],
  },
  {
    id: "dispute3",
    tenancyId: "tenancy3",
    propertyName: "Downtown Loft",
    roomName: "Studio",
    title: "Noise complaint unaddressed",
    description:
      "The excessive noise from the neighboring apartment continues despite multiple complaints to the landlord.",
    disputeType: "noise",
    status: "resolved",
    createdAt: "2023-06-10T18:20:00Z",
    updatedAt: "2023-06-25T11:30:00Z",
    evidenceFiles: ["/soundscape-capture.png"],
    messages: [
      {
        id: "msg1",
        sender: "tenant",
        senderName: "Charlie Brown",
        message: "I've recorded the noise levels which exceed the legal limit.",
        createdAt: "2023-06-10T18:25:00Z",
      },
      {
        id: "msg2",
        sender: "landlord",
        senderName: "John Smith",
        message: "I'll speak with the neighbors about this issue.",
        createdAt: "2023-06-15T10:10:00Z",
      },
      {
        id: "msg3",
        sender: "admin",
        senderName: "Admin",
        message: "This dispute has been resolved. The landlord has installed additional soundproofing.",
        createdAt: "2023-06-25T11:30:00Z",
      },
    ],
  },
]

interface DisputeListProps {
  role?: "tenant" | "landlord" | "admin"
}

export function DisputeList({ role = "tenant" }: DisputeListProps) {
  const { toast } = useToast()
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> In Progress
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="success" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3" /> Resolved
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDisputeTypeBadge = (type: string) => {
    switch (type) {
      case "deposit":
        return <Badge>Deposit</Badge>
      case "maintenance":
        return <Badge variant="destructive">Maintenance</Badge>
      case "rent":
        return <Badge variant="secondary">Rent</Badge>
      case "damage":
        return <Badge variant="outline">Damage</Badge>
      case "noise":
        return <Badge variant="secondary">Noise</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const handleViewDetail = (dispute: any) => {
    setSelectedDispute(dispute)
    setIsDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {MOCK_DISPUTES.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground">No disputes found</p>
                </CardContent>
              </Card>
            ) : (
              MOCK_DISPUTES.map((dispute) => (
                <Card key={dispute.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{dispute.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {dispute.propertyName} - {dispute.roomName}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDisputeTypeBadge(dispute.disputeType)}
                        {getStatusBadge(dispute.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{dispute.description}</p>
                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                      <span>Created {formatDistanceToNow(new Date(dispute.createdAt), { addSuffix: true })}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {dispute.messages.length} messages
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewDetail(dispute)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {MOCK_DISPUTES.filter((d) => d.status === "pending").length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground">No pending disputes</p>
                </CardContent>
              </Card>
            ) : (
              MOCK_DISPUTES.filter((d) => d.status === "pending").map((dispute) => (
                <Card key={dispute.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{dispute.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {dispute.propertyName} - {dispute.roomName}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDisputeTypeBadge(dispute.disputeType)}
                        {getStatusBadge(dispute.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{dispute.description}</p>
                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                      <span>Created {formatDistanceToNow(new Date(dispute.createdAt), { addSuffix: true })}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {dispute.messages.length} messages
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewDetail(dispute)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Similar content for in_progress and resolved tabs */}
        <TabsContent value="in_progress" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {MOCK_DISPUTES.filter((d) => d.status === "in_progress").length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground">No disputes in progress</p>
                </CardContent>
              </Card>
            ) : (
              MOCK_DISPUTES.filter((d) => d.status === "in_progress").map((dispute) => (
                <Card key={dispute.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{dispute.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {dispute.propertyName} - {dispute.roomName}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDisputeTypeBadge(dispute.disputeType)}
                        {getStatusBadge(dispute.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{dispute.description}</p>
                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                      <span>Updated {formatDistanceToNow(new Date(dispute.updatedAt), { addSuffix: true })}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {dispute.messages.length} messages
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewDetail(dispute)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="resolved" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {MOCK_DISPUTES.filter((d) => d.status === "resolved").length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground">No resolved disputes</p>
                </CardContent>
              </Card>
            ) : (
              MOCK_DISPUTES.filter((d) => d.status === "resolved").map((dispute) => (
                <Card key={dispute.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{dispute.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {dispute.propertyName} - {dispute.roomName}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDisputeTypeBadge(dispute.disputeType)}
                        {getStatusBadge(dispute.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{dispute.description}</p>
                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                      <span>Resolved {formatDistanceToNow(new Date(dispute.updatedAt), { addSuffix: true })}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {dispute.messages.length} messages
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewDetail(dispute)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dispute Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedDispute && (
            <>
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>{selectedDispute.title}</span>
                  <div className="flex items-center gap-2">
                    {getDisputeTypeBadge(selectedDispute.disputeType)}
                    {getStatusBadge(selectedDispute.status)}
                  </div>
                </DialogTitle>
                <DialogDescription>
                  {selectedDispute.propertyName} - {selectedDispute.roomName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedDispute.description}</p>
                </div>

                {selectedDispute.evidenceFiles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Evidence Files</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedDispute.evidenceFiles.map((file: string, index: number) => (
                        <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                          <img
                            src={file || "/placeholder.svg"}
                            alt={`Evidence ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-2">Messages</h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto p-2 border rounded-md">
                    {selectedDispute.messages.map((message: any) => (
                      <div key={message.id} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">
                            {message.senderName}
                            <span className="text-xs text-muted-foreground ml-2 capitalize">({message.sender})</span>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p>{message.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
                {selectedDispute.status !== "resolved" && (
                  <Button
                    onClick={() => {
                      toast({
                        title: "Message sent",
                        description: "Your response has been added to the dispute.",
                      })
                      setIsDetailOpen(false)
                    }}
                  >
                    Respond
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
