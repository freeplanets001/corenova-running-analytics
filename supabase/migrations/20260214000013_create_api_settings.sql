-- Team-level API settings (stored encrypted)
CREATE TABLE IF NOT EXISTS api_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'gemini',
  api_key_encrypted TEXT,
  model_name TEXT DEFAULT 'gemini-2.0-flash',
  is_configured BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id),
  UNIQUE(team_id, provider)
);

-- RLS
ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write api_settings
CREATE POLICY "admin_read_api_settings" ON api_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = api_settings.team_id
      AND tm.profile_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

CREATE POLICY "admin_write_api_settings" ON api_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = api_settings.team_id
      AND tm.profile_id = auth.uid()
      AND tm.role = 'admin'
    )
  );
