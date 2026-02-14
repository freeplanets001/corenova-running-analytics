import { mean, standardDeviation, zScore } from './calculations'
import type { Anomaly } from '@/types'
import type { ParsedPlayerSession } from '../excel/parser'

/**
 * Detect anomalies in session data
 */
export function detectAnomalies(sessions: ParsedPlayerSession[]): Anomaly[] {
  const anomalies: Anomaly[] = []

  // Group sessions by player
  const byPlayer = new Map<string, ParsedPlayerSession[]>()
  for (const s of sessions) {
    if (!byPlayer.has(s.playerName)) byPlayer.set(s.playerName, [])
    byPlayer.get(s.playerName)!.push(s)
  }

  for (const [playerName, playerSessions] of byPlayer) {
    const normalSessions = playerSessions.filter((s) => !s.isAnomalous)
    const averages = normalSessions
      .map((s) => s.average)
      .filter((a): a is number => a !== null)

    if (averages.length < 3) continue

    const avg = mean(averages)
    const sd = standardDeviation(averages)

    for (const session of normalSessions) {
      if (session.average === null) continue

      const z = zScore(session.average, averages)

      // Outlier: more than 2 standard deviations
      if (Math.abs(z) > 2) {
        anomalies.push({
          playerName,
          date: session.date,
          type: z > 0 ? 'outlier_slow' : 'outlier_fast',
          severity: Math.abs(z) > 3 ? 'critical' : 'warning',
          description: z > 0
            ? `${playerName}の平均${session.average.toFixed(1)}秒は通常より大幅に遅い（平均${avg.toFixed(1)}±${sd.toFixed(1)}）`
            : `${playerName}の平均${session.average.toFixed(1)}秒は通常より大幅に速い（平均${avg.toFixed(1)}±${sd.toFixed(1)}）`,
          value: session.average,
          expectedRange: [avg - 2 * sd, avg + 2 * sd],
        })
      }

      // Sudden jump: session-to-session change > 10
      const idx = normalSessions.indexOf(session)
      if (idx > 0) {
        const prevAvg = normalSessions[idx - 1].average
        if (prevAvg !== null && Math.abs(session.average - prevAvg) > 10) {
          anomalies.push({
            playerName,
            date: session.date,
            type: session.average > prevAvg ? 'outlier_slow' : 'outlier_fast',
            severity: 'warning',
            description: `${playerName}の前回セッションからの変動が${Math.abs(session.average - prevAvg).toFixed(1)}秒（前回: ${prevAvg.toFixed(1)}秒）`,
            value: session.average,
            expectedRange: [prevAvg - 5, prevAvg + 5],
          })
        }
      }
    }

    // Missing data detection
    for (const session of playerSessions) {
      if (session.runs.length === 0 && session.average === null) {
        anomalies.push({
          playerName,
          date: session.date,
          type: 'missing_data',
          severity: 'info',
          description: `${playerName}の${session.date}のデータが欠損`,
          value: 0,
          expectedRange: [avg - 2 * sd, avg + 2 * sd],
        })
      }
    }
  }

  // Format change detection (anomalous sessions)
  const anomalousSessions = sessions.filter((s) => s.isAnomalous)
  const anomalousDates = new Set(anomalousSessions.map((s) => s.date))
  for (const date of anomalousDates) {
    anomalies.push({
      playerName: 'チーム全体',
      date,
      type: 'format_change',
      severity: 'critical',
      description: `${date}のセッションは通常と異なる形式のデータです（値が30未満: ラップ数またはレベルの可能性）`,
      value: 0,
      expectedRange: [46, 87],
    })
  }

  // Date anomaly: 2026-12-31 between Dec 2025 and Jan 2026
  const dates = sessions.map((s) => s.date).filter((d) => d.startsWith('2026-12'))
  if (dates.some((d) => d === '2026-12-31')) {
    anomalies.push({
      playerName: 'チーム全体',
      date: '2026-12-31',
      type: 'format_change',
      severity: 'warning',
      description: '2026-12-31の日付が不自然です（2025-12-31の入力ミスの可能性）',
      value: 0,
      expectedRange: [0, 0],
    })
  }

  return anomalies.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity] || a.date.localeCompare(b.date)
  })
}
