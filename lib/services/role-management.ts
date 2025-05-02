import { createClientSupabaseClient } from "@/lib/supabase/client"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { retryOperation } from "@/hooks/use-retry-operation"

// Valid roles in the system
export const VALID_ROLES = ["admin", "landlord", "tenant", "maintenance"] as const
export type UserRole = (typeof VALID_ROLES)[number]

// Default role if none is specified
export const DEFAULT_ROLE: UserRole = "tenant"

// Role management service
export class RoleManagementService {
  // Validate if a role is valid
  static isValidRole(role: string): role is UserRole {
    return VALID_ROLES.includes(role as UserRole)
  }

  // Get a safe role (ensures it's always valid)
  static getSafeRole(role: string | null | undefined): UserRole {
    if (!role || !this.isValidRole(role)) {
      console.warn(`Invalid role detected: "${role}", defaulting to ${DEFAULT_ROLE}`)
      return DEFAULT_ROLE
    }
    return role as UserRole
  }

  // Get user role from profile with fallback to metadata
  static async getUserRole(userId: string): Promise<UserRole> {
    try {
      // First try to get from profile (source of truth)
      const supabase = createClientSupabaseClient()
      const { data: profile, error } = await retryOperation(
        "get-user-role",
        () => supabase.from("profiles").select("role").eq("id", userId).single(),
        { maxAttempts: 3, initialDelay: 1000 },
      )

      // If profile exists and has a valid role, use it
      if (!error && profile && this.isValidRole(profile.role)) {
        return profile.role
      }

      // If profile doesn't exist or has invalid role, try metadata
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user?.user_metadata?.role && this.isValidRole(userData.user.user_metadata.role)) {
        // Found valid role in metadata, sync it to profile
        await this.syncRoleToProfile(userId, userData.user.user_metadata.role as UserRole)
        return userData.user.user_metadata.role as UserRole
      }

      // If no valid role found, set default and sync
      await this.syncRoleToProfile(userId, DEFAULT_ROLE)
      return DEFAULT_ROLE
    } catch (error) {
      console.error("Error getting user role:", error)
      return DEFAULT_ROLE
    }
  }

  // Sync role from metadata to profile (client-side)
  static async syncRoleToProfile(userId: string, role: UserRole): Promise<boolean> {
    try {
      const supabase = createClientSupabaseClient()

      // First check if profile exists
      const { data: existingProfile } = await retryOperation(
        "check-profile-exists",
        () => supabase.from("profiles").select("id, role").eq("id", userId).single(),
        { maxAttempts: 3, initialDelay: 1000 },
      )

      if (existingProfile) {
        // Update existing profile if role is different
        if (existingProfile.role !== role) {
          const { error } = await retryOperation(
            "update-profile-role",
            () =>
              supabase
                .from("profiles")
                .update({
                  role,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", userId),
            { maxAttempts: 3, initialDelay: 1000 },
          )

          if (error) {
            console.error("Error updating profile role:", error)
            return false
          }
          console.log(`Updated profile role for user ${userId} from ${existingProfile.role} to ${role}`)
        }
      } else {
        // Create new profile if it doesn't exist
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user) {
          console.error("Cannot create profile: User data not available")
          return false
        }

        const { error } = await retryOperation(
          "create-profile",
          () =>
            supabase.from("profiles").insert({
              id: userId,
              email: userData.user.email || "unknown@example.com",
              full_name: userData.user.user_metadata?.full_name || "New User",
              role,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
          { maxAttempts: 3, initialDelay: 1000 },
        )

        if (error) {
          console.error("Error creating profile with role:", error)
          return false
        }
        console.log(`Created new profile for user ${userId} with role ${role}`)
      }

      return true
    } catch (error) {
      console.error("Error syncing role to profile:", error)
      return false
    }
  }

  // Sync role from profile to metadata (server-side, requires admin)
  static async syncRoleToMetadata(userId: string, role: UserRole): Promise<boolean> {
    try {
      const supabase = createAdminSupabaseClient()

      // Update user metadata with the role
      const { error } = await retryOperation(
        "update-user-metadata",
        () =>
          supabase.auth.admin.updateUserById(userId, {
            user_metadata: { role },
          }),
        { maxAttempts: 3, initialDelay: 1000 },
      )

      if (error) {
        console.error("Error updating user metadata role:", error)
        return false
      }

      console.log(`Updated metadata role for user ${userId} to ${role}`)
      return true
    } catch (error) {
      console.error("Error syncing role to metadata:", error)
      return false
    }
  }

  // Update user role (both profile and metadata)
  static async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    if (!this.isValidRole(newRole)) {
      console.error(`Cannot update to invalid role: ${newRole}`)
      return false
    }

    try {
      // Update profile first (source of truth)
      const profileUpdated = await this.syncRoleToProfile(userId, newRole)
      if (!profileUpdated) {
        console.error("Failed to update profile role")
        return false
      }

      // Then update metadata
      const metadataUpdated = await this.syncRoleToMetadata(userId, newRole)
      if (!metadataUpdated) {
        console.warn("Updated profile role but failed to update metadata")
        // We still return true because profile is the source of truth
      }

      return true
    } catch (error) {
      console.error("Error updating user role:", error)
      return false
    }
  }

  // Get role hierarchy level (for permission checks)
  static getRoleHierarchyLevel(role: UserRole): number {
    switch (role) {
      case "admin":
        return 100
      case "landlord":
        return 50
      case "maintenance":
        return 30
      case "tenant":
        return 10
      default:
        return 0
    }
  }

  // Check if a role has permission over another role
  static hasPermissionOverRole(actorRole: UserRole, targetRole: UserRole): boolean {
    // Admin has permission over all roles
    if (actorRole === "admin") return true

    // Other roles only have permission over roles lower in hierarchy
    return this.getRoleHierarchyLevel(actorRole) > this.getRoleHierarchyLevel(targetRole)
  }
}

// Role-based access control utility
export function hasRoleAccess(userRole: string | null | undefined, requiredRole: UserRole | UserRole[]): boolean {
  const safeUserRole = RoleManagementService.getSafeRole(userRole)

  // Admin always has access
  if (safeUserRole === "admin") return true

  // Check against single required role
  if (typeof requiredRole === "string") {
    return safeUserRole === requiredRole
  }

  // Check against array of roles
  return requiredRole.includes(safeUserRole)
}

// Get role from profile
export async function getRoleFromProfile(supabase: any, userId: string) {
  try {
    // Get the profile
    const { data: profile, error } = await retryOperation(
      "get-role-from-profile",
      () => supabase.from("profiles").select("role").eq("id", userId).single(),
      { maxAttempts: 3, initialDelay: 1000 },
    )

    if (error) {
      console.error("Error getting profile:", error)
      return { role: DEFAULT_ROLE, error }
    }

    // Default to tenant if no role is found
    const role = profile?.role || DEFAULT_ROLE

    return { role, error: null }
  } catch (error) {
    console.error("Error in getRoleFromProfile:", error)
    return { role: DEFAULT_ROLE, error }
  }
}

// Sync the role to the auth metadata
export async function syncRoleToAuth(supabase: any, userId: string, role: string) {
  try {
    // Update the user's metadata
    const { error } = await retryOperation(
      "sync-role-to-auth",
      () =>
        supabase.auth.admin.updateUserById(userId, {
          user_metadata: { role },
        }),
      { maxAttempts: 3, initialDelay: 1000 },
    )

    if (error) {
      console.error("Error updating user metadata:", error)
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in syncRoleToAuth:", error)
    return { success: false, error }
  }
}

// Update a user's role
export async function updateUserRole(userId: string, newRole: string) {
  try {
    // Get the admin client
    const supabaseAdmin = createAdminSupabaseClient()

    // Update the profile
    const { error: profileError } = await retryOperation(
      "update-user-role-profile",
      () => supabaseAdmin.from("profiles").update({ role: newRole }).eq("id", userId),
      { maxAttempts: 3, initialDelay: 1000 },
    )

    if (profileError) {
      console.error("Error updating profile role:", profileError)
      return { success: false, error: profileError }
    }

    // Sync the role to the auth metadata
    const { success, error: syncError } = await syncRoleToAuth(supabaseAdmin, userId, newRole)

    if (!success || syncError) {
      console.error("Error syncing role to auth:", syncError)
      return { success: false, error: syncError }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in updateUserRole:", error)
    return { success: false, error }
  }
}

// Get all available roles
export function getAvailableRoles() {
  return VALID_ROLES
}

// Check if a user has a specific role
export function hasRole(userRole: string | null, requiredRole: string | string[]) {
  if (!userRole) return false

  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return requiredRoles.includes(userRole)
}
