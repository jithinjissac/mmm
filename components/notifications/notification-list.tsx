"use client"

import { useState, useEffect } from "react"
import { Bell, Check, X, AlertCircle, Info, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Notification = {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
}

export function NotificationList() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching notifications
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock data
        const mockNotifications: Notification[] = [
          {
            id: "1",
            title: "Rent Payment Received",
            message: "Your rent payment for May has been received. Thank you!",
            type: "success",
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          },
          {
            id: "2",
            title: "Maintenance Request Update",
            message: "Your maintenance request #1234 has been scheduled for tomorrow at 10:00 AM.",
            type: "info",
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          },
          {
            id: "3",
            title: "Lease Renewal Reminder",
            message: "Your lease is set to expire in 30 days. Please contact your landlord to discuss renewal options.",
            type: "warning",
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
          },
          {
            id: "4",
            title: "Late Payment Notice",
            message:
              "Your utility payment is overdue. Please make a payment as soon as possible to avoid additional fees.",
            type: "error",
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
          },
          {
            id: "5",
            title: "New Property Listed",
            message: "A new property matching your saved search criteria is now available.",
            type: "info",
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
          },
        ]

        setNotifications(mockNotifications)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchNotifications()
    } else {
      setLoading(false)
    }
  }, [user])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "error":
        return <X className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-12 bg-gray-100 rounded-t-lg"></CardHeader>
            <CardContent className="py-4">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">Sign in to view your notifications</h3>
          <p className="text-sm text-gray-500 mt-2">You need to be signed in to view and manage your notifications.</p>
        </CardContent>
      </Card>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-sm text-gray-500 mt-2">You don't have any notifications at the moment.</p>
        </CardContent>
      </Card>
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">All Notifications</h2>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={notification.read ? "opacity-75" : ""}>
            <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                {getNotificationIcon(notification.type)}
                <span className="font-medium">{notification.title}</span>
              </div>
              <div className="text-xs text-gray-500">{formatDate(notification.createdAt)}</div>
            </CardHeader>
            <CardContent className="py-2">
              <p className="text-sm">{notification.message}</p>
            </CardContent>
            <CardFooter className="pt-1 pb-3 flex justify-end gap-2">
              {!notification.read && (
                <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                  Mark as read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
