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
    const wsRef = useRef<WebSocket | null>(null)
    const frameIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Mock data for demonstration
    const [neckAngle, setNeckAngle] = useState(15)
    const [spineAlignment, setSpineAlignment] = useState(92)
    const [screenDistance, setScreenDistance] = useState(65)

    const [neckData, setNeckData] = useState<number[]>([12, 13, 15, 14, 15, 16, 15])
    const [spineData, setSpineData] = useState<number[]>([90, 91, 92, 91, 92, 93, 92])
    const [distanceData, setDistanceData] = useState<number[]>([60, 62, 65, 64, 65, 66, 65])
    const [tips] = useState([
        { id: 1, text: 'Shoulders back, chest open', priority: 'high' },
        { id: 2, text: 'Screen at eye level', priority: 'medium' },
        { id: 3, text: 'Take a break every 30 minutes', priority: 'low' },
    ])

    // Handle WebSocket messages and state updates
    useEffect(() => {
        return () => {
            if (frameIntervalRef.current) clearInterval(frameIntervalRef.current)
            if (wsRef.current) wsRef.current.close()
        }
    }, [])

    const updateMetrics = (status: 'good' | 'bad') => {
        // Add some random variation to make it look "live"
        const variance = () => (Math.random() - 0.5) * 5

        if (status === 'good') {
            const newNeck = 15 + variance()
            setNeckAngle(Math.round(newNeck))
            setNeckData((prev) => [...prev.slice(-6), Math.round(newNeck)])

            const newSpine = 95 + variance()
            setSpineAlignment(Math.round(newSpine))
            setSpineData((prev) => [...prev.slice(-6), Math.round(newSpine)])

            const newDistance = 65 + variance()
            setScreenDistance(Math.round(newDistance))
            setDistanceData((prev) => [...prev.slice(-6), Math.round(newDistance)])
        } else {
            const newNeck = 35 + variance()
            setNeckAngle(Math.round(newNeck))
            setNeckData((prev) => [...prev.slice(-6), Math.round(newNeck)])

            const newSpine = 75 + variance()
            setSpineAlignment(Math.round(newSpine))
            setSpineData((prev) => [...prev.slice(-6), Math.round(newSpine)])

            const newDistance = 45 + variance()
            setScreenDistance(Math.round(newDistance))
            setDistanceData((prev) => [...prev.slice(-6), Math.round(newDistance)])
        }
    }

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

                // Initialize WebSocket
                const ws = new WebSocket('ws://localhost:8000/ws')
                wsRef.current = ws

                ws.onopen = () => {
                    console.log('Connected to WebSocket')
                    // Start sending frames
                    frameIntervalRef.current = setInterval(() => {
                        if (videoRef.current && ws.readyState === WebSocket.OPEN) {
                            const canvas = document.createElement('canvas')
                            canvas.width = videoRef.current.videoWidth
                            canvas.height = videoRef.current.videoHeight
                            const ctx = canvas.getContext('2d')
                            if (ctx) {
                                ctx.drawImage(videoRef.current, 0, 0)
                                // Send frame as base64 string
                                const frameData = canvas.toDataURL('image/jpeg', 0.8)
                                ws.send(JSON.stringify({ frame: frameData }))
                            }
                        }
                    }, 200) // Send frame every 200ms
                }

                ws.onmessage = (event) => {
                    // Backend sends "good" or "bad"
                    const status = event.data as 'good' | 'bad'
                    updateMetrics(status)
                }

                ws.onclose = () => {
                    console.log('WebSocket disconnected')
                }

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error)
                }

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

            // Close WebSocket and clear interval
            if (wsRef.current) {
                wsRef.current.close()
                wsRef.current = null
            }
            if (frameIntervalRef.current) {
                clearInterval(frameIntervalRef.current)
                frameIntervalRef.current = null
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
                        className={`relative aspect-video bg-card/30 backdrop-blur-sm border-2 overflow-hidden ${isMonitoring
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
                        <div className="absolute top-4 right-4 w-50 max-h-[calc(100%-2rem)] overflow-y-auto space-y-3 z-10 [&::-webkit-scrollbar]:hidden">
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
                                                    className={`w-1.5 h-1.5 rounded-full mt-1.5 ${tip.priority === 'high'
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
                        <div className="absolute flex-1 bottom-4 left-1/2 -translate-x-1/2 z-10">
                            <Card className="p-4 glassmorphism border-primary/30 min-w-[100px] min-h-[100px]">
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
                            className={`rounded-full px-8 ${isMonitoring
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
                            className={`rounded-full px-8 border-primary/30 ${isVoiceActive ? 'bg-primary/20 border-primary' : 'hover:bg-primary/10'
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
