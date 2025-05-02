// Re-export all auth-related components and hooks from a single file
// This helps avoid import inconsistencies across the application

// Update the import path to correctly point to the mock-auth-provider
export { useAuth, useMockAuth } from "@/components/mock-auth-provider"
export { default as MockAuthProvider } from "@/components/mock-auth-provider"
export { default as WithAuthProtection } from "@/components/auth/with-auth-protection"
export { default as AuthErrorBoundary } from "@/components/auth/auth-error-boundary"
export { default as SignIn } from "@/components/auth/sign-in"
export { default as SignUp } from "@/components/auth/sign-up"

// Re-export auth utility functions
export * from "@/lib/utils/auth-helpers"
export * from "@/lib/utils/auth-error-handler"

export * from "./auth-service"
export * from "./auth-context"
export * from "./fallback-auth"
