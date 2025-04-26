"use client"

import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type UserWithProfile = SupabaseUser & { profile: Profile | null }

type UserNavProps = {
  user: UserWithProfile
}

export function UserNav({ user }: UserNavProps) {
  const { signOut } = useAuth()
  const [verifiedUser, setVerifiedUser] = useState<UserWithProfile | null>(null)
  const supabase = createClientSupabaseClient()

  // Verify user data on component mount
  useEffect(() => {
    const verifyUser = async () => {
      try {
        // Always verify user with getUser
        const { data, error } = await supabase.auth.getUser()

        if (error || !data.user) {
          console.error("Error verifying user in UserNav:", error)
          return
        }

        // If the user IDs match, use the provided user data
        if (data.user.id === user.id) {
          setVerifiedUser(user)
        }
      } catch (error) {
        console.error("Error in UserNav verification:", error)
      }
    }

    verifyUser()
  }, [user, supabase])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleLabel = (role: string | undefined) => {
    // Default to tenant if role is undefined
    const safeRole = role || "tenant"

    switch (safeRole) {
      case "admin":
        return "Administrator"
      case "landlord":
        return "Landlord"
      case "tenant":
        return "Tenant"
      case "maintenance":
        return "Maintenance"
      default:
        return safeRole.charAt(0).toUpperCase() + safeRole.slice(1)
    }
  }

  // If user verification is still in progress or failed, show minimal UI
  if (!verifiedUser || !verifiedUser.profile) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
        <Avatar>
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      </Button>
    )
  }

  // Ensure we have a valid role for navigation
  const userRole = verifiedUser.profile.role || "tenant"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={verifiedUser.profile.avatar_url || ""} alt={verifiedUser.profile.full_name} />
            <AvatarFallback>{getInitials(verifiedUser.profile.full_name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{verifiedUser.profile.full_name}</p>
            <p className="text-xs text-muted-foreground">{verifiedUser.profile.email}</p>
            <p className="text-xs font-medium text-primary">{getRoleLabel(verifiedUser.profile.role)}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a href={`/dashboard/${userRole}/profile`} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`/dashboard/${userRole}/settings`} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
