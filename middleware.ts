import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/signin", "/signup"]

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith("/auth/"),
  )

  // Auth routes handling (signin, signup)
  if (["/signin", "/signup"].includes(request.nextUrl.pathname)) {
    // If user is already logged in, redirect to dashboard
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Otherwise, allow access to auth pages
    return response
  }

  // Protected routes handling - all routes except public ones
  if (!isPublicRoute) {
    // If user is not logged in, redirect to signin
    if (!session) {
      // Store the original URL to redirect back after login
      const redirectUrl = new URL("/signin", request.url)
      redirectUrl.searchParams.set("redirectUrl", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

// Specify which paths this middleware should run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
