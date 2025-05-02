"use client"

import { Suspense } from "react"
import { NotificationList } from "@/components/notifications/notification-list"
import { useAuth } from "@/components/auth-provider"

export default function NotificationsPage() {
  // Access auth context to ensure it's available
  const { user } = useAuth()

  return (
    <div className="container max-w-6xl py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Your Notifications</h1>
      <Suspense fallback={<NotificationSkeleton />}>
        <NotificationList />
      </Suspense>
    </div>
  )
}

function NotificationSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 border rounded-lg animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}
