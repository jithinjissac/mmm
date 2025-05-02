import { NotificationList } from "@/components/notifications/notification-list"

export default function NotificationsPage() {
  return (
    <div className="container max-w-6xl py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Your Notifications</h1>
      <NotificationList />
    </div>
  )
}
