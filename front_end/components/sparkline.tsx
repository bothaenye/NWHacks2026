'use client'

import { useEffect, useState } from 'react'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
}

export function Sparkline({ data, width = 80, height = 30, color = '#3b82f6' }: SparklineProps) {
  const [points, setPoints] = useState<string>('')

  useEffect(() => {
    if (data.length < 2) return

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    const pathPoints = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * width
        const y = height - ((value - min) / range) * height
        return `${x},${y}`
      })
      .join(' ')

    setPoints(pathPoints)
  }, [data, width, height])

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
