'use client'

import { useEffect, useState } from 'react'

interface WaveformVisualizerProps {
  isActive: boolean
}

export function WaveformVisualizer({ isActive }: WaveformVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(12).fill(0.3))

  useEffect(() => {
    if (!isActive) {
      setBars(Array(12).fill(0.3))
      return
    }

    const interval = setInterval(() => {
      setBars(
        Array(12)
          .fill(0)
          .map(() => Math.random() * 0.7 + 0.3)
      )
    }, 100)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-1.5 rounded-full transition-all duration-100 ${
            isActive ? 'bg-primary' : 'bg-muted'
          }`}
          style={{
            height: `${height * 100}%`,
            opacity: isActive ? 0.8 + height * 0.2 : 0.3,
          }}
        />
      ))}
    </div>
  )
}
