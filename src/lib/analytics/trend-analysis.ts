import { linearRegression, trendDirection, movingAverage } from './calculations'
import type { TrendDirection } from '@/types'

export interface TrendResult {
  direction: TrendDirection
  slope: number
  r2: number
  movingAverages: number[]
  projectedNext: number
  confidenceInterval: [number, number]
}

/**
 * Analyze trend from a series of session averages
 */
export function analyzeTrend(
  sessionAverages: number[],
  metricDirection: 'decrease' | 'increase' = 'decrease'
): TrendResult {
  if (sessionAverages.length < 2) {
    return {
      direction: 'stable',
      slope: 0,
      r2: 0,
      movingAverages: sessionAverages,
      projectedNext: sessionAverages[0] ?? 0,
      confidenceInterval: [sessionAverages[0] ?? 0, sessionAverages[0] ?? 0],
    }
  }

  const points = sessionAverages.map((y, x) => ({ x, y }))
  const regression = linearRegression(points)
  const direction = trendDirection(regression.slope, metricDirection)
  const ma = movingAverage(sessionAverages, 3)

  // Project next session value
  const nextX = sessionAverages.length
  const projectedNext = regression.slope * nextX + regression.intercept

  // Confidence interval based on standard error
  const residuals = points.map((p) => p.y - (regression.slope * p.x + regression.intercept))
  const stdError = Math.sqrt(
    residuals.reduce((sum, r) => sum + r * r, 0) / Math.max(1, points.length - 2)
  )
  const confidenceInterval: [number, number] = [
    projectedNext - 1.96 * stdError,
    projectedNext + 1.96 * stdError,
  ]

  return {
    direction,
    slope: regression.slope,
    r2: regression.r2,
    movingAverages: ma,
    projectedNext,
    confidenceInterval,
  }
}

/**
 * Calculate improvement rate between two periods
 */
export function improvementRate(
  recentAverages: number[],
  olderAverages: number[],
  metricDirection: 'decrease' | 'increase' = 'decrease'
): number {
  if (recentAverages.length === 0 || olderAverages.length === 0) return 0

  const recentMean = recentAverages.reduce((s, v) => s + v, 0) / recentAverages.length
  const olderMean = olderAverages.reduce((s, v) => s + v, 0) / olderAverages.length

  if (olderMean === 0) return 0

  const change = ((recentMean - olderMean) / olderMean) * 100

  // For 'decrease' metrics, negative change = improvement
  return metricDirection === 'decrease' ? -change : change
}

/**
 * Identify the most improved and most declined players
 */
export function findTopChanges(
  playerTrends: Map<string, TrendResult>,
  metricDirection: 'decrease' | 'increase' = 'decrease',
  count: number = 3
): { improved: { name: string; slope: number }[]; declined: { name: string; slope: number }[] } {
  const entries = Array.from(playerTrends.entries()).map(([name, trend]) => ({
    name,
    slope: trend.slope,
  }))

  // Sort by improvement (for decrease metric, most negative slope = most improved)
  const sorted = entries.sort((a, b) =>
    metricDirection === 'decrease' ? a.slope - b.slope : b.slope - a.slope
  )

  return {
    improved: sorted.slice(0, count),
    declined: sorted.slice(-count).reverse(),
  }
}
