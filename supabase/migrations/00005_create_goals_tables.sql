-- ============================================================================
-- Migration: 00005_create_goals_tables
-- Description: Create goals and goal_milestones tables
-- ============================================================================

-- Goals (personal, team, or individual-target)
CREATE TABLE goals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id             UUID NOT NULL REFERENCES teams      ON DELETE CASCADE,
  scope               goal_scope NOT NULL,
  metric              goal_metric NOT NULL,
  test_type_id        UUID REFERENCES test_types ON DELETE SET NULL,
  player_id           UUID REFERENCES profiles   ON DELETE CASCADE,
  created_by          UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT,
  target_value        NUMERIC(8,2) NOT NULL,
  current_value       NUMERIC(8,2) DEFAULT 0,
  baseline_value      NUMERIC(8,2),
  unit                TEXT DEFAULT 'seconds',
  direction           TEXT DEFAULT 'decrease'
                      CHECK (direction IN ('increase', 'decrease')),
  start_date          DATE DEFAULT CURRENT_DATE,
  target_date         DATE NOT NULL,
  status              goal_status DEFAULT 'active',
  progress_percentage NUMERIC(5,2) DEFAULT 0,
  achieved_at         TIMESTAMPTZ,
  ai_suggested        BOOLEAN DEFAULT false,
  ai_reasoning        TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Intermediate milestones within a goal
CREATE TABLE goal_milestones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id      UUID NOT NULL REFERENCES goals ON DELETE CASCADE,
  title        TEXT NOT NULL,
  target_value NUMERIC(8,2) NOT NULL,
  achieved     BOOLEAN DEFAULT false,
  achieved_at  TIMESTAMPTZ,
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
