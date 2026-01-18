import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useFrameCapture } from "./useFrameCapture"

export interface PostureMetrics {
    neckAngle: number
    shoulderTilt: number
    stressScore?: number
    problems: string[]
    status: "good" | "bad" | "satisfactory"

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

	// audio
	const badPostureAudioRef = useRef<HTMLAudioElement | null>(null)
    if (!badPostureAudioRef.current) {
        badPostureAudioRef.current = new Audio("/uncurl.mp3")
    }

	// Unlock audio once streaming starts (browser requires a user interaction)
	useEffect(() => {
		if (streaming && badPostureAudioRef.current) {
			badPostureAudioRef.current.play()
				.then(() => {
					badPostureAudioRef.current?.pause(); // pause immediately
					if (badPostureAudioRef.current) badPostureAudioRef.current.currentTime = 0; // reset
				})
				.catch(() => {
					console.log("Audio unlock failed");
				});
		}
	}, [streaming]);

	// end of audio addition

    const startStreaming = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
            }

            //const socket = io(backendUrl)
            const socket = io(process.env.NEXT_PUBLIC_API_URL || backendUrl)
            socketRef.current = socket

            socket.on("connect", () => {
                console.log("Connected to Socket.io via hook")
            })

            // socket.on("frame_return", (response: any) => {
            //     console.log(response["issues"])
            //     if (typeof response === 'object') {
            //         setMetrics((prev) => ({
            //             ...prev,
            //             status: response["posture"] as "good" | "bad" | "satisfactory",
            //             problems: response["issues"],
            //             neckAngle: prev?.neckAngle ?? (response === 'good' ? 15 : 35),
            //             shoulderTilt: prev?.shoulderTilt ?? (response === 'good' ? 95 : 75),
            //             stressScore: prev?.stressScore ?? (response === 'good' ? 25 : 75),
			// 		}
			// 	))
            //     } else {
            //         // If backend sends full object later
            //         setMetrics(response)
            //     }
            // })

			socket.on("frame_return", (response: any) => {
				console.log(response["issues"]);
			
				setMetrics((prev) => {
					const newStatus = response.posture as "good" | "bad" | "satisfactory";
			
					if (newStatus === "bad" && prev?.status !== "bad") {
						if (badPostureAudioRef.current) badPostureAudioRef.current.volume = 1.0;
						badPostureAudioRef.current?.play().catch(() => {});
						console.log("should play voice");
					}
			
					return {
						...prev, // keeps any other fields if you need them
						status: newStatus,
						problems: response.issues ?? [],
						neckAngle: response.neck_angle ?? 0,
						shoulderTilt: response.shoulder_tilt ?? 0,
						stressScore: response.stress_score ?? 0,
					};
				});
			});
			

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
    }, [streaming, fps, captureFrame]) 

    return { videoRef, metrics, streaming, startStreaming, stopStreaming, cameraError }
}



