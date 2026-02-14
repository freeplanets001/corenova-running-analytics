-- ============================================================================
-- Migration: 00010_create_functions_triggers
-- Description: Create utility functions and triggers
--   - update_updated_at()  : auto-set updated_at on row modification
--   - recompute_player_stats() : recalculate session_player_stats on run changes
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Automatically maintain updated_at columns
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to every table that carries an updated_at column
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_session_runs_updated_at
  BEFORE UPDATE ON session_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Recompute session_player_stats whenever session_runs change
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION recompute_player_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_session_id UUID;
  v_player_id  UUID;
BEGIN
  -- Determine which session/player pair was affected
  IF TG_OP = 'DELETE' THEN
    v_session_id := OLD.session_id;
    v_player_id  := OLD.player_id;
  ELSE
    v_session_id := NEW.session_id;
    v_player_id  := NEW.player_id;
  END IF;

  -- Upsert the stats row
  INSERT INTO session_player_stats (
    session_id,
    player_id,
    run_count,
    average_value,
    best_value,
    worst_value,
    std_deviation,
    fatigue_index,
    consistency_score,
    computed_at
  )
  SELECT
    v_session_id,
    v_player_id,
    COUNT(*)::INTEGER,
    ROUND(AVG(value), 2),
    ROUND(MIN(value)::NUMERIC, 1),
    ROUND(MAX(value)::NUMERIC, 1),
    ROUND(STDDEV_SAMP(value)::NUMERIC, 3),
    -- fatigue_index: percentage difference between last and first run
    -- (positive = slower = more fatigued for "decrease" direction tests)
    CASE
      WHEN COUNT(*) >= 2 THEN
        ROUND(
          (
            (MAX(value) FILTER (WHERE run_number = (
              SELECT MAX(sr2.run_number) FROM session_runs sr2
              WHERE sr2.session_id = v_session_id
                AND sr2.player_id  = v_player_id
                AND sr2.is_valid   = true
            )))
            -
            (MIN(value) FILTER (WHERE run_number = (
              SELECT MIN(sr2.run_number) FROM session_runs sr2
              WHERE sr2.session_id = v_session_id
                AND sr2.player_id  = v_player_id
                AND sr2.is_valid   = true
            )))
          )
          / NULLIF(
              MIN(value) FILTER (WHERE run_number = (
                SELECT MIN(sr2.run_number) FROM session_runs sr2
                WHERE sr2.session_id = v_session_id
                  AND sr2.player_id  = v_player_id
                  AND sr2.is_valid   = true
              ))
            , 0) * 100
        , 2)
      ELSE NULL
    END,
    -- consistency_score: 100 - coefficient of variation (capped at 0)
    CASE
      WHEN COUNT(*) >= 2 AND AVG(value) > 0 THEN
        GREATEST(
          ROUND(100.0 - (STDDEV_SAMP(value) / AVG(value)) * 100, 2),
          0
        )
      ELSE NULL
    END,
    NOW()
  FROM session_runs
  WHERE session_id = v_session_id
    AND player_id  = v_player_id
    AND is_valid    = true
  ON CONFLICT (session_id, player_id) DO UPDATE SET
    run_count         = EXCLUDED.run_count,
    average_value     = EXCLUDED.average_value,
    best_value        = EXCLUDED.best_value,
    worst_value       = EXCLUDED.worst_value,
    std_deviation     = EXCLUDED.std_deviation,
    fatigue_index     = EXCLUDED.fatigue_index,
    consistency_score = EXCLUDED.consistency_score,
    computed_at       = EXCLUDED.computed_at;

  -- If all valid runs were deleted, remove the stats row entirely
  IF NOT EXISTS (
    SELECT 1 FROM session_runs
    WHERE session_id = v_session_id
      AND player_id  = v_player_id
      AND is_valid    = true
  ) THEN
    DELETE FROM session_player_stats
    WHERE session_id = v_session_id
      AND player_id  = v_player_id;
  END IF;

  RETURN NULL; -- AFTER trigger, return value is ignored
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_session_runs_stats
  AFTER INSERT OR UPDATE OR DELETE ON session_runs
  FOR EACH ROW EXECUTE FUNCTION recompute_player_stats();
