"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"

// Define the user type
type User = {
  id: string
  email: string
  full_name: string
  role: "admin" | "landlord" | "tenant" | "maintenance"
  avatar_url?: string | null
}

// Define the auth context type
type MockAuthContextType = {
  user: User | null
  role: string
  setRole: (role: string) => void
  signOut: () => void
  isLoading: boolean
  userRole: string
  refreshProfile: () => void
  refreshSession: () => Promise<void>
  userProfile: User | null
}

// Create the context
const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined)

// Mock users for each role
const mockUsers = {
  admin: {
    id: "admin-user-id",
    email: "admin@example.com",
    full_name: "Admin User",
    role: "admin" as const,
    avatar_url: "/mystical-forest-spirit.png",
  },
  landlord: {
    id: "landlord-user-id",
    email: "landlord@example.com",
    full_name: "Landlord User",
    role: "landlord" as const,
    avatar_url: "/cozy-cabin-retreat.png",
  },
  tenant: {
    id: "tenant-user-id",
    email: "tenant@example.com",
    full_name: "Tenant User",
    role: "tenant" as const,
    avatar_url: "/cozy-city-studio.png",
  },
  maintenance: {
    id: "maintenance-user-id",
    email: "maintenance@example.com",
    full_name: "Maintenance User",
    role: "maintenance" as const,
    avatar_url: "/leaky-pipe-under-sink.png",
  },
}

// Create the provider component
export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [role, setRole] = useState<string>("landlord")
  const [isLoading, setIsLoading] = useState(true)

  // Determine role from URL path
  useEffect(() => {
    setIsLoading(true)

    if (pathname?.includes("/admin")) {
      setRole("admin")
    } else if (pathname?.includes("/landlord")) {
      setRole("landlord")
    } else if (pathname?.includes("/tenant")) {
      setRole("tenant")
    } else if (pathname?.includes("/maintenance")) {
      setRole("maintenance")
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname])

  // Get the user based on the role
  const user = mockUsers[role as keyof typeof mockUsers] || null

  // Sign out function (just for completeness)
  const signOut = () => {
    console.log("Mock sign out")
  }

  // Refresh profile function (just for completeness)
  const refreshProfile = () => {
    console.log("Mock refresh profile")
  }

  // Refresh session function (just for completeness)
  const refreshSession = async () => {
    console.log("Mock refresh session")
    return Promise.resolve()
  }

  return (
    <MockAuthContext.Provider
      value={{
        user,
        role,
        setRole,
        signOut,
        isLoading,
        userRole: role,
        refreshProfile,
        refreshSession,
        userProfile: user,
      }}
    >
      {children}
    </MockAuthContext.Provider>
  )
}

// Create a hook to use the auth context
export function useMockAuth() {
  const context = useContext(MockAuthContext)
  if (context === undefined) {
    throw new Error("useMockAuth must be used within a MockAuthProvider")
  }
  return context
}

// For compatibility with existing code
export function useAuth() {
  return useMockAuth()
}

// Add default export
export default MockAuthProvider
