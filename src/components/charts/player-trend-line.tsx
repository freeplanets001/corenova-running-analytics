'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { PLAYER_COLORS } from '@/lib/constants/config'

interface PlayerDataPoint {
  date: string
  [playerName: string]: number | string
}

interface PlayerTrendLineProps {
  data: PlayerDataPoint[]
  playerNames: string[]
  teamAverageKey?: string
  unit?: string
  direction?: 'decrease' | 'increase'
  height?: number
}

export function PlayerTrendLine({
  data,
  playerNames,
  teamAverageKey,
  unit = '秒',
  direction = 'decrease',
  height = 320,
}: PlayerTrendLineProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
        データがありません
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => {
            const d = new Date(v)
            return `${d.getMonth() + 1}/${d.getDate()}`
          }}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          reversed={direction === 'decrease'}
          label={{ value: unit, angle: -90, position: 'insideLeft', fontSize: 11 }}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="max-h-64 overflow-y-auto rounded-lg border bg-background p-3 shadow-lg">
                <p className="mb-2 font-medium">{label ? new Date(label).toLocaleDateString('ja-JP') : ''}</p>
                <div className="space-y-1 text-sm">
                  {[...payload]
                    .sort((a, b) => {
                      const va = Number(a.value ?? 0)
                      const vb = Number(b.value ?? 0)
                      return direction === 'decrease' ? va - vb : vb - va
                    })
                    .map((entry) => (
                      <p key={entry.dataKey as string} style={{ color: entry.color }}>
                        {entry.name}: <span className="font-bold">{Number(entry.value).toFixed(1)}{unit}</span>
                      </p>
                    ))}
                </div>
              </div>
            )
          }}
        />
        {teamAverageKey && (
          <Line
            type="monotone"
            dataKey={teamAverageKey}
            stroke="#9CA3AF"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="チーム平均"
          />
        )}
        {playerNames.map((name, idx) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            stroke={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name={name}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
