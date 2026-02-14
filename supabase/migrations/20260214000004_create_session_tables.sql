-- ============================================================================
-- Migration: 00004_create_session_tables
-- Description: Create sessions, attendance, runs, and per-session player stats
-- ============================================================================

-- Sessions (one test event on a given date)
CREATE TABLE sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id           UUID NOT NULL REFERENCES teams       ON DELETE CASCADE,
  test_type_id      UUID NOT NULL REFERENCES test_types   ON DELETE CASCADE,
  session_date      DATE NOT NULL,
  target_run_count  INTEGER,
  location          TEXT,
  weather           TEXT,
  temperature_celsius NUMERIC(4,1),
  notes             TEXT,
  created_by        UUID REFERENCES profiles ON DELETE SET NULL,
  is_locked         BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, session_date, test_type_id)
);

-- Per-session attendance for each player
CREATE TABLE session_attendance (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions ON DELETE CASCADE,
  player_id  UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  status     attendance_status DEFAULT 'present',
  reason     TEXT,
  UNIQUE (session_id, player_id)
);

-- Individual run results within a session
CREATE TABLE session_runs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES sessions ON DELETE CASCADE,
  player_id   UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  run_number  INTEGER NOT NULL CHECK (run_number >= 1 AND run_number <= 12),
  value       NUMERIC(8,2) NOT NULL CHECK (value > 0),
  is_valid    BOOLEAN DEFAULT true,
  entered_by  UUID REFERENCES profiles ON DELETE SET NULL,
  source      TEXT DEFAULT 'manual',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, player_id, run_number)
);

-- Computed per-session statistics for each player (materialised by trigger)
CREATE TABLE session_player_stats (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID NOT NULL REFERENCES sessions ON DELETE CASCADE,
  player_id         UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  run_count         INTEGER DEFAULT 0,
  average_value     NUMERIC(6,2),
  best_value        NUMERIC(5,1),
  worst_value       NUMERIC(5,1),
  std_deviation     NUMERIC(6,3),
  fatigue_index     NUMERIC(5,2),
  consistency_score NUMERIC(5,2),
  rank_in_session   INTEGER,
  computed_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, player_id)
);
