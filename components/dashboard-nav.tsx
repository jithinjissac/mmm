"use client"

import { useAuth } from "@/lib/auth/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Building,
  Users,
  MessageSquare,
  CreditCard,
  Wrench,
  Settings,
  User,
  Flag,
  FileText,
  Calendar,
  Clock,
} from "lucide-react"

export function DashboardNav() {
  const { profile, isLoading } = useAuth()
  const pathname = usePathname()

  if (isLoading) {
    return (
      <nav className="grid items-start gap-2 p-4">
        <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
        <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
        <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
      </nav>
    )
  }

  // Define navigation items based on user role
  const navItems = (() => {
    switch (profile?.role) {
      case "admin":
        return [
          { href: "/dashboard/admin", label: "Dashboard", icon: Home },
          { href: "/dashboard/admin/users", label: "Users", icon: Users },
          { href: "/dashboard/admin/properties", label: "Properties", icon: Building },
          { href: "/dashboard/admin/reviews", label: "Reviews", icon: FileText },
          { href: "/dashboard/admin/flag-content", label: "Flagged Content", icon: Flag },
          { href: "/dashboard/admin/disputes", label: "Disputes", icon: MessageSquare },
          { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
        ]
      case "landlord":
        return [
          { href: "/dashboard/landlord", label: "Dashboard", icon: Home },
          { href: "/dashboard/landlord/properties", label: "Properties", icon: Building },
          { href: "/dashboard/landlord/rooms", label: "Rooms", icon: Building },
          { href: "/dashboard/landlord/tenants", label: "Tenants", icon: Users },
          { href: "/dashboard/landlord/messages", label: "Messages", icon: MessageSquare },
          { href: "/dashboard/landlord/payments", label: "Payments", icon: CreditCard },
          { href: "/dashboard/landlord/maintenance", label: "Maintenance", icon: Wrench },
          { href: "/dashboard/landlord/profile", label: "Profile", icon: User },
          { href: "/dashboard/landlord/settings", label: "Settings", icon: Settings },
        ]
      case "tenant":
        return [
          { href: "/dashboard/tenant", label: "Dashboard", icon: Home },
          { href: "/dashboard/tenant/rental", label: "My Rental", icon: Building },
          { href: "/dashboard/tenant/messages", label: "Messages", icon: MessageSquare },
          { href: "/dashboard/tenant/payments", label: "Payments", icon: CreditCard },
          { href: "/dashboard/tenant/maintenance", label: "Maintenance", icon: Wrench },
          { href: "/dashboard/tenant/bills", label: "Bills", icon: FileText },
          { href: "/dashboard/tenant/chores", label: "Chores", icon: Calendar },
          { href: "/dashboard/tenant/groups", label: "Groups", icon: Users },
          { href: "/dashboard/tenant/profile", label: "Profile", icon: User },
          { href: "/dashboard/tenant/settings", label: "Settings", icon: Settings },
        ]
      case "maintenance":
        return [
          { href: "/dashboard/maintenance/dashboard", label: "Dashboard", icon: Home },
          { href: "/dashboard/maintenance/work-orders", label: "Work Orders", icon: FileText },
          { href: "/dashboard/maintenance/properties", label: "Properties", icon: Building },
          { href: "/dashboard/maintenance/schedule", label: "Schedule", icon: Clock },
        ]
      default:
        return [
          { href: "/dashboard", label: "Dashboard", icon: Home },
          { href: "/dashboard/profile", label: "Profile", icon: User },
        ]
    }
  })()

  return (
    <nav className="grid items-start gap-2 p-4">
      {navItems.map((item, index) => {
        const Icon = item.icon
        return (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
              pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
