import { mean } from './calculations'
import type { RankingEntry } from '@/types'

export type RankingCriteria = 'speed' | 'consistency' | 'improvement' | 'fatigue' | 'attendance' | 'composite'

export interface PlayerRankData {
  playerId: string
  playerName: string
  averageValue: number
  consistencyScore: number
  trendSlope: number
  fatigueResistance: number
  attendanceRate: number
}

/**
 * Rank players by a specific criterion
 */
export function rankPlayers(
  players: PlayerRankData[],
  criteria: RankingCriteria,
  direction: 'decrease' | 'increase' = 'decrease',
  previousRanks?: Map<string, number>
): RankingEntry[] {
  const sorted = [...players].sort((a, b) => {
    switch (criteria) {
      case 'speed':
        return direction === 'decrease'
          ? a.averageValue - b.averageValue
          : b.averageValue - a.averageValue
      case 'consistency':
        return b.consistencyScore - a.consistencyScore
      case 'improvement':
        return direction === 'decrease'
          ? a.trendSlope - b.trendSlope // Most negative = most improved
          : b.trendSlope - a.trendSlope
      case 'fatigue':
        return a.fatigueResistance - b.fatigueResistance // Lower fatigue = better
      case 'attendance':
        return b.attendanceRate - a.attendanceRate
      case 'composite':
        return compositeScore(b, direction) - compositeScore(a, direction)
      default:
        return 0
    }
  })

  return sorted.map((player, idx) => {
    const rank = idx + 1
    const prevRank = previousRanks?.get(player.playerId)
    let trend: 'up' | 'down' | 'same' | 'new' = 'new'
    let change = 0

    if (prevRank !== undefined) {
      change = prevRank - rank
      trend = change > 0 ? 'up' : change < 0 ? 'down' : 'same'
    }

    return {
      rank,
      playerName: player.playerName,
      playerId: player.playerId,
      value: getValueForCriteria(player, criteria, direction),
      change,
      trend,
    }
  })
}

function compositeScore(player: PlayerRankData, direction: 'decrease' | 'increase'): number {
  // Normalize each metric to 0-100 scale
  // For speed: invert if decrease (lower = better → higher score)
  const speedNorm = direction === 'decrease'
    ? Math.max(0, 100 - player.averageValue)
    : player.averageValue

  return (
    speedNorm * 0.30 +
    player.consistencyScore * 0.20 +
    Math.max(0, 50 - player.trendSlope * 10) * 0.20 + // Normalize slope
    Math.max(0, 100 - player.fatigueResistance * 5) * 0.15 +
    player.attendanceRate * 100 * 0.15
  )
}

function getValueForCriteria(
  player: PlayerRankData,
  criteria: RankingCriteria,
  direction: 'decrease' | 'increase'
): number {
  switch (criteria) {
    case 'speed': return player.averageValue
    case 'consistency': return player.consistencyScore
    case 'improvement': return player.trendSlope
    case 'fatigue': return player.fatigueResistance
    case 'attendance': return player.attendanceRate * 100
    case 'composite': return compositeScore(player, direction)
    default: return 0
  }
}

/**
 * Build ranking history across sessions for bump chart
 */
export function buildRankingHistory(
  sessionDates: string[],
  playersBySession: Map<string, PlayerRankData[]>,
  criteria: RankingCriteria,
  direction: 'decrease' | 'increase' = 'decrease'
): Map<string, { date: string; rank: number }[]> {
  const history = new Map<string, { date: string; rank: number }[]>()

  let previousRanks: Map<string, number> | undefined

  for (const date of sessionDates) {
    const players = playersBySession.get(date) || []
    const rankings = rankPlayers(players, criteria, direction, previousRanks)

    for (const entry of rankings) {
      if (!history.has(entry.playerName)) history.set(entry.playerName, [])
      history.get(entry.playerName)!.push({ date, rank: entry.rank })
    }

    previousRanks = new Map(rankings.map((r) => [r.playerId, r.rank]))
  }

  return history
}
