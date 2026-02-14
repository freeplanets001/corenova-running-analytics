-- ============================================================================
-- Migration: 00009_create_indexes
-- Description: Create indexes for foreign keys and common query patterns
-- ============================================================================

-- ── profiles ────────────────────────────────────────────────────────────────
CREATE INDEX idx_profiles_email      ON profiles (email);
CREATE INDEX idx_profiles_role       ON profiles (role);
CREATE INDEX idx_profiles_is_active  ON profiles (is_active);

-- ── team_members ────────────────────────────────────────────────────────────
CREATE INDEX idx_team_members_team_id    ON team_members (team_id);
CREATE INDEX idx_team_members_profile_id ON team_members (profile_id);

-- ── test_types ──────────────────────────────────────────────────────────────
CREATE INDEX idx_test_types_team_id   ON test_types (team_id);
CREATE INDEX idx_test_types_is_active ON test_types (is_active);

-- ── sessions ────────────────────────────────────────────────────────────────
CREATE INDEX idx_sessions_team_id      ON sessions (team_id);
CREATE INDEX idx_sessions_test_type_id ON sessions (test_type_id);
CREATE INDEX idx_sessions_session_date ON sessions (session_date DESC);
CREATE INDEX idx_sessions_created_by   ON sessions (created_by);
CREATE INDEX idx_sessions_team_date    ON sessions (team_id, session_date DESC);

-- ── session_attendance ──────────────────────────────────────────────────────
CREATE INDEX idx_session_attendance_session_id ON session_attendance (session_id);
CREATE INDEX idx_session_attendance_player_id  ON session_attendance (player_id);
CREATE INDEX idx_session_attendance_status     ON session_attendance (status);

-- ── session_runs ────────────────────────────────────────────────────────────
CREATE INDEX idx_session_runs_session_id ON session_runs (session_id);
CREATE INDEX idx_session_runs_player_id  ON session_runs (player_id);
CREATE INDEX idx_session_runs_session_player ON session_runs (session_id, player_id);

-- ── session_player_stats ────────────────────────────────────────────────────
CREATE INDEX idx_session_player_stats_session_id ON session_player_stats (session_id);
CREATE INDEX idx_session_player_stats_player_id  ON session_player_stats (player_id);

-- ── goals ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_goals_team_id      ON goals (team_id);
CREATE INDEX idx_goals_player_id    ON goals (player_id);
CREATE INDEX idx_goals_created_by   ON goals (created_by);
CREATE INDEX idx_goals_test_type_id ON goals (test_type_id);
CREATE INDEX idx_goals_status       ON goals (status);
CREATE INDEX idx_goals_scope        ON goals (scope);
CREATE INDEX idx_goals_target_date  ON goals (target_date);

-- ── goal_milestones ─────────────────────────────────────────────────────────
CREATE INDEX idx_goal_milestones_goal_id ON goal_milestones (goal_id);

-- ── ai_insights ─────────────────────────────────────────────────────────────
CREATE INDEX idx_ai_insights_team_id      ON ai_insights (team_id);
CREATE INDEX idx_ai_insights_session_id   ON ai_insights (session_id);
CREATE INDEX idx_ai_insights_player_id    ON ai_insights (player_id);
CREATE INDEX idx_ai_insights_insight_type ON ai_insights (insight_type);
CREATE INDEX idx_ai_insights_created_at   ON ai_insights (created_at DESC);

-- ── ai_conversations ────────────────────────────────────────────────────────
CREATE INDEX idx_ai_conversations_team_id ON ai_conversations (team_id);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations (user_id);

-- ── ai_chat_messages ────────────────────────────────────────────────────────
CREATE INDEX idx_ai_chat_messages_conversation_id ON ai_chat_messages (conversation_id);
CREATE INDEX idx_ai_chat_messages_created_at      ON ai_chat_messages (created_at);

-- ── badges / player_badges ──────────────────────────────────────────────────
CREATE INDEX idx_player_badges_player_id  ON player_badges (player_id);
CREATE INDEX idx_player_badges_badge_id   ON player_badges (badge_id);
CREATE INDEX idx_player_badges_session_id ON player_badges (session_id);

-- ── player_streaks ──────────────────────────────────────────────────────────
CREATE INDEX idx_player_streaks_player_id ON player_streaks (player_id);

-- ── notifications ───────────────────────────────────────────────────────────
CREATE INDEX idx_notifications_recipient_id ON notifications (recipient_id);
CREATE INDEX idx_notifications_type         ON notifications (type);
CREATE INDEX idx_notifications_read_at      ON notifications (read_at)
  WHERE read_at IS NULL;                      -- partial index for unread
CREATE INDEX idx_notifications_created_at   ON notifications (created_at DESC);

-- ── data_imports ────────────────────────────────────────────────────────────
CREATE INDEX idx_data_imports_team_id     ON data_imports (team_id);
CREATE INDEX idx_data_imports_imported_by ON data_imports (imported_by);
CREATE INDEX idx_data_imports_status      ON data_imports (status);

-- ── audit_log ───────────────────────────────────────────────────────────────
CREATE INDEX idx_audit_log_user_id    ON audit_log (user_id);
CREATE INDEX idx_audit_log_table_name ON audit_log (table_name);
CREATE INDEX idx_audit_log_record_id  ON audit_log (record_id);
CREATE INDEX idx_audit_log_created_at ON audit_log (created_at DESC);
