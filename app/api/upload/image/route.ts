import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string
    const id = formData.get("id") as string
    const isPrimary = formData.get("isPrimary") === "true"

    if (!file || !type || !id) {
      return NextResponse.json({ error: "Missing required fields: file, type, id" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds the 5MB limit." }, { status: 400 })
    }

    // Determine storage path based on type
    let storagePath = ""
    let tableName = ""
    let columnName = ""

    switch (type) {
      case "property":
        storagePath = "properties"
        tableName = "property_images"
        columnName = "property_id"
        break
      case "room":
        storagePath = "rooms"
        tableName = "room_images"
        columnName = "room_id"
        break
      case "profile":
        storagePath = "profiles"
        tableName = null // For profiles, we update the profile record directly
        columnName = null
        break
      default:
        return NextResponse.json({ error: "Invalid type. Must be 'property', 'room', or 'profile'." }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${storagePath}/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("uk-rental-solution")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("uk-rental-solution").getPublicUrl(filePath)

    // If it's a profile image, update the profile
    if (type === "profile") {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", session.user.id)

      if (updateError) {
        console.error("Error updating profile:", updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ url: publicUrl })
    }

    // For property and room images, insert into the appropriate table

    // If this is a primary image, update all other images to not be primary
    if (isPrimary) {
      await supabase.from(tableName).update({ is_primary: false }).eq(columnName, id)
    }

    // Insert the new image record
    const { data: imageData, error: imageError } = await supabase
      .from(tableName)
      .insert({
        [columnName]: id,
        url: publicUrl,
        is_primary: isPrimary,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (imageError) {
      console.error("Error inserting image record:", imageError)
      return NextResponse.json({ error: imageError.message }, { status: 500 })
    }

    return NextResponse.json({ image: imageData })
  } catch (error) {
    console.error("Error in image upload API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
