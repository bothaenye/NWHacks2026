// Convert to proper format for backend (Base64 JPEG)
import { useRef } from "react";

export const useFrameCapture = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const captureFrame = (video: HTMLVideoElement): string | null => {
    if (!video) return null; // if video is not ready

    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = 640; 
    canvas.height = 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // draws current video frame onto the canvas

    if (!canvasRef.current) canvasRef.current = canvas;

    // Convert canvas to Base64 JPEG to send to backend
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    return dataUrl;
  };

  return { captureFrame };
};
