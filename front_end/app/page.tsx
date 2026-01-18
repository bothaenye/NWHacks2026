'use client'

import { MetricCard } from '@/components/metric-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, CameraOff, Lightbulb, Mic, MicOff } from 'lucide-react'
import { useState } from 'react'

import { useFrameCapture } from '@/hooks/useFrameCapture'
import { usePostureStream } from '@/hooks/usePostureStream'

// 1. Define the shape of your metrics
interface PostureMetrics {
  neckAngle: number;
  shoulderTilt: number;
  stressScore: number;
  status: 'good' | 'satisfactory' | 'bad';
  problems: string[];
}

export default function PostureDashboard() {
  // 2. Ensure your hook is typed (or use 'as any' if you haven't typed the hook yet)
  const { videoRef, metrics, streaming, startStreaming, stopStreaming } =
    usePostureStream({ 
      backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/', 
      fps: 1 
    }) as { 
      videoRef: React.RefObject<HTMLVideoElement>, 
      metrics: PostureMetrics | null, 
      streaming: boolean, 
      startStreaming: () => Promise<void>, 
      stopStreaming: () => void 
    };

  const { captureFrame } = useFrameCapture();

  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Fallback values for safety
  const problems = metrics?.problems ?? [];
  const screenDistance = metrics?.stressScore ?? 0;

  const tips = [
    { id: 1, text: 'Shoulders back, chest open', priority: 'high' },
    { id: 2, text: 'Screen at eye level', priority: 'medium' },
    { id: 3, text: 'Take a break every 30 minutes', priority: 'low' },
  ];

  const getStatus = (): string => {
    return metrics?.status ?? 'good';
  }

  const getDistanceStatus = (): "good" | "warning" | "bad" => {
    if (!screenDistance) return 'good';
    if (screenDistance < 50) return 'bad';
    if (screenDistance < 60) return 'warning';
    return 'good';
  }

  const handleStartStop = async () => {
    if (!streaming) {
      await startStreaming()
    } else {
      stopStreaming()
      setIsVoiceActive(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <img src="/favicon.svg" className="w-16 h-16" alt="Logo"/>
              <span className="text-balance">Shrimply</span>
            </h1>
            <p className="text-muted-foreground mt-1">Real-time posture monitoring</p>
          </div>
        </div>

        <div className="relative">
          <Card
            className={`relative aspect-video scanlines bg-card/30 backdrop-blur-sm border-2 overflow-hidden transition-all duration-300 ${
              streaming
                ? getStatus() === 'bad'
                  ? 'neon-glow-red border-destructive/50 video-tint-bad'
                  : getStatus() === 'satisfactory'
                  ? 'neon-glow-yellow border-yellow-500/50 video-tint-warning'
                  : 'neon-glow video-tint-good'
                : 'border-border'
            }`}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${streaming ? '' : 'hidden'}`}
            />

            {!streaming && (
              <div className="absolute inset-0 bg-gradient-to-br from-card via-card/50 to-secondary/30 flex items-center justify-center">
                <div className="text-center">
                  <CameraOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Camera feed inactive</p>
                </div>
              </div>
            )}

            <div className="absolute top-4 right-4 w-75 max-h-[calc(100%-2rem)] overflow-y-auto space-y-3 z-10 [&::-webkit-scrollbar]:hidden">
              <MetricCard
                title="Problems"
                value={problems.length > 0 ? problems.join(', ') : "None"}
                status={getDistanceStatus()}
              />

              <Card className="p-4 glassmorphism border-border/50">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" /> Quick Tips
                  </h3>
                </div>
                <div className="space-y-2">
                  {tips.map((tip, index) => (
                    <div key={tip.id} className="text-sm text-foreground/80 p-2 bg-secondary/30 rounded-lg border border-primary/10">
                      <div className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${tip.priority === 'high' ? 'bg-destructive' : tip.priority === 'medium' ? 'bg-yellow-500' : 'bg-primary'}`} />
                        <span>{tip.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
              <Button size="lg" onClick={handleStartStop} className={`rounded-full px-8 ${streaming ? 'bg-destructive' : 'bg-primary'}`}>
                {streaming ? <><CameraOff className="mr-2" /> Stop</> : <><Camera className="mr-2" /> Start</>}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsVoiceActive(!isVoiceActive)}
                disabled={!streaming}
                className="rounded-full px-8"
              >
                {isVoiceActive ? <><MicOff className="mr-2" /> Off</> : <><Mic className="mr-2" /> On</>}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}