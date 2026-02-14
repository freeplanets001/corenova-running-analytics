export const APP_NAME = 'CORENOVA'
export const APP_DESCRIPTION = 'バレーボール フィジカルセッション分析'

export const DEFAULT_TEST_TYPES = [
  { name: 'ランニングドリル', unit: '秒', direction: 'decrease' as const, description: '一定距離を走るタイム計測', min_value: 30, max_value: 180, max_runs: 12 },
  { name: 'YO-YOテスト', unit: 'レベル', direction: 'increase' as const, description: '間欠性回復テスト', min_value: 1, max_value: 25, max_runs: 1 },
  { name: 'シャトルラン', unit: '回', direction: 'increase' as const, description: '20mシャトルランテスト', min_value: 1, max_value: 200, max_runs: 1 },
  { name: 'スプリントテスト', unit: '秒', direction: 'decrease' as const, description: '短距離ダッシュ', min_value: 2, max_value: 30, max_runs: 6 },
  { name: 'アジリティテスト', unit: '秒', direction: 'decrease' as const, description: '方向転換俊敏性テスト', min_value: 5, max_value: 60, max_runs: 6 },
] as const

export const PERFORMANCE_COLORS = {
  excellent: '#10B981',
  good: '#34D399',
  average: '#FBBF24',
  poor: '#F97316',
  critical: '#EF4444',
} as const

export const PLAYER_COLORS = [
  '#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6',
  '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#A855F7',
  '#10B981', '#E11D48', '#0EA5E9', '#D97706', '#7C3AED',
  '#059669', '#DC2626', '#0284C7',
] as const

export const TREND_COLORS = {
  improving: '#10B981',
  declining: '#EF4444',
  stable: '#6B7280',
} as const

export const COMPOSITE_WEIGHTS = {
  speed: 0.30,
  consistency: 0.20,
  improvement: 0.20,
  fatigue: 0.15,
  attendance: 0.15,
} as const
