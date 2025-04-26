"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Building,
  Users,
  Settings,
  MessageSquare,
  Wrench,
  CreditCard,
  FileText,
  User,
  BarChart,
} from "lucide-react"

type NavItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard/admin",
    icon: Home,
  },
  {
    title: "Users",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "Properties",
    href: "/dashboard/admin/properties",
    icon: Building,
  },
  {
    title: "Reports",
    href: "/dashboard/admin/reports",
    icon: BarChart,
  },
  {
    title: "Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
  },
]

const landlordNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard/landlord",
    icon: Home,
  },
  {
    title: "Properties",
    href: "/dashboard/landlord/properties",
    icon: Building,
  },
  {
    title: "Rooms",
    href: "/dashboard/landlord/rooms",
    icon: FileText,
  },
  {
    title: "Tenants",
    href: "/dashboard/landlord/tenants",
    icon: Users,
  },
  {
    title: "Maintenance",
    href: "/dashboard/landlord/maintenance",
    icon: Wrench,
  },
  {
    title: "Payments",
    href: "/dashboard/landlord/payments",
    icon: CreditCard,
  },
  {
    title: "Messages",
    href: "/dashboard/landlord/messages",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    href: "/dashboard/landlord/profile",
    icon: User,
  },
]

const tenantNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard/tenant",
    icon: Home,
  },
  {
    title: "My Rental",
    href: "/dashboard/tenant/rental",
    icon: Building,
  },
  {
    title: "Maintenance Requests",
    href: "/dashboard/tenant/maintenance",
    icon: Wrench,
  },
  {
    title: "Payments",
    href: "/dashboard/tenant/payments",
    icon: CreditCard,
  },
  {
    title: "Messages",
    href: "/dashboard/tenant/messages",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    href: "/dashboard/tenant/profile",
    icon: User,
  },
]

const maintenanceNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard/maintenance",
    icon: Home,
  },
  {
    title: "Work Orders",
    href: "/dashboard/maintenance/work-orders",
    icon: Wrench,
  },
  {
    title: "Properties",
    href: "/dashboard/maintenance/properties",
    icon: Building,
  },
  {
    title: "Messages",
    href: "/dashboard/maintenance/messages",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    href: "/dashboard/maintenance/profile",
    icon: User,
  },
]

export function DashboardNav({ userRole }: { userRole: string | undefined }) {
  const pathname = usePathname()

  // Default to tenant if role is undefined
  const safeRole = userRole || "tenant"

  let navItems: NavItem[] = []

  switch (safeRole) {
    case "admin":
      navItems = adminNavItems
      break
    case "landlord":
      navItems = landlordNavItems
      break
    case "tenant":
      navItems = tenantNavItems
      break
    case "maintenance":
      navItems = maintenanceNavItems
      break
    default:
      navItems = tenantNavItems
  }

  return (
    <nav className="grid items-start gap-2 p-4 md:px-2 lg:px-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
