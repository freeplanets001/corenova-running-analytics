-- ============================================================================
-- Migration: 00001_create_enums
-- Description: Create custom enum types for the CORENOVA running analytics app
-- ============================================================================

-- Role assigned to a user within the system
CREATE TYPE user_role AS ENUM ('admin', 'player', 'viewer');

-- Lifecycle status of a goal
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'abandoned', 'expired');

-- Scope / visibility of a goal
CREATE TYPE goal_scope AS ENUM ('personal', 'team', 'individual_target');

-- Metric a goal is measured against
CREATE TYPE goal_metric AS ENUM (
  'average_value',
  'best_value',
  'consistency',
  'run_count',
  'improvement_rate',
  'attendance'
);

-- Type of push / in-app notification
CREATE TYPE notification_type AS ENUM (
  'goal_achieved',
  'goal_progress',
  'session_reminder',
  'ai_insight',
  'team_announcement',
  'streak',
  'badge_earned'
);

-- Category of AI-generated insight
CREATE TYPE insight_type AS ENUM (
  'session_summary',
  'trend_analysis',
  'anomaly',
  'recommendation',
  'weekly_report',
  'monthly_report'
);

-- Player attendance status for a session
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused', 'injured');
