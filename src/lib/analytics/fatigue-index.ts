import { fatigueIndex, mean, standardDeviation } from './calculations'

export type FatigueCurveType = 'steady_decline' | 'cliff' | 'u_shape' | 'stable' | 'improving'

export interface FatigueProfile {
  playerName: string
  date: string
  firstRunValue: number
  lastRunValue: number
  bestRunValue: number
  worstRunValue: number
  fatigueDropoff: number
  curveType: FatigueCurveType
  criticalFatiguePoint: number | null
  lateRunResilience: number
  runByRunDeltas: number[]
}

/**
 * Analyze fatigue pattern within a single session
 */
export function analyzeFatigue(
  playerName: string,
  date: string,
  runValues: number[],
  direction: 'decrease' | 'increase' = 'decrease'
): FatigueProfile {
  if (runValues.length < 2) {
    return {
      playerName,
      date,
      firstRunValue: runValues[0] ?? 0,
      lastRunValue: runValues[0] ?? 0,
      bestRunValue: runValues[0] ?? 0,
      worstRunValue: runValues[0] ?? 0,
      fatigueDropoff: 0,
      curveType: 'stable',
      criticalFatiguePoint: null,
      lateRunResilience: 0,
      runByRunDeltas: [],
    }
  }

  const firstRunValue = runValues[0]
  const lastRunValue = runValues[runValues.length - 1]
  const bestRunValue = direction === 'decrease'
    ? Math.min(...runValues)
    : Math.max(...runValues)
  const worstRunValue = direction === 'decrease'
    ? Math.max(...runValues)
    : Math.min(...runValues)

  const fatigueDropoff = fatigueIndex(runValues, direction)

  // Run-by-run deltas
  const deltas: number[] = []
  for (let i = 1; i < runValues.length; i++) {
    deltas.push(runValues[i] - runValues[i - 1])
  }

  // Classify curve type
  const curveType = classifyFatigueCurve(runValues, direction)

  // Critical fatigue point: first run where value exceeds first run + 1 SD
  const sd = standardDeviation(runValues)
  let criticalFatiguePoint: number | null = null
  for (let i = 1; i < runValues.length; i++) {
    if (direction === 'decrease') {
      if (runValues[i] > firstRunValue + sd) {
        criticalFatiguePoint = i + 1
        break
      }
    } else {
      if (runValues[i] < firstRunValue - sd) {
        criticalFatiguePoint = i + 1
        break
      }
    }
  }

  // Late-run resilience: avg of last 2 runs vs avg of first 2 runs
  const first2 = mean(runValues.slice(0, 2))
  const last2 = mean(runValues.slice(-2))
  const lateRunResilience = first2 === 0 ? 0 : ((last2 - first2) / first2) * 100

  return {
    playerName,
    date,
    firstRunValue,
    lastRunValue,
    bestRunValue,
    worstRunValue,
    fatigueDropoff,
    curveType,
    criticalFatiguePoint,
    lateRunResilience,
    runByRunDeltas: deltas,
  }
}

function classifyFatigueCurve(
  values: number[],
  direction: 'decrease' | 'increase'
): FatigueCurveType {
  if (values.length < 3) return 'stable'

  const n = values.length
  const firstThird = mean(values.slice(0, Math.ceil(n / 3)))
  const midThird = mean(values.slice(Math.ceil(n / 3), Math.ceil((2 * n) / 3)))
  const lastThird = mean(values.slice(Math.ceil((2 * n) / 3)))

  const avgVal = mean(values)
  const threshold = avgVal * 0.03 // 3% threshold

  if (direction === 'decrease') {
    // Lower is better for 'decrease'
    const gettingSlower = lastThird - firstThird
    const midDip = midThird - firstThird

    if (Math.abs(gettingSlower) < threshold) return 'stable'
    if (gettingSlower < -threshold) return 'improving' // Getting faster
    if (midDip > threshold * 2 && lastThird < midThird) return 'u_shape' // Recovery
    if (midThird - firstThird < threshold && lastThird - midThird > threshold * 2) return 'cliff'
    return 'steady_decline'
  } else {
    // Higher is better for 'increase'
    const gettingWorse = firstThird - lastThird
    const midDip = firstThird - midThird

    if (Math.abs(gettingWorse) < threshold) return 'stable'
    if (gettingWorse < -threshold) return 'improving'
    if (midDip > threshold * 2 && lastThird > midThird) return 'u_shape'
    if (firstThird - midThird < threshold && midThird - lastThird > threshold * 2) return 'cliff'
    return 'steady_decline'
  }
}

/**
 * Compute injury risk score based on fatigue patterns
 * Returns 0-100 where higher = more risk
 */
export function injuryRiskScore(
  recentFatigueProfiles: FatigueProfile[],
  attendanceRate: number,
  trendSlope: number
): number {
  if (recentFatigueProfiles.length === 0) return 0

  const avgFatigueDropoff = mean(recentFatigueProfiles.map((p) => Math.abs(p.fatigueDropoff)))

  // Increasing fatigue trend
  const fatigueValues = recentFatigueProfiles.map((p) => Math.abs(p.fatigueDropoff))
  const fatigueTrend = fatigueValues.length >= 2
    ? (fatigueValues[fatigueValues.length - 1] - fatigueValues[0]) / Math.max(1, fatigueValues.length - 1)
    : 0

  // Weighted score
  const score =
    Math.min(avgFatigueDropoff * 2, 30) +   // Current fatigue level (max 30)
    Math.min(fatigueTrend * 10, 25) +        // Fatigue trend (max 25)
    Math.min(Math.abs(trendSlope) * 5, 20) + // Performance decline (max 20)
    (1 - attendanceRate) * 15 +               // Irregular attendance (max 15)
    (recentFatigueProfiles.some((p) => p.curveType === 'cliff') ? 10 : 0) // Cliff pattern (max 10)

  return Math.max(0, Math.min(100, score))
}
