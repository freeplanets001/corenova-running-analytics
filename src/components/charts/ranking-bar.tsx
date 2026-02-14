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
} from 'recharts'
import { performanceColor } from '@/lib/utils/color'
import type { RankingEntry } from '@/types'

interface RankingBarChartProps {
  data: RankingEntry[]
  unit?: string
  direction?: 'decrease' | 'increase'
  height?: number
  showRankChange?: boolean
}

export function RankingBarChart({
  data,
  unit = '秒',
  direction = 'decrease',
  height = 400,
  showRankChange = true,
}: RankingBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
        データがありません
      </div>
    )
  }

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)

  const chartData = data.map((entry) => ({
    ...entry,
    label: `${entry.rank}. ${entry.playerName}`,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 40, bottom: 5, left: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 12 }}
          width={80}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const entry = payload[0]?.payload as RankingEntry & { label: string }
            return (
              <div className="rounded-lg border bg-background p-3 shadow-lg">
                <p className="font-medium">{entry.playerName}</p>
                <p className="text-sm">
                  {entry.value.toFixed(1)}{unit} ({entry.rank}位)
                </p>
                {showRankChange && entry.change !== 0 && (
                  <p className={`text-sm ${entry.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {entry.change > 0 ? '▲' : '▼'} {Math.abs(entry.change)}ランク
                  </p>
                )}
              </div>
            )
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={entry.playerName}
              fill={performanceColor(entry.value, min, max, direction)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
