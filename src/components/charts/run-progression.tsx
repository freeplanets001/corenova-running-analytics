'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import { colorGradient } from '@/lib/utils/color'

interface RunData {
  runNumber: number
  value: number
}

interface RunProgressionProps {
  runs: RunData[]
  average?: number
  unit?: string
  direction?: 'decrease' | 'increase'
  playerName?: string
  height?: number
}

export function RunProgressionChart({
  runs,
  average,
  unit = '秒',
  direction = 'decrease',
  playerName,
  height = 240,
}: RunProgressionProps) {
  if (runs.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
        データがありません
      </div>
    )
  }

  const values = runs.map((r) => r.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const chartData = runs.map((r) => ({
    name: `${r.runNumber}本目`,
    value: r.value,
    delta: r.runNumber > 1 ? r.value - runs[0].value : 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis
          tick={{ fontSize: 11 }}
          domain={['auto', 'auto']}
          label={{ value: unit, angle: -90, position: 'insideLeft', fontSize: 11 }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0]?.payload as (typeof chartData)[0]
            return (
              <div className="rounded-lg border bg-background p-3 shadow-lg">
                {playerName && <p className="font-medium">{playerName}</p>}
                <p className="text-sm">{d.name}: <span className="font-bold">{d.value.toFixed(1)}{unit}</span></p>
                {d.delta !== 0 && (
                  <p className={`text-sm ${
                    (direction === 'decrease' ? d.delta > 0 : d.delta < 0) ? 'text-red-500' : 'text-green-500'
                  }`}>
                    1本目比: {d.delta > 0 ? '+' : ''}{d.delta.toFixed(1)}{unit}
                  </p>
                )}
              </div>
            )
          }}
        />
        {average && (
          <ReferenceLine
            y={average}
            stroke="#9CA3AF"
            strokeDasharray="5 5"
            label={{ value: `平均 ${average.toFixed(1)}`, position: 'right', fontSize: 11 }}
          />
        )}
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => {
            const ratio = direction === 'decrease'
              ? 1 - (entry.value - min) / range
              : (entry.value - min) / range
            return <Cell key={index} fill={colorGradient(ratio)} />
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
