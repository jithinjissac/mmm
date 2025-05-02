/**
 * Clears all Supabase cookies from the browser
 */
export function clearSupabaseCookies() {
  if (typeof window === "undefined") return

  console.log("Manual cookie clearing requested")

  // Only clear cookies when explicitly requested, not automatically
  const allCookies = document.cookie.split(";")
  for (const cookie of allCookies) {
    const [name] = cookie.split("=")
    if (name.trim().startsWith("sb-")) {
      document.cookie = `${name.trim()}=; Max-Age=0; path=/; domain=${window.location.hostname}`
    }
  }

  // Also clear localStorage items related to Supabase
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith("sb-")) {
      localStorage.removeItem(key)
    }
  }
}

/**
 * Checks if there are any corrupted Supabase cookies
 * This function is now more conservative about what it considers "corrupted"
 */
export function hasCorruptedSupabaseCookies(): boolean {
  if (typeof window === "undefined") return false

  try {
    // Don't automatically detect corruption - this was causing false positives
    // Only return true for very obvious corruption cases

    const allCookies = document.cookie.split(";")
    for (const cookie of allCookies) {
      const [name, value] = cookie.split("=").map((part) => part.trim())
      if (name.startsWith("sb-") && value) {
        // Only consider it corrupted if it's clearly malformed
        // (empty or obviously broken)
        if (!value || value === "undefined" || value === "null") {
          console.log("Found clearly corrupted cookie:", name)
          return true
        }
      }
    }
    return false
  } catch (error) {
    console.error("Error checking for corrupted cookies:", error)
    return false // Changed to false - don't assume corrupted on error
  }
}
