"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Camera, RefreshCw, X, AlertCircle } from "lucide-react"
import { useVerification } from "@/lib/verification/verification-context"

export function SelfieCapture() {
  const { uploadDocument, verificationState } = useVerification()
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isVideoVisible, setIsVideoVisible] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Stop camera - define this first since other functions depend on it
  const stopCamera = useCallback(() => {
    console.log("Stopping camera...")
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log("Stopping track:", track.kind, track.label)
        track.stop()
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsCameraActive(false)
    setIsVideoVisible(false)
    console.log("Camera stopped")
  }, [])

  // Capture to canvas helper function
  const captureToCanvas = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480

      console.log("Capturing image with dimensions:", canvas.width, "x", canvas.height)

      const context = canvas.getContext("2d")
      if (context) {
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        try {
          // Convert to image
          const selfieImage = canvas.toDataURL("image/png")
          console.log("Image captured successfully")

          // Use setTimeout to defer the state update to the next tick
          // This prevents the "setState during render" error
          setTimeout(() => {
            uploadDocument("selfie", selfieImage)
          }, 0)

          stopCamera()
        } catch (err) {
          console.error("Error capturing image:", err)
          setError("Failed to capture image. Please try again.")
        }
      }
    } else {
      console.error("Video or canvas ref is null during capture")
      setError("Could not capture image. Please try again.")
    }
  }, [uploadDocument, stopCamera, setError])

  // Start camera with enhanced error handling and visibility checks
  const startCamera = useCallback(async () => {
    try {
      setError(null)
      console.log("Requesting camera access...")

      // Make sure we're mounted before proceeding
      if (!videoRef.current) {
        console.log("Video element not yet available, waiting...")
        // Wait a short time for the ref to be available
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Check again after waiting
        if (!videoRef.current) {
          console.error("Video ref still null after waiting")
          setError("Camera initialization failed. Please try again.")
          return
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      console.log("Camera access granted, setting up video element...")
      streamRef.current = stream

      // Double check that videoRef is still valid
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.style.display = "block" // Ensure video is visible
        videoRef.current.style.width = "100%"
        videoRef.current.style.height = "auto"

        // Set up event listeners to track video playback
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded")
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                console.log("Video playback started")
                setIsCameraActive(true)
                setIsVideoVisible(true)
              })
              .catch((err) => {
                console.error("Error starting video playback:", err)
                setError("Could not start video playback. Please try again.")
              })
          }
        }

        videoRef.current.onerror = (e) => {
          console.error("Video element error:", e)
          setError("Error with video display. Please try again or use a different browser.")
        }
      } else {
        console.error("Video ref became null during setup")
        setError("Could not initialize video element. Please try again.")
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError(
        "Could not access camera. Please ensure you've granted camera permissions and are using a supported browser.",
      )
    }
  }, [setError])

  // Cleanup on unmount
  useEffect(() => {
    console.log("SelfieCapture component mounted, videoRef available:", !!videoRef.current)

    // Clean up function
    return () => {
      console.log("SelfieCapture component unmounting")
      stopCamera()
    }
  }, [stopCamera])

  // Check if video is actually displaying
  useEffect(() => {
    if (isCameraActive && videoRef.current) {
      // Check if video dimensions are available
      const checkVideoVisibility = setInterval(() => {
        if (videoRef.current && videoRef.current.videoWidth > 0) {
          console.log(
            "Video is displaying with dimensions:",
            videoRef.current.videoWidth,
            "x",
            videoRef.current.videoHeight,
          )
          setIsVideoVisible(true)
          clearInterval(checkVideoVisibility)
        }
      }, 500)

      // Clear interval after 10 seconds to prevent infinite checking
      setTimeout(() => {
        clearInterval(checkVideoVisibility)
        if (!isVideoVisible && isCameraActive) {
          console.warn("Video may not be displaying properly after 10 seconds")
        }
      }, 10000)

      return () => clearInterval(checkVideoVisibility)
    }
  }, [isCameraActive, isVideoVisible])

  // Take photo with countdown
  const takePhoto = useCallback(() => {
    setCountdown(3)

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval)

          // Take the actual photo
          captureToCanvas()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [captureToCanvas])

  // Capture photo directly without countdown
  const captureNow = useCallback(() => {
    captureToCanvas()
  }, [captureToCanvas])

  // Retake photo
  const retakePhoto = useCallback(() => {
    startCamera()
  }, [startCamera])

  // Fallback capture method (in case video isn't visible)
  const blindCapture = useCallback(() => {
    console.log("Attempting blind capture...")
    if (streamRef.current && canvasRef.current) {
      // Create a temporary video element
      const tempVideo = document.createElement("video")
      tempVideo.srcObject = streamRef.current
      tempVideo.autoplay = true
      tempVideo.muted = true
      tempVideo.onloadedmetadata = () => {
        tempVideo.play()
        // Wait a moment to ensure the video is playing
        setTimeout(() => {
          const canvas = canvasRef.current
          if (canvas) {
            canvas.width = 640
            canvas.height = 480
            const context = canvas.getContext("2d")
            if (context) {
              context.drawImage(tempVideo, 0, 0, canvas.width, canvas.height)
              try {
                const selfieImage = canvas.toDataURL("image/png")

                // Use setTimeout to defer the state update
                setTimeout(() => {
                  uploadDocument("selfie", selfieImage)
                }, 0)

                console.log("Blind capture successful")
              } catch (err) {
                console.error("Error in blind capture:", err)
                setError("Failed to capture image. Please try again.")
              }
            }
          }
          stopCamera()
        }, 1000)
      }
    }
  }, [uploadDocument, stopCamera, setError])

  // Add a fallback mechanism for when the video ref is null
  const ensureVideoRef = useCallback(() => {
    if (!videoRef.current && typeof document !== "undefined") {
      console.log("Creating fallback video element")
      // Create a new video element if the ref is null
      const videoElement = document.createElement("video")
      videoElement.autoplay = true
      videoElement.playsInline = true
      videoElement.muted = true
      videoElement.style.width = "100%"
      videoElement.style.height = "auto"

      // Try to append it to the DOM temporarily to ensure it's initialized
      const container = document.createElement("div")
      container.style.position = "absolute"
      container.style.opacity = "0"
      container.style.pointerEvents = "none"
      container.appendChild(videoElement)
      document.body.appendChild(container)

      // Set the ref manually
      videoRef.current = videoElement

      // Clean up function to remove the element later
      setTimeout(() => {
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      }, 5000)

      return true
    }
    return !!videoRef.current
  }, [])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Take a Selfie</h3>
        <p className="text-sm text-muted-foreground">
          Please take a clear photo of your face to verify your identity. Make sure your face is well-lit and centered
          in the frame.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Camera Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="relative">
        {verificationState?.documents?.selfie ? (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <img
                src={verificationState.documents.selfie || "/placeholder.svg"}
                alt="Selfie"
                className="w-full object-contain max-h-[300px]"
              />
            </div>
            <Button variant="outline" onClick={retakePhoto} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake Selfie
            </Button>
          </div>
        ) : (
          <Card className="overflow-hidden">
            {isCameraActive ? (
              <>
                <CardContent className="p-0 relative min-h-[300px] flex items-center justify-center bg-gray-100">
                  {!isVideoVisible && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-10">
                      <Camera className="h-12 w-12 mb-2 animate-pulse" />
                      <p>Camera is active but video may not be displaying</p>
                      <p className="text-sm mt-1">You can still try to capture a photo</p>
                    </div>
                  )}
                  {/* Always render the video element, even if not visible yet */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-auto ${isVideoVisible ? "opacity-100" : "opacity-30"}`}
                    style={{ minHeight: "200px" }}
                  />
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                      <span className="text-6xl font-bold text-white">{countdown}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2 p-4 bg-muted/50">
                  <Button onClick={takePhoto} className="w-full" disabled={countdown !== null} size="lg">
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo (3s Countdown)
                  </Button>
                  <Button onClick={captureNow} variant="secondary" className="w-full" disabled={countdown !== null}>
                    Capture Now
                  </Button>
                  {!isVideoVisible && (
                    <Button
                      onClick={blindCapture}
                      variant="destructive"
                      className="w-full"
                      disabled={countdown !== null}
                    >
                      Emergency Capture (No Preview)
                    </Button>
                  )}
                  <Button onClick={stopCamera} variant="outline" className="w-full">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </CardFooter>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center py-10 px-6">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="font-medium">Camera Access Required</h3>
                  <p className="text-sm text-muted-foreground">We need access to your camera to take a selfie</p>
                  <div className="flex justify-center pt-2">
                    <Button
                      onClick={() => {
                        ensureVideoRef()
                        startCamera()
                      }}
                      size="lg"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Start Camera
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Hidden canvas for capturing the image */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="space-y-2 bg-muted p-4 rounded-lg">
        <h4 className="text-sm font-medium">Tips for a good selfie:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Ensure your face is clearly visible</li>
          <li>• Use good lighting (avoid shadows on your face)</li>
          <li>• Remove sunglasses, hats, or masks</li>
          <li>• Look directly at the camera</li>
          <li>• Keep a neutral expression</li>
        </ul>
      </div>
    </div>
  )
}
