'use client'

import React from "react"

import { Card } from '@/components/ui/card'
import { Sparkline } from '@/components/sparkline'

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  data: number[]
  status?: 'good' | 'warning' | 'error'
  icon?: React.ReactNode
}

export function MetricCard({ title, value, unit, data, status = 'good', icon }: MetricCardProps) {
  const statusColors = {
    good: '#3b82f6',
    warning: '#f59e0b',
    error: '#ef4444',
  }

  const borderClasses = {
    good: 'border-primary/30',
    warning: 'border-yellow-500/30',
    error: 'border-destructive/30',
  }

  return (
    <Card
      className={`p-4 bg-card/50 backdrop-blur-sm border ${borderClasses[status]} hover:border-primary/50 transition-colors`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
        </div>
        <Sparkline data={data} width={60} height={24} color={statusColors[status]} />
      </div>
    </Card>
  )
}
