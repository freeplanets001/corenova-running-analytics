-- ============================================================================
-- Migration: 00012_seed_test_types_badges
-- Description: Seed default (global) test types and badge definitions.
--              Teams are NOT seeded here; they are created at runtime.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- Default test types (team_id IS NULL = available to every team)
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO test_types (team_id, name, description, unit, direction, min_value, max_value, min_runs, max_runs, sort_order) VALUES
  (NULL, 'シャトルラン',          '20mシャトルラン（往復持久走）',          '回',  'increase', 1,    247,   1, 1,  1),
  (NULL, '50m走',               '50メートル走',                          '秒',  'decrease', 5.0,  15.0,  1, 3,  2),
  (NULL, '20mダッシュ',          '20メートルダッシュ',                     '秒',  'decrease', 2.5,  8.0,   1, 12, 3),
  (NULL, 'レーンアジリティ',      'レーンアジリティドリル（コート幅往復）',   '秒',  'decrease', 8.0,  30.0,  1, 12, 4),
  (NULL, 'スーサイドラン',        'スーサイドラン（ライン往復ダッシュ）',     '秒',  'decrease', 20.0, 60.0,  1, 6,  5),
  (NULL, 'フルコートダッシュ',    'フルコートダッシュ（28m）',               '秒',  'decrease', 3.5,  12.0,  1, 12, 6),
  (NULL, '反復横跳び',           '反復横跳び（20秒間）',                    '回',  'increase', 10,   80,    1, 3,  7),
  (NULL, 'プロアジリティ',       'プロアジリティテスト（5-10-5）',           '秒',  'decrease', 3.5,  10.0,  1, 6,  8),
  (NULL, 'Tドリル',              'T字アジリティドリル',                     '秒',  'decrease', 8.0,  25.0,  1, 6,  9),
  (NULL, '17s',                  'ベースラインからベースラインまでの17秒走', '回',  'increase', 1,    20,    1, 6,  10);

-- ────────────────────────────────────────────────────────────────────────────
-- Badge definitions
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO badges (name, name_ja, description, description_ja, icon, criteria, category) VALUES
  (
    'Speed Demon',
    'スピードデーモン',
    'Record the fastest time in any session',
    'セッションで最速タイムを記録',
    'zap',
    '{"type": "best_in_session", "metric": "best_value", "direction": "decrease"}',
    'achievement'
  ),
  (
    'Iron Will',
    '鉄の意志',
    'Complete all runs in 10 consecutive sessions',
    '10セッション連続で全本数を完走',
    'shield',
    '{"type": "streak", "streak_type": "full_completion", "count": 10}',
    'endurance'
  ),
  (
    'Most Improved',
    '成長の星',
    'Improve personal best by 10% or more',
    '自己ベストを10%以上改善',
    'trending-up',
    '{"type": "improvement", "percentage": 10}',
    'growth'
  ),
  (
    'Perfect Attendance',
    '皆勤賞',
    'Attend every session in a calendar month',
    '1ヶ月間全セッションに出席',
    'calendar-check',
    '{"type": "attendance", "scope": "month", "percentage": 100}',
    'attendance'
  ),
  (
    'Consistency King',
    '安定王',
    'Achieve a consistency score of 95 or higher in a session',
    'セッションで安定性スコア95以上を達成',
    'target',
    '{"type": "consistency_score", "min_score": 95}',
    'achievement'
  ),
  (
    'Goal Crusher',
    '目標達成',
    'Complete a personal or team goal',
    '個人またはチーム目標を達成',
    'trophy',
    '{"type": "goal_completed", "count": 1}',
    'achievement'
  ),
  (
    'Streak Master',
    '連続記録',
    'Maintain a 20-session attendance streak',
    '20セッション連続出席を達成',
    'flame',
    '{"type": "streak", "streak_type": "attendance", "count": 20}',
    'endurance'
  ),
  (
    'Team Player',
    'チームプレイヤー',
    'Participate in 50 team sessions',
    'チームセッションに50回参加',
    'users',
    '{"type": "cumulative_sessions", "count": 50}',
    'social'
  );
