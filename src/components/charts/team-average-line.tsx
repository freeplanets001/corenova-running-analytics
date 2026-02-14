'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Legend,
} from 'recharts'
import { PERFORMANCE_COLORS } from '@/lib/constants/config'

interface DataPoint {
  date: string
  teamAverage: number
  teamMin: number
  teamMax: number
  playerCount: number
}

interface TeamAverageLineChartProps {
  data: DataPoint[]
  unit?: string
  direction?: 'decrease' | 'increase'
}

export function TeamAverageLineChart({
  data,
  unit = '秒',
  direction = 'decrease',
}: TeamAverageLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        データがありません
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => {
            const d = new Date(v)
            return `${d.getMonth() + 1}/${d.getDate()}`
          }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          domain={direction === 'decrease' ? ['auto', 'auto'] : ['auto', 'auto']}
          reversed={direction === 'decrease'}
          label={{ value: unit, angle: -90, position: 'insideLeft', fontSize: 12 }}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const d = payload[0]?.payload as DataPoint
            return (
              <div className="rounded-lg border bg-background p-3 shadow-lg">
                <p className="font-medium">{label ? new Date(label).toLocaleDateString('ja-JP') : ''}</p>
                <p className="text-sm text-muted-foreground">{d.playerCount}名参加</p>
                <div className="mt-1 space-y-1 text-sm">
                  <p>チーム平均: <span className="font-bold">{d.teamAverage.toFixed(1)}{unit}</span></p>
                  <p className="text-muted-foreground">範囲: {d.teamMin.toFixed(1)} - {d.teamMax.toFixed(1)}{unit}</p>
                </div>
              </div>
            )
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="teamMax"
          stroke="none"
          fill={PERFORMANCE_COLORS.poor}
          fillOpacity={0.1}
          name="最大"
          legendType="none"
        />
        <Area
          type="monotone"
          dataKey="teamMin"
          stroke="none"
          fill={PERFORMANCE_COLORS.excellent}
          fillOpacity={0.1}
          name="最小"
          legendType="none"
        />
        <Line
          type="monotone"
          dataKey="teamAverage"
          stroke={PERFORMANCE_COLORS.average}
          strokeWidth={3}
          dot={{ r: 4, fill: PERFORMANCE_COLORS.average }}
          activeDot={{ r: 6 }}
          name="チーム平均"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
