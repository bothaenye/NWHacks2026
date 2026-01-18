// hooks/usePostureStream.ts
import { useEffect, useRef, useState } from "react";

export interface PostureMetrics {
  neckAngle: number;
  shoulderTilt: number;
  stressScore?: number;
  status: "good" | "bad";
  message?: string;
}

interface UsePostureStreamOptions {
  backendUrl: string;
  fps?: number;
}

export const usePostureStream = ({ backendUrl, fps = 1 }: UsePostureStreamOptions) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [metrics, setMetrics] = useState<PostureMetrics | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start streaming
  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch (err: any) {
      setCameraError(err.message || "Failed to access camera");
      setStreaming(false);
    }
  };

  // Stop streaming
  const stopStreaming = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  };

  // Send frames to backend
  useEffect(() => {
    if (!streaming || !videoRef.current) return;

    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const frameBase64 = canvas.toDataURL("image/jpeg", 0.7);

      try {
        const response = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: frameBase64 })
        });
        const data: PostureMetrics = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error("Error sending frame to backend:", err);
      }
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [streaming, backendUrl, fps]);

  return { videoRef, metrics, streaming, startStreaming, stopStreaming, cameraError };
};


