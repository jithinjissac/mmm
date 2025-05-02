import { NextResponse } from "next/server"
import { uploadFile } from "@/lib/local-storage/upload-service"
import { getSession } from "@/lib/local-storage/auth-service"

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const { user } = await getSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the file from the request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Upload the file
    const url = await uploadFile(file)

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
