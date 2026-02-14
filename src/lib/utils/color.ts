import { PERFORMANCE_COLORS, PLAYER_COLORS, TREND_COLORS } from '@/lib/constants/config'
import type { TrendDirection } from '@/types'

/**
 * Map a performance value to a color based on percentile thresholds
 * For 'decrease' metrics: lower values get better (green) colors
 * For 'increase' metrics: higher values get better (green) colors
 */
export function performanceColor(
  value: number,
  min: number,
  max: number,
  direction: 'decrease' | 'increase' = 'decrease'
): string {
  if (max === min) return PERFORMANCE_COLORS.average

  let ratio = (value - min) / (max - min)
  if (direction === 'decrease') ratio = 1 - ratio // Invert for decrease metrics

  if (ratio >= 0.8) return PERFORMANCE_COLORS.excellent
  if (ratio >= 0.6) return PERFORMANCE_COLORS.good
  if (ratio >= 0.4) return PERFORMANCE_COLORS.average
  if (ratio >= 0.2) return PERFORMANCE_COLORS.poor
  return PERFORMANCE_COLORS.critical
}

/**
 * Get a consistent color for a player by name
 */
export function playerColor(playerName: string, allPlayerNames: string[]): string {
  const index = allPlayerNames.indexOf(playerName)
  return PLAYER_COLORS[index >= 0 ? index % PLAYER_COLORS.length : 0]
}

/**
 * Get color for trend direction
 */
export function trendColor(direction: TrendDirection): string {
  return TREND_COLORS[direction]
}

/**
 * Generate a gradient between two colors
 */
export function colorGradient(ratio: number): string {
  // Green (good) to Red (bad)
  const r = Math.round(255 * Math.min(1, 2 * (1 - ratio)))
  const g = Math.round(255 * Math.min(1, 2 * ratio))
  return `rgb(${r}, ${g}, 80)`
}
