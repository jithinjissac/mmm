// Make sure the dashboard layout is protected and uses the auth context

import { AuthProvider } from "@/lib/auth/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import type React from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-10 border-b bg-background">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
              <div className="font-semibold">UK Rental Solution</div>
              <UserNav />
            </div>
          </header>
          <div className="flex flex-1">
            <aside className="hidden w-64 border-r md:block">
              <DashboardNav />
            </aside>
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}
