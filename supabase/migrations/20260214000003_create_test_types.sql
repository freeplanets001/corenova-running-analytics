-- ============================================================================
-- Migration: 00003_create_test_types
-- Description: Create test_types table for configurable drill / test definitions
-- ============================================================================

CREATE TABLE test_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID REFERENCES teams ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  unit        TEXT DEFAULT '秒',
  direction   TEXT DEFAULT 'decrease'
              CHECK (direction IN ('decrease', 'increase')),
  min_value   NUMERIC(8,2),
  max_value   NUMERIC(8,2),
  min_runs    INTEGER DEFAULT 1,
  max_runs    INTEGER DEFAULT 12,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
