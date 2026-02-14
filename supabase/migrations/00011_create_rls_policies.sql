-- ============================================================================
-- Migration: 00011_create_rls_policies
-- Description: Enable Row Level Security on every table and create policies
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- Helper functions used by policies
-- ────────────────────────────────────────────────────────────────────────────

-- Return the user_role for the current auth user in a given team
CREATE OR REPLACE FUNCTION get_user_team_role(p_team_id UUID)
RETURNS user_role AS $$
  SELECT tm.role
  FROM team_members tm
  WHERE tm.team_id    = p_team_id
    AND tm.profile_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Convenience: is the current user an admin in any of their teams?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE profile_id = auth.uid()
      AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Return all team IDs the current user belongs to
CREATE OR REPLACE FUNCTION get_user_team_ids()
RETURNS SETOF UUID AS $$
  SELECT team_id FROM team_members WHERE profile_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────────────────────
-- Enable RLS on every table
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE teams                ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_types           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendance   ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_runs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals                ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges               ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_badges        ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_streaks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_imports         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log            ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- teams
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY teams_select ON teams
  FOR SELECT USING (
    id IN (SELECT get_user_team_ids())
  );

CREATE POLICY teams_insert ON teams
  FOR INSERT WITH CHECK (true);  -- any authenticated user can create a team

CREATE POLICY teams_update ON teams
  FOR UPDATE USING (
    get_user_team_role(id) = 'admin'
  );

CREATE POLICY teams_delete ON teams
  FOR DELETE USING (
    get_user_team_role(id) = 'admin'
  );

-- ────────────────────────────────────────────────────────────────────────────
-- profiles
-- ────────────────────────────────────────────────────────────────────────────

-- Users can read profiles of teammates
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR id IN (
      SELECT tm.profile_id FROM team_members tm
      WHERE tm.team_id IN (SELECT get_user_team_ids())
    )
  );

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Admins can update any teammate profile
CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE USING (
    is_admin()
    AND id IN (
      SELECT tm.profile_id FROM team_members tm
      WHERE tm.team_id IN (SELECT get_user_team_ids())
    )
  );

-- New profile on sign-up
CREATE POLICY profiles_insert ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- team_members
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY team_members_select ON team_members
  FOR SELECT USING (
    team_id IN (SELECT get_user_team_ids())
  );

CREATE POLICY team_members_insert ON team_members
  FOR INSERT WITH CHECK (
    get_user_team_role(team_id) = 'admin'
    OR profile_id = auth.uid()  -- user can join a team
  );

CREATE POLICY team_members_update ON team_members
  FOR UPDATE USING (
    get_user_team_role(team_id) = 'admin'
  );

CREATE POLICY team_members_delete ON team_members
  FOR DELETE USING (
    get_user_team_role(team_id) = 'admin'
    OR profile_id = auth.uid()
  );

-- ────────────────────────────────────────────────────────────────────────────
-- test_types
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY test_types_select ON test_types
  FOR SELECT USING (
    team_id IS NULL  -- global test types
    OR team_id IN (SELECT get_user_team_ids())
  );

CREATE POLICY test_types_insert ON test_types
  FOR INSERT WITH CHECK (
    get_user_team_role(team_id) = 'admin'
  );

CREATE POLICY test_types_update ON test_types
  FOR UPDATE USING (
    get_user_team_role(team_id) = 'admin'
  );

CREATE POLICY test_types_delete ON test_types
  FOR DELETE USING (
    get_user_team_role(team_id) = 'admin'
  );

-- ────────────────────────────────────────────────────────────────────────────
-- sessions
-- ────────────────────────────────────────────────────────────────────────────

-- All team members can read sessions
CREATE POLICY sessions_select ON sessions
  FOR SELECT USING (
    team_id IN (SELECT get_user_team_ids())
  );

-- Only admins can create / update / delete sessions
CREATE POLICY sessions_insert ON sessions
  FOR INSERT WITH CHECK (
    get_user_team_role(team_id) = 'admin'
  );

CREATE POLICY sessions_update ON sessions
  FOR UPDATE USING (
    get_user_team_role(team_id) = 'admin'
  );

CREATE POLICY sessions_delete ON sessions
  FOR DELETE USING (
    get_user_team_role(team_id) = 'admin'
  );

-- ────────────────────────────────────────────────────────────────────────────
-- session_attendance
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY session_attendance_select ON session_attendance
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM sessions WHERE team_id IN (SELECT get_user_team_ids())
    )
  );

CREATE POLICY session_attendance_insert ON session_attendance
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM sessions WHERE get_user_team_role(team_id) = 'admin'
    )
  );

CREATE POLICY session_attendance_update ON session_attendance
  FOR UPDATE USING (
    session_id IN (
      SELECT id FROM sessions WHERE get_user_team_role(team_id) = 'admin'
    )
  );

CREATE POLICY session_attendance_delete ON session_attendance
  FOR DELETE USING (
    session_id IN (
      SELECT id FROM sessions WHERE get_user_team_role(team_id) = 'admin'
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- session_runs
-- ────────────────────────────────────────────────────────────────────────────

-- All team members can read runs
CREATE POLICY session_runs_select ON session_runs
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM sessions WHERE team_id IN (SELECT get_user_team_ids())
    )
  );

-- Players can insert their own runs
CREATE POLICY session_runs_insert_player ON session_runs
  FOR INSERT WITH CHECK (
    player_id = auth.uid()
    AND session_id IN (
      SELECT id FROM sessions WHERE team_id IN (SELECT get_user_team_ids())
    )
  );

-- Admins can insert any runs
CREATE POLICY session_runs_insert_admin ON session_runs
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM sessions WHERE get_user_team_role(team_id) = 'admin'
    )
  );

-- Admins can update / delete runs
CREATE POLICY session_runs_update ON session_runs
  FOR UPDATE USING (
    session_id IN (
      SELECT id FROM sessions WHERE get_user_team_role(team_id) = 'admin'
    )
  );

CREATE POLICY session_runs_delete ON session_runs
  FOR DELETE USING (
    session_id IN (
      SELECT id FROM sessions WHERE get_user_team_role(team_id) = 'admin'
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- session_player_stats
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY session_player_stats_select ON session_player_stats
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM sessions WHERE team_id IN (SELECT get_user_team_ids())
    )
  );

-- Stats are managed by the trigger; admin can also manually adjust
CREATE POLICY session_player_stats_all_admin ON session_player_stats
  FOR ALL USING (
    session_id IN (
      SELECT id FROM sessions WHERE get_user_team_role(team_id) = 'admin'
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- goals
-- ────────────────────────────────────────────────────────────────────────────

-- Players can see own goals + team-scope goals; admin sees all
CREATE POLICY goals_select ON goals
  FOR SELECT USING (
    team_id IN (SELECT get_user_team_ids())
    AND (
      scope = 'team'
      OR player_id = auth.uid()
      OR created_by = auth.uid()
      OR get_user_team_role(team_id) = 'admin'
    )
  );

-- Players can create personal goals
CREATE POLICY goals_insert_player ON goals
  FOR INSERT WITH CHECK (
    scope = 'personal'
    AND player_id = auth.uid()
    AND created_by = auth.uid()
    AND team_id IN (SELECT get_user_team_ids())
  );

-- Admins can create any goal type
CREATE POLICY goals_insert_admin ON goals
  FOR INSERT WITH CHECK (
    get_user_team_role(team_id) = 'admin'
  );

-- Players can update their own personal goals
CREATE POLICY goals_update_own ON goals
  FOR UPDATE USING (
    scope = 'personal'
    AND player_id = auth.uid()
    AND team_id IN (SELECT get_user_team_ids())
  );

-- Admins can update any goal
CREATE POLICY goals_update_admin ON goals
  FOR UPDATE USING (
    get_user_team_role(team_id) = 'admin'
  );

-- Only admins can delete goals
CREATE POLICY goals_delete ON goals
  FOR DELETE USING (
    get_user_team_role(team_id) = 'admin'
  );

-- ────────────────────────────────────────────────────────────────────────────
-- goal_milestones (follow the parent goal's visibility)
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY goal_milestones_select ON goal_milestones
  FOR SELECT USING (
    goal_id IN (SELECT id FROM goals)  -- RLS on goals already filters
  );

CREATE POLICY goal_milestones_insert ON goal_milestones
  FOR INSERT WITH CHECK (
    goal_id IN (SELECT id FROM goals)
  );

CREATE POLICY goal_milestones_update ON goal_milestones
  FOR UPDATE USING (
    goal_id IN (SELECT id FROM goals)
  );

CREATE POLICY goal_milestones_delete ON goal_milestones
  FOR DELETE USING (
    goal_id IN (SELECT id FROM goals)
  );

-- ────────────────────────────────────────────────────────────────────────────
-- ai_insights
-- ────────────────────────────────────────────────────────────────────────────

-- Team-level insights visible to all team members;
-- player-level insights visible only to the player and admins
CREATE POLICY ai_insights_select ON ai_insights
  FOR SELECT USING (
    team_id IN (SELECT get_user_team_ids())
    AND (
      player_id IS NULL                     -- team-level insight
      OR player_id = auth.uid()             -- own player insight
      OR get_user_team_role(team_id) = 'admin'
    )
  );

CREATE POLICY ai_insights_insert ON ai_insights
  FOR INSERT WITH CHECK (
    team_id IN (SELECT get_user_team_ids())
  );

CREATE POLICY ai_insights_update ON ai_insights
  FOR UPDATE USING (
    team_id IN (SELECT get_user_team_ids())
    AND (
      player_id IS NULL
      OR player_id = auth.uid()
      OR get_user_team_role(team_id) = 'admin'
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- ai_conversations  (own only)
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY ai_conversations_select ON ai_conversations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY ai_conversations_insert ON ai_conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY ai_conversations_update ON ai_conversations
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY ai_conversations_delete ON ai_conversations
  FOR DELETE USING (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- ai_chat_messages  (own conversations only)
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY ai_chat_messages_select ON ai_chat_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM ai_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY ai_chat_messages_insert ON ai_chat_messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM ai_conversations WHERE user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- badges (read-only for everyone, admin can manage)
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY badges_select ON badges
  FOR SELECT USING (true);

CREATE POLICY badges_insert ON badges
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY badges_update ON badges
  FOR UPDATE USING (is_admin());

-- ────────────────────────────────────────────────────────────────────────────
-- player_badges
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY player_badges_select ON player_badges
  FOR SELECT USING (
    player_id IN (
      SELECT tm.profile_id FROM team_members tm
      WHERE tm.team_id IN (SELECT get_user_team_ids())
    )
  );

CREATE POLICY player_badges_insert ON player_badges
  FOR INSERT WITH CHECK (is_admin());

-- ────────────────────────────────────────────────────────────────────────────
-- player_streaks
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY player_streaks_select ON player_streaks
  FOR SELECT USING (
    player_id IN (
      SELECT tm.profile_id FROM team_members tm
      WHERE tm.team_id IN (SELECT get_user_team_ids())
    )
  );

CREATE POLICY player_streaks_insert ON player_streaks
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY player_streaks_update ON player_streaks
  FOR UPDATE USING (is_admin());

-- ────────────────────────────────────────────────────────────────────────────
-- notifications (own only)
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (recipient_id = auth.uid());

CREATE POLICY notifications_insert ON notifications
  FOR INSERT WITH CHECK (true);  -- system / service role inserts

CREATE POLICY notifications_delete ON notifications
  FOR DELETE USING (recipient_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- data_imports
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY data_imports_select ON data_imports
  FOR SELECT USING (
    team_id IN (SELECT get_user_team_ids())
  );

CREATE POLICY data_imports_insert ON data_imports
  FOR INSERT WITH CHECK (
    get_user_team_role(team_id) = 'admin'
  );

CREATE POLICY data_imports_update ON data_imports
  FOR UPDATE USING (
    get_user_team_role(team_id) = 'admin'
  );

-- ────────────────────────────────────────────────────────────────────────────
-- audit_log (admin read-only; inserts from service role / triggers)
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY audit_log_select ON audit_log
  FOR SELECT USING (is_admin());

CREATE POLICY audit_log_insert ON audit_log
  FOR INSERT WITH CHECK (true);  -- service role / triggers
