"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { useVerification } from "@/lib/verification/verification-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DocumentUpload() {
  const { verificationState, uploadDocument } = useVerification()
  const [activeTab, setActiveTab] = useState("id-front")
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "idFront" | "idBack") => {
    setError(null)
    const file = event.target.files?.[0]

    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are accepted")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      uploadDocument(type, result)

      // Move to next tab if on front ID
      if (type === "idFront") {
        setActiveTab("id-back")
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Upload Identification Document</h3>
        <p className="text-sm text-muted-foreground">
          Please upload a clear photo of your government-issued ID (passport, driver's license, or national ID card).
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="id-front">Front of ID</TabsTrigger>
          <TabsTrigger value="id-back">Back of ID</TabsTrigger>
        </TabsList>
        <TabsContent value="id-front" className="mt-4">
          {verificationState.documents.idFront ? (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={verificationState.documents.idFront || "/placeholder.svg"}
                  alt="Front of ID"
                  className="w-full object-contain max-h-[300px]"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => document.getElementById("id-front-upload")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Replace Image
              </Button>
              <input
                id="id-front-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "idFront")}
              />
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10 px-6">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="font-medium">Upload Front of ID</h3>
                  <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                  <div className="flex justify-center">
                    <Button variant="secondary" onClick={() => document.getElementById("id-front-upload")?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                    <input
                      id="id-front-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "idFront")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="id-back" className="mt-4">
          {verificationState.documents.idBack ? (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={verificationState.documents.idBack || "/placeholder.svg"}
                  alt="Back of ID"
                  className="w-full object-contain max-h-[300px]"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => document.getElementById("id-back-upload")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Replace Image
              </Button>
              <input
                id="id-back-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "idBack")}
              />
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10 px-6">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="font-medium">Upload Back of ID</h3>
                  <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                  <div className="flex justify-center">
                    <Button variant="secondary" onClick={() => document.getElementById("id-back-upload")?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                    <input
                      id="id-back-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "idBack")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="space-y-2 bg-muted p-4 rounded-lg">
        <h4 className="text-sm font-medium">Requirements:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Clear, color images (no black and white)</li>
          <li>• All four corners visible</li>
          <li>• No glare or shadows</li>
          <li>• File size under 5MB</li>
          <li>• Accepted formats: JPG, PNG</li>
        </ul>
      </div>
    </div>
  )
}
