/**
 * Generate a simple SVG blur placeholder
 * @returns Base64 encoded SVG for use as a blur placeholder
 */
export function generateBlurPlaceholder() {
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
}

/**
 * Get appropriate image sizes based on breakpoints
 * @param type The type of image (property, room, etc.)
 * @returns Sizes string for Next.js Image component
 */
export function getImageSizes(type: "property" | "room" | "gallery" | "avatar" = "property") {
  switch (type) {
    case "property":
      return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    case "room":
      return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    case "gallery":
      return "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
    case "avatar":
      return "40px"
    default:
      return "100vw"
  }
}

/**
 * Preload critical images
 * @param urls Array of image URLs to preload
 */
export function preloadImages(urls: string[]) {
  if (typeof window === "undefined") return

  urls.forEach((url) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = url
    document.head.appendChild(link)
  })
}
