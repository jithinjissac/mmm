import { v4 as uuidv4 } from "uuid"
import { getLocalStorageData, saveLocalStorageData } from "./storage-service"

// Simulate network delay
const simulateNetworkDelay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// Function to convert a file to a data URL
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Generic file upload function
export async function uploadFile(
  file: File,
  path: string,
): Promise<{
  id: string
  url: string
  path: string
  filename: string
  content_type: string
  size: number
  created_at: string
}> {
  await simulateNetworkDelay()

  try {
    // Convert file to data URL
    const dataUrl = await fileToDataUrl(file)

    // Create file object
    const fileId = uuidv4()
    const fileObject = {
      id: fileId,
      url: dataUrl,
      path: `${path}/${file.name}`,
      filename: file.name,
      content_type: file.type,
      size: file.size,
      created_at: new Date().toISOString(),
    }

    return fileObject
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }
}

// Upload an image
export async function uploadImage(file: File, path: string): Promise<{ id: string; url: string; is_primary: boolean }> {
  await simulateNetworkDelay()

  try {
    // Convert file to data URL
    const dataUrl = await fileToDataUrl(file)

    // Create image object
    const imageId = uuidv4()
    const image = {
      id: imageId,
      url: dataUrl,
      is_primary: false, // Default to not primary
      path: `${path}/${file.name}`,
      filename: file.name,
      content_type: file.type,
      size: file.size,
      created_at: new Date().toISOString(),
    }

    return image
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}

// Delete an image
export async function deleteImage(imageId: string): Promise<boolean> {
  await simulateNetworkDelay()

  try {
    const data = getLocalStorageData()

    // Remove from property images
    data.property_images = data.property_images.filter((image) => image.id !== imageId)

    // Remove from room images
    data.room_images = data.room_images.filter((image) => image.id !== imageId)

    saveLocalStorageData(data)
    return true
  } catch (error) {
    console.error("Error deleting image:", error)
    throw new Error("Failed to delete image")
  }
}

// Get image by ID
export async function getImageById(imageId: string): Promise<any | null> {
  await simulateNetworkDelay()

  const data = getLocalStorageData()

  // Check property images
  let image = data.property_images.find((img) => img.id === imageId)

  // Check room images if not found
  if (!image) {
    image = data.room_images.find((img) => img.id === imageId)
  }

  return image || null
}

// Add image to property
export async function addImageToProperty(
  propertyId: string,
  image: { id: string; url: string; is_primary: boolean },
): Promise<boolean> {
  await simulateNetworkDelay()

  try {
    const data = getLocalStorageData()

    // Add image to property_images
    data.property_images.push({
      ...image,
      property_id: propertyId,
    })

    saveLocalStorageData(data)
    return true
  } catch (error) {
    console.error("Error adding image to property:", error)
    throw new Error("Failed to add image to property")
  }
}

// Add image to room
export async function addImageToRoom(
  roomId: string,
  image: { id: string; url: string; is_primary: boolean },
): Promise<boolean> {
  await simulateNetworkDelay()

  try {
    const data = getLocalStorageData()

    // Add image to room_images
    data.room_images.push({
      ...image,
      room_id: roomId,
    })

    saveLocalStorageData(data)
    return true
  } catch (error) {
    console.error("Error adding image to room:", error)
    throw new Error("Failed to add image to room")
  }
}
