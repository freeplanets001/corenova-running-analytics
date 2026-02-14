-- ============================================================================
-- Migration: 00007_create_gamification
-- Description: Create badges, player_badges, and player_streaks tables
-- ============================================================================

-- Badge definitions
CREATE TABLE badges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT UNIQUE NOT NULL,
  name_ja        TEXT NOT NULL,
  description    TEXT NOT NULL,
  description_ja TEXT NOT NULL,
  icon           TEXT NOT NULL,
  criteria       JSONB NOT NULL,
  category       TEXT DEFAULT 'achievement'
);

-- Badges earned by players
CREATE TABLE player_badges (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id  UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  badge_id   UUID NOT NULL REFERENCES badges   ON DELETE CASCADE,
  earned_at  TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID REFERENCES sessions ON DELETE SET NULL,
  UNIQUE (player_id, badge_id)
);

-- Running streaks per player (attendance, improvement, etc.)
CREATE TABLE player_streaks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id       UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  streak_type     TEXT NOT NULL,
  current_count   INTEGER DEFAULT 0,
  best_count      INTEGER DEFAULT 0,
  last_session_id UUID REFERENCES sessions ON DELETE SET NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (player_id, streak_type)
);
