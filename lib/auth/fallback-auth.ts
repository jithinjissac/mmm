// This file provides fallback authentication mechanisms for when the primary auth system is unavailable

import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type UserWithProfile = User & { profile: Profile | null }

// Local storage keys
const USER_STORAGE_KEY = "uk_rental_app_auth_user"
const PROFILE_STORAGE_KEY = "uk_rental_app_auth_profile"

// Save user data to local storage
export function saveUserToLocalStorage(user: User | null): void {
  if (typeof window === "undefined") return

  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  } catch (error) {
    console.warn("Failed to save user to local storage:", error)
  }
}

// Get user data from local storage
export function getUserFromLocalStorage(): User | null {
  if (typeof window === "undefined") return null

  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY)
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.warn("Failed to get user from local storage:", error)
    return null
  }
}

// Save profile data to local storage
export function saveProfileToLocalStorage(userId: string, profile: Profile | null): void {
  if (typeof window === "undefined") return

  try {
    if (profile) {
      localStorage.setItem(`${PROFILE_STORAGE_KEY}_${userId}`, JSON.stringify(profile))
    } else {
      localStorage.removeItem(`${PROFILE_STORAGE_KEY}_${userId}`)
    }
  } catch (error) {
    console.warn("Failed to save profile to local storage:", error)
  }
}

// Get profile data from local storage
export function getProfileFromLocalStorage(userId: string): Profile | null {
  if (typeof window === "undefined") return null

  try {
    const profileData = localStorage.getItem(`${PROFILE_STORAGE_KEY}_${userId}`)
    return profileData ? JSON.parse(profileData) : null
  } catch (error) {
    console.warn("Failed to get profile from local storage:", error)
    return null
  }
}

// Get combined user and profile data from local storage
export function getUserWithProfileFromLocalStorage(): UserWithProfile | null {
  const user = getUserFromLocalStorage()

  if (!user) return null

  const profile = getProfileFromLocalStorage(user.id)
  return { ...user, profile }
}

// Clear all auth data from local storage
export function clearAuthFromLocalStorage(): void {
  if (typeof window === "undefined") return

  try {
    // Get all keys that start with our prefix
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith(USER_STORAGE_KEY) || key.startsWith(PROFILE_STORAGE_KEY))) {
        keys.push(key)
      }
    }

    // Remove all matching keys
    keys.forEach((key) => localStorage.removeItem(key))
  } catch (error) {
    console.warn("Failed to clear auth data from local storage:", error)
  }
}
