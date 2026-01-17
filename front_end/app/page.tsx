'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MetricCard } from '@/components/metric-card'
import { WaveformVisualizer } from '@/components/waveform-visualizer'
import {
  Activity,
  AlertCircle,
  Camera,
  CameraOff,
  Lightbulb,
  Mic,
  MicOff,
  Settings,
  Zap,
} from 'lucide-react'

export default function PostureDashboard() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Mock data for demonstration
  const [neckAngle, setNeckAngle] = useState(15)
  const [spineAlignment, setSpineAlignment] = useState(92)
  const [screenDistance, setScreenDistance] = useState(65)
  const [stressScore, setStressScore] = useState(40) // Declare stressScore state

  const [neckData, setNeckData] = useState([12, 13, 15, 14, 15, 16, 15])
  const [spineData, setSpineData] = useState([90, 91, 92, 91, 92, 93, 92])
  const [distanceData, setDistanceData] = useState([60, 62, 65, 64, 65, 66, 65])
  const [stressData, setStressData] = useState([35, 40, 45, 40, 45, 50, 45]) // Declare stressData state

  const [tips, setTips] = useState([
    { id: 1, text: 'Shoulders back, chest open', priority: 'high' },
    { id: 2, text: 'Screen at eye level', priority: 'medium' },
    { id: 3, text: 'Take a break every 30 minutes', priority: 'low' },
  ])

  // Simulate data updates
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      // Update neck angle
      const newNeck = 10 + Math.random() * 15
      setNeckAngle(Math.round(newNeck))
      setNeckData((prev) => [...prev.slice(-6), Math.round(newNeck)])

      // Update spine alignment
      const newSpine = 85 + Math.random() * 10
      setSpineAlignment(Math.round(newSpine))
      setSpineData((prev) => [...prev.slice(-6), Math.round(newSpine)])

      // Update screen distance
      const newDistance = 55 + Math.random() * 20
      setScreenDistance(Math.round(newDistance))
      setDistanceData((prev) => [...prev.slice(-6), Math.round(newDistance)])

      // Update stress score
      const newStress = 30 + Math.random() * 70
      setStressScore(Math.round(newStress))
      setStressData((prev) => [...prev.slice(-6), Math.round(newStress)])

      // Randomly add tips
      if (Math.random() > 0.95 && tips.length < 5) {
        const newTips = [
          'Roll your shoulders back',
          'Adjust monitor height',
          'Check your lower back support',
          'Relax your jaw',
          'Blink more often',
        ]
        const randomTip = newTips[Math.floor(Math.random() * newTips.length)]
        setTips((prev) => [
          { id: Date.now(), text: randomTip, priority: 'medium' },
          ...prev.slice(0, 4),
        ])
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isMonitoring, tips.length])

  // Simulate speaking animation
  useEffect(() => {
    if (!isVoiceActive) {
      setIsSpeaking(false)
      return
    }

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsSpeaking(true)
        setTimeout(() => setIsSpeaking(false), 2000)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isVoiceActive])

  // Draw skeleton overlay
  useEffect(() => {
    if (!canvasRef.current || !isMonitoring) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawSkeleton = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw simple skeleton landmarks
      const points = [
        { x: 0.5, y: 0.2 }, // head
        { x: 0.5, y: 0.3 }, // neck
        { x: 0.5, y: 0.5 }, // spine
        { x: 0.4, y: 0.35 }, // left shoulder
        { x: 0.6, y: 0.35 }, // right shoulder
      ]

      ctx.strokeStyle = neckAngle > 20 ? '#ef4444' : '#3b82f6'
      ctx.lineWidth = 3
      ctx.shadowBlur = 10
      ctx.shadowColor = neckAngle > 20 ? '#ef4444' : '#3b82f6'

      // Draw connections
      ctx.beginPath()
      points.forEach((point, index) => {
        const x = point.x * canvas.width
        const y = point.y * canvas.height
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Draw points
      ctx.fillStyle = neckAngle > 20 ? '#ef4444' : '#3b82f6'
      points.forEach((point) => {
        ctx.beginPath()
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 6, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const animationId = setInterval(drawSkeleton, 100)
    return () => clearInterval(animationId)
  }, [isMonitoring, neckAngle])

  const handleStartStop = async () => {
    if (!isMonitoring) {
      // Start camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setIsMonitoring(true)
      } catch (err) {
        console.error('[v0] Error accessing camera:', err)
        alert('Unable to access camera. Please grant camera permissions.')
      }
    } else {
      // Stop camera
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
      setIsMonitoring(false)
      setIsVoiceActive(false)
    }
  }

  const handleCalibrate = () => {
    // Calibration logic
    console.log('[v0] Calibrating posture baseline...')
  }

  const getNeckStatus = () => {
    if (neckAngle > 20) return 'error'
    if (neckAngle > 15) return 'warning'
    return 'good'
  }

  const getSpineStatus = () => {
    if (spineAlignment < 85) return 'error'
    if (spineAlignment < 90) return 'warning'
    return 'good'
  }

  const getDistanceStatus = () => {
    if (screenDistance < 50) return 'error'
    if (screenDistance < 60) return 'warning'
    return 'good'
  }

  const getStressStatus = () => {
    if (stressScore > 70) return 'error'
    if (stressScore > 50) return 'warning'
    return 'good'
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              <span className="text-balance">PostureGuard AI</span>
            </h1>
            <p className="text-muted-foreground mt-1">Real-time posture monitoring & AI coaching</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Content - Camera with Floating Overlays */}
        <div className="relative">
          <Card
            className={`relative aspect-video bg-card/30 backdrop-blur-sm border-2 overflow-hidden ${
              isMonitoring
                ? neckAngle > 20
                  ? 'neon-glow-red border-destructive/50'
                  : 'neon-glow border-primary/50'
                : 'border-border'
            } transition-all duration-300`}
          >
            {/* Video element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Placeholder when camera is off */}
            {!isMonitoring && (
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

            {/* Canvas overlay for skeleton */}
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Status badge */}
            {isMonitoring && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 glassmorphism rounded-full z-10">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-xs font-medium text-foreground">LIVE</span>
              </div>
            )}

            {/* Floating Right Sidebar - Metrics & Tips */}
            <div className="absolute top-4 right-4 w-80 max-h-[calc(100%-2rem)] overflow-y-auto space-y-3 z-10">
              {/* Real-time Metrics */}
              <div className="space-y-3">
                <MetricCard
                  title="Neck Angle"
                  value={neckAngle}
                  unit="°"
                  data={neckData}
                  status={getNeckStatus()}
                  icon={<Activity className="w-4 h-4" />}
                />
                <MetricCard
                  title="Spine Alignment"
                  value={spineAlignment}
                  unit="%"
                  data={spineData}
                  status={getSpineStatus()}
                  icon={<Activity className="w-4 h-4" />}
                />
                <MetricCard
                  title="Distance from Screen"
                  value={screenDistance}
                  unit="cm"
                  data={distanceData}
                  status={getDistanceStatus()}
                  icon={<Activity className="w-4 h-4" />}
                />
              </div>

              {/* Posture Tips */}
              <Card className="p-4 glassmorphism border-border/50">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    Quick Tips
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

            {/* Floating Bottom Center - AI Voice Coach */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <Card className="p-4 glassmorphism border-primary/30 min-w-[300px]">
                <div className="mb-3 text-center">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center justify-center gap-2">
                    <Mic className="w-3 h-3 text-primary" />
                    AI Voice Coach
                  </h3>
                </div>
                <WaveformVisualizer isActive={isSpeaking} />
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {isVoiceActive
                    ? isSpeaking
                      ? 'Coach is speaking...'
                      : 'Coach is listening...'
                    : 'Voice coach inactive'}
                </p>
              </Card>
            </div>

            {/* Warning overlay */}
            {isMonitoring && neckAngle > 20 && (
              <div className="absolute bottom-24 left-4 right-4 glassmorphism rounded-lg p-4 border border-destructive/50 z-10">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Poor Posture Detected</p>
                    <p className="text-xs text-muted-foreground">
                      Adjust your neck angle and sit upright
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Bottom Controls */}
        <div className="mt-6 glassmorphism rounded-2xl p-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button
              size="lg"
              onClick={handleStartStop}
              className={`rounded-full px-8 ${
                isMonitoring
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              {isMonitoring ? (
                <>
                  <CameraOff className="w-5 h-5 mr-2" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Start Monitoring
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleCalibrate}
              disabled={!isMonitoring}
              className="rounded-full px-8 border-primary/30 hover:bg-primary/10 bg-transparent"
            >
              <Zap className="w-5 h-5 mr-2" />
              Calibrate Posture
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsVoiceActive(!isVoiceActive)}
              disabled={!isMonitoring}
              className={`rounded-full px-8 border-primary/30 ${
                isVoiceActive ? 'bg-primary/20 border-primary' : 'hover:bg-primary/10'
              }`}
            >
              {isVoiceActive ? (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  Disable Voice Coach
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Enable Voice Coach
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
