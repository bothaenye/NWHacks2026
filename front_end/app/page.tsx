'use client'

import { MetricCard } from '@/components/metric-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Activity, Camera, CameraOff, Lightbulb, Mic, MicOff, Settings, Zap } from 'lucide-react'
import { useState } from 'react'

import { useFrameCapture } from '@/hooks/useFrameCapture'
import { usePostureStream } from '@/hooks/usePostureStream'

export default function PostureDashboard() {
  const { videoRef, metrics, streaming, startStreaming, stopStreaming } =
    usePostureStream({ backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/', fps: 1 })
  const { captureFrame } = useFrameCapture()

  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const neckAngle = metrics?.neckAngle ?? 0
  const spineAlignment = metrics?.shoulderTilt ?? 0
  const screenDistance = metrics?.stressScore ?? 0
  const problems = metrics?.problems ?? []
  

  const neckData = [12, 13, 15, 14, 15, 16, 15]
  const spineData = [90, 91, 92, 91, 92, 93, 92]
  const distanceData = [60, 62, 65, 64, 65, 66, 65]

  const tips = [
    { id: 1, text: 'Shoulders back, chest open', priority: 'high' },
    { id: 2, text: 'Screen at eye level', priority: 'medium' },
    { id: 3, text: 'Take a break every 30 minutes', priority: 'low' },
  ]

  const getNeckStatus = () => {
    if (neckAngle > 20) return 'bad'
    if (neckAngle > 15) return 'warning'
    return 'good'
  }

  const getStatus = () => {
    if (!metrics || !metrics.status) return 'good';
  return metrics.status;
  } //metrics?.status ?? 'good'

  const getDistanceStatus = () => {
<<<<<<< HEAD
    if (screenDistance < 50) return 'bad'
    if (screenDistance < 60) return 'satisfactory'
    return 'good'
=======
    if (!screenDistance) return 'good';
    if (screenDistance < 50) return 'bad';
    if (screenDistance < 60) return 'warning';
    return 'good';
>>>>>>> f744d133ed09d4ebaee70d8c3e45f22ff705a92c
  }

  
  const handleStartStop = async () => {
    if (!streaming) {
      await startStreaming() // starts camera + streaming
    } else {
      stopStreaming()
      setIsVoiceActive(false)
    }
  }

  const handleCalibrate = () => {
    console.log('Calibrating posture baseline...')
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <img src="/favicon.svg" className="w-16 h-16"/>
              <span className="text-balance">Shrimply</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time posture monitoring
            </p>
          </div>
        </div>

        {/* Main Content - Camera */}
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

            {/* Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${
                streaming ? '' : 'hidden'
              }`}
            />

            {/* Placeholder */}
            {!streaming && (
              <div className="absolute inset-0 bg-gradient-to-br from-card via-card/50 to-secondary/30 flex items-center justify-center">
                <div className="text-center">
                  <CameraOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Camera feed inactive</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Click Start to begin monitoring
                  </p>
                </div>
              </div>
            )}

            {/* Floating Right Sidebar - Metrics */}
            <div className="absolute top-4 right-4 w-75 max-h-[calc(100%-2rem)] overflow-y-auto space-y-3 z-10 [&::-webkit-scrollbar]:hidden">
              {/*<MetricCard
                title="Neck Angle"
                value={neckAngle}
                unit="°"
                data={neckData}
                status={getNeckStatus()}
                icon={<Activity className="w-4 h-4" />}
              />*/}

              {/* <MetricCard
                title="Posture Status"
                value={spineAlignment}
                unit="%"
                data={spineData}
                status={getStatus()}
                icon={<Activity className="w-4 h-4" />}
              /> */}

              <MetricCard
                title="Problems"
                value={problems}
                status={getDistanceStatus()}
              />

              {/* <MetricCard
                title="Distance from Screen"
                value={screenDistance}
                unit="cm"
                data={distanceData}
                status={getDistanceStatus()}
                icon={<Activity className="w-4 h-4" />}
              /> */}

              {/* Quick Tips */}
              <Card className="p-4 glassmorphism border-border/50">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" /> Quick Tips
                  </h3>
                </div>
                <div className="space-y-2">
                  {tips.map((tip, index) => (
                    <div
                      key={tip.id}
                      className="text-sm text-foreground/80 p-2 bg-secondary/30 rounded-lg animate-fade-in border border-primary/10"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                            tip.priority === 'high'
                              ? 'bg-destructive'
                              : tip.priority === 'medium'
                              ? 'bg-yellow-500'
                              : 'bg-primary'
                          }`}
                        />
                        <span className="text-pretty">{tip.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
              <Button
                size="lg"
                onClick={handleStartStop}
                className={`rounded-full px-8 ${
                  streaming
                    ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {streaming ? (
                  <>
                    <CameraOff className="w-5 h-5 mr-2" /> Stop Monitoring
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" /> Start Monitoring
                  </>
                )}
              </Button>
              
              
              {/* <Button
                size="lg"
                variant="outline"
                onClick={handleCalibrate}
                disabled={!streaming}
                className="rounded-full px-8 border-primary/30 hover:bg-primary/10 bg-transparent"
              >
                <Zap className="w-5 h-5 mr-2" />
                Calibrate Posture
              </Button> */}
              

              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsVoiceActive(!isVoiceActive)}
                disabled={!streaming}
                className={`rounded-full px-8 border-primary/30 ${
                  isVoiceActive ? 'bg-primary/20 border-primary' : 'hover:bg-primary/10'
                }`}
              >
                {isVoiceActive ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" /> Disable Voice Coach
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" /> Enable Voice Coach
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

