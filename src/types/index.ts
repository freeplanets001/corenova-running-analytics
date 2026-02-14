// ===== Enums =====
export type UserRole = 'admin' | 'player' | 'viewer'
export type GoalStatus = 'active' | 'completed' | 'abandoned' | 'expired'
export type GoalScope = 'personal' | 'team' | 'individual_target'
export type GoalMetric = 'average_value' | 'best_value' | 'consistency' | 'run_count' | 'improvement_rate' | 'attendance'
export type NotificationType = 'goal_achieved' | 'goal_progress' | 'session_reminder' | 'ai_insight' | 'team_announcement' | 'streak' | 'badge_earned'
export type InsightType = 'session_summary' | 'trend_analysis' | 'anomaly' | 'recommendation' | 'weekly_report' | 'monthly_report'
export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'injured'
export type TrendDirection = 'improving' | 'declining' | 'stable'

// ===== Test Types =====
export interface TestType {
  id: string
  team_id: string
  name: string
  description: string | null
  unit: string
  direction: 'decrease' | 'increase'
  min_value: number | null
  max_value: number | null
  min_runs: number
  max_runs: number
  is_active: boolean
  sort_order: number
  created_at: string
}

// ===== Core Data =====
export interface Team {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  role: UserRole
  player_name: string | null
  jersey_number: number | null
  position: string | null
  is_active: boolean
  locale: string
  created_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  profile_id: string
  role: UserRole
  joined_at: string
}

// ===== Session Data =====
export interface Session {
  id: string
  team_id: string
  test_type_id: string
  session_date: string
  target_run_count: number | null
  location: string | null
  weather: string | null
  notes: string | null
  created_by: string | null
  is_locked: boolean
  created_at: string
  // Joined fields
  test_type?: TestType
}

export interface SessionRun {
  id: string
  session_id: string
  player_id: string
  run_number: number
  value: number
  is_valid: boolean
  entered_by: string | null
  source: 'manual' | 'excel_import' | 'api'
  created_at: string
}

export interface SessionPlayerStats {
  id: string
  session_id: string
  player_id: string
  run_count: number
  average_value: number | null
  best_value: number | null
  worst_value: number | null
  std_deviation: number | null
  fatigue_index: number | null
  consistency_score: number | null
  rank_in_session: number | null
  computed_at: string
}

// ===== Goals =====
export interface Goal {
  id: string
  team_id: string
  scope: GoalScope
  metric: GoalMetric
  test_type_id: string | null
  player_id: string | null
  created_by: string
  title: string
  description: string | null
  target_value: number
  current_value: number
  baseline_value: number | null
  unit: string
  direction: 'increase' | 'decrease'
  start_date: string
  target_date: string
  status: GoalStatus
  progress_percentage: number
  achieved_at: string | null
  ai_suggested: boolean
  ai_reasoning: string | null
  created_at: string
}

export interface GoalMilestone {
  id: string
  goal_id: string
  title: string
  target_value: number
  achieved: boolean
  achieved_at: string | null
  sort_order: number
}

// ===== AI =====
export interface AIInsight {
  id: string
  team_id: string
  insight_type: InsightType
  session_id: string | null
  player_id: string | null
  title: string
  content: string
  summary: string | null
  severity: 'info' | 'warning' | 'positive' | 'critical'
  is_read: boolean
  is_pinned: boolean
  created_at: string
}

export interface AIConversation {
  id: string
  team_id: string
  user_id: string
  title: string | null
  created_at: string
}

export interface AIChatMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

// ===== Gamification =====
export interface Badge {
  id: string
  name: string
  name_ja: string
  description_ja: string
  icon: string
  category: string
}

export interface PlayerBadge {
  id: string
  player_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}

export interface PlayerStreak {
  id: string
  player_id: string
  streak_type: string
  current_count: number
  best_count: number
}

// ===== Notifications =====
export interface Notification {
  id: string
  recipient_id: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

// ===== Analytics (Computed) =====
export interface PlayerProfile {
  id: string
  name: string
  sessionsAttended: number
  totalSessions: number
  attendanceRate: number
  allTimeBestAverage: number
  allTimeWorstAverage: number
  overallAverage: number
  trend: TrendDirection
  trendSlope: number
  consistencyScore: number
  fatigueResistanceScore: number
  recentForm: number
}

export interface SessionSummary {
  date: string
  testType: string
  teamAverage: number
  teamMedian: number
  bestPerformer: { name: string; value: number }
  worstPerformer: { name: string; value: number }
  mostImproved: { name: string; change: number } | null
  playerCount: number
  runCount: number
}

export interface RankingEntry {
  rank: number
  playerName: string
  playerId: string
  value: number
  change: number
  trend: 'up' | 'down' | 'same' | 'new'
}

export interface Anomaly {
  playerName: string
  date: string
  type: 'outlier_fast' | 'outlier_slow' | 'format_change' | 'missing_data'
  severity: 'info' | 'warning' | 'critical'
  description: string
  value: number
  expectedRange: [number, number]
}
