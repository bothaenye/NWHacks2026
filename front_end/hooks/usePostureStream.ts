import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useFrameCapture } from "./useFrameCapture"

export interface PostureMetrics {
    neckAngle: number
    shoulderTilt: number
    stressScore?: number
    status: "good" | "bad"
    message?: string
}

interface UsePostureStreamOptions {
    backendUrl: string
    fps?: number
}

export const usePostureStream = ({ backendUrl, fps = 2 }: UsePostureStreamOptions) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const socketRef = useRef<Socket | null>(null)
    const [metrics, setMetrics] = useState<PostureMetrics | null>(null)
    const [streaming, setStreaming] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)

    const { captureFrame } = useFrameCapture()

    // Start the camera and streaming
    const startStreaming = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
            }

            // Initialize Socket.io connection
            // Extract base URL from backendUrl if it contains path, or assume backendUrl is root
            // For now, using the URL passed in directly (e.g. http://localhost:5000)
            const socket = io(backendUrl)
            socketRef.current = socket

            socket.on("connect", () => {
                console.log("Connected to Socket.io via hook")
            })

            socket.on("frame_return", (response: any) => {
                // Backend currently sends string "good" | "bad"
                // Map string response to PostureMetrics object for consistency
                console.log(response)
                if (typeof response === 'string') {
                    setMetrics((prev) => ({
                        ...prev,
                        status: response as "good" | "bad",
                        // Keep previous numeric values if just string update, or default 
                        neckAngle: prev?.neckAngle ?? (response === 'good' ? 15 : 35),
                        shoulderTilt: prev?.shoulderTilt ?? (response === 'good' ? 95 : 75),
                        stressScore: prev?.stressScore ?? (response === 'good' ? 25 : 75),
                    }))
                } else {
                    // If backend sends full object later
                    setMetrics(response)
                }
            })

            socket.on("connect_error", (err) => {
                console.error("Socket connection error:", err)
            })

            setStreaming(true)
        } catch (err: any) {
            setCameraError(err.message || "Failed to access camera")
            setStreaming(false)
        }
    }

    // Stop streaming
    const stopStreaming = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
            videoRef.current.srcObject = null
        }

        if (socketRef.current) {
            socketRef.current.disconnect()
            socketRef.current = null
        }

        setStreaming(false)
    }

    // Send frames to backend via Socket.io while streaming
    useEffect(() => {
        if (!streaming || !videoRef.current || !socketRef.current) return

        const interval = setInterval(() => {
            if (!videoRef.current || !socketRef.current?.connected) return

            const frameBase64 = captureFrame(videoRef.current)
            if (frameBase64) {
                socketRef.current.emit("frame", { frame: frameBase64 })
            }
        }, 1000 / fps)

        return () => clearInterval(interval)
    }, [streaming, fps, captureFrame]) // Added captureFrame to deps

    return { videoRef, metrics, streaming, startStreaming, stopStreaming, cameraError }
}



