"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/mock-auth-provider"
import { Loader2, Bell, CheckCircle } from "lucide-react"

// Mock notification data
const MOCK_NOTIFICATIONS = [
  {
    id: "notif1",
    user_id: "user1",
    sender: "System",
    message: "Your application for Master Bedroom has been accepted",
    type: "application",
    read: false,
    created_at: "2023-06-15T10:30:00Z",
  },
  {
    id: "notif2",
    user_id: "user1",
    sender: "Jane Smith",
    message: "New message regarding your tenancy",
    type: "message",
    read: true,
    created_at: "2023-06-14T15:45:00Z",
  },
  {
    id: "notif3",
    user_id: "user1",
    sender: "System",
    message: "Rent payment reminder: Due in 5 days",
    type: "payment",
    read: false,
    created_at: "2023-06-13T09:15:00Z",
  },
]

export function NotificationList() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Filter notifications for the current user
        const userNotifications = MOCK_NOTIFICATIONS.filter((n) => n.user_id === user?.id)
        setNotifications(userNotifications)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load notifications. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [toast, user])

  const markAsRead = async (notificationId: string) => {
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update the notification in the local state
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification,
        ),
      )

      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification. Please try again.",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mark all notifications as read
      setNotifications(notifications.map((notification) => ({ ...notification, read: true })))

      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notifications. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </CardDescription>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">You don't have any notifications yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id} className={notification.read ? "" : "bg-muted/50"}>
                  <TableCell>{notification.sender}</TableCell>
                  <TableCell>{notification.message}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {notification.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(notification.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={notification.read ? "outline" : "default"}>
                      {notification.read ? "Read" : "Unread"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!notification.read && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" /> Mark as Read
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
