'use client'

import React from "react"

import { Sparkline } from '@/components/sparkline'
import { Card } from '@/components/ui/card'

interface MetricCardProps {
  title: string
  value: string | number | string[]
  unit?: string
  data?: number[]
  status?: 'good' | 'warning' | 'bad' | 'satisfactory'
  icon?: React.ReactNode
}

export function MetricCard({ title, value, unit, data, icon }: MetricCardProps) {
  const statusColors = {
    good: '#3b82f6',
    warning: '#f59e0b',
    bad: '#ef4444',
    satisfactory: '#f59e0b',
  }

  const borderClasses = {
    good: 'border-primary/30',
    warning: 'border-yellow-500/30',
    satisfactory: 'border-yellow-500/30',
    bad: 'border-destructive/30',
  }

  const statusBadgeClasses = {
    good: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    satisfactory: 'border-yellow-500/30',
    bad: 'bg-red-100 text-red-800',
  }

  return (
    <Card
      className={`p-4 bg-card/50 backdrop-blur-sm border hover:border-primary/50 transition-colors`}
    >
      {/* Title + Icon + Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
        </div>
        {status && (
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full `}>
            {status.toUpperCase()}
          </span>
        )}
      </div>

      {/* Value + Unit + Sparkline */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-foreground whitespace-pre-line">{value}</span>
          {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
        </div>
        {/*<Sparkline data={data} width={60} height={24} color={statusColors[status]} />*/}
      </div>
    </Card>
  )
}

