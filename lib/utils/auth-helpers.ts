import type { UserRole } from "@/lib/services/role-management"

// Valid user roles
const VALID_ROLES = ["admin", "landlord", "tenant", "maintenance"]

// Get the dashboard path for a role
export function getDashboardPath(role: string): string {
  return `/dashboard/${VALID_ROLES.includes(role) ? role : "tenant"}`
}

// Check if a user has a specific role
export function hasRole(userRole: UserRole | null, requiredRoles: string[]): boolean {
  if (!userRole) return false

  // Admin role has access to everything
  if (userRole === "admin") return true

  return requiredRoles.includes(userRole)
}

// Check if a page is public (doesn't require authentication)
export function isPublicPage(pathname: string): boolean {
  const publicPages = ["/", "/login", "/register", "/about", "/contact", "/privacy", "/terms"]

  // Check if the pathname is in the list of public pages
  if (publicPages.includes(pathname)) {
    return true
  }

  // Check if the pathname starts with any of these prefixes
  const publicPrefixes = ["/api/", "/static/", "/images/", "/fonts/", "/favicon"]
  return publicPrefixes.some((prefix) => pathname.startsWith(prefix))
}
