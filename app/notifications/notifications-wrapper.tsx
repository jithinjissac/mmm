"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Dynamically import the notifications component with SSR disabled
const NotificationsClient = dynamic(() => import("./notifications-client"), {
  ssr: false,
  loading: () => <NotificationSkeleton />,
})

export function NotificationsWrapper() {
  return <NotificationsClient />
}

function NotificationSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border rounded-lg animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}
