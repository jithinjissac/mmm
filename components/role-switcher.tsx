"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/mock-auth-provider"
import { UserCog } from "lucide-react"

export function RoleSwitcher() {
  const { userRole, setCurrentRole } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <UserCog className="h-4 w-4" />
          <span className="hidden md:inline">Role: {userRole}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setCurrentRole("admin")}>Switch to Admin</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrentRole("landlord")}>Switch to Landlord</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrentRole("tenant")}>Switch to Tenant</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrentRole("maintenance")}>Switch to Maintenance</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
