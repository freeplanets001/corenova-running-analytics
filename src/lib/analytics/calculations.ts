/**
 * Core statistical calculation functions
 */

export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  const sqDiffs = values.map((v) => (v - avg) ** 2)
  return Math.sqrt(sqDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1))
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

export interface LinearRegressionResult {
  slope: number
  intercept: number
  r2: number
}

export function linearRegression(
  points: { x: number; y: number }[]
): LinearRegressionResult {
  if (points.length < 2) return { slope: 0, intercept: 0, r2: 0 }

  const n = points.length
  const sumX = points.reduce((s, p) => s + p.x, 0)
  const sumY = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0)
  const sumY2 = points.reduce((s, p) => s + p.y * p.y, 0)

  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return { slope: 0, intercept: mean(points.map((p) => p.y)), r2: 0 }

  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n

  // R-squared
  const yMean = sumY / n
  const ssTot = sumY2 - n * yMean * yMean
  const ssRes = points.reduce(
    (s, p) => s + (p.y - (slope * p.x + intercept)) ** 2,
    0
  )
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot

  return { slope, intercept, r2 }
}

/**
 * Fatigue index: percentage decline from best to last run
 * For 'decrease' direction (lower is better): positive = more fatigue (getting slower)
 * For 'increase' direction (higher is better): negative values would indicate fatigue
 */
export function fatigueIndex(
  runValues: number[],
  direction: 'decrease' | 'increase' = 'decrease'
): number {
  if (runValues.length < 2) return 0

  const bestValue = direction === 'decrease'
    ? Math.min(...runValues)
    : Math.max(...runValues)
  const lastValue = runValues[runValues.length - 1]

  if (bestValue === 0) return 0

  if (direction === 'decrease') {
    // Higher time = more fatigue
    return ((lastValue - bestValue) / bestValue) * 100
  } else {
    // Lower value = more fatigue
    return ((bestValue - lastValue) / bestValue) * 100
  }
}

/**
 * Consistency score: 0-100, higher is more consistent
 * Based on coefficient of variation (lower CV = more consistent)
 */
export function consistencyScore(values: number[]): number {
  if (values.length < 2) return 100
  const avg = mean(values)
  if (avg === 0) return 0
  const cv = standardDeviation(values) / avg
  // CV of 0 = perfectly consistent (score 100)
  // CV of 0.1 (10%) = score ~50
  // CV of 0.2+ = very inconsistent (score ~0)
  return Math.max(0, Math.min(100, 100 * (1 - cv * 5)))
}

/**
 * Determine trend direction from slope
 */
export function trendDirection(
  slope: number,
  direction: 'decrease' | 'increase' = 'decrease',
  threshold: number = 0.3
): 'improving' | 'declining' | 'stable' {
  if (Math.abs(slope) < threshold) return 'stable'

  if (direction === 'decrease') {
    // Lower values are better, so negative slope = improving
    return slope < 0 ? 'improving' : 'declining'
  } else {
    // Higher values are better, so positive slope = improving
    return slope > 0 ? 'improving' : 'declining'
  }
}

/**
 * Moving average with configurable window
 */
export function movingAverage(values: number[], window: number = 3): number[] {
  if (values.length < window) return values.map(() => mean(values))
  const result: number[] = []
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1)
    const slice = values.slice(start, i + 1)
    result.push(mean(slice))
  }
  return result
}

/**
 * Z-score for anomaly detection
 */
export function zScore(value: number, values: number[]): number {
  const avg = mean(values)
  const sd = standardDeviation(values)
  if (sd === 0) return 0
  return (value - avg) / sd
}

/**
 * Normalize a value to 0-100 scale within a range
 */
export function normalize(
  value: number,
  min: number,
  max: number
): number {
  if (max === min) return 50
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
}
