// To handle access to webcam
import { useEffect, useRef, useState } from "react";

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true }); // uses Web API to allow access to media devices (for webcam)
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamActive(true);
      } catch (err: any) {
        setCameraError(err.message || "Failed to access camera");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return { videoRef, cameraError, streamActive };
};
