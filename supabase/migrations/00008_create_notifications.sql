-- ============================================================================
-- Migration: 00008_create_notifications
-- Description: Create notifications, data_imports, and audit_log tables
-- ============================================================================

-- In-app notifications
CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  type         notification_type NOT NULL,
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  data         JSONB,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- CSV / spreadsheet import tracking
CREATE TABLE data_imports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       UUID NOT NULL REFERENCES teams    ON DELETE CASCADE,
  imported_by   UUID NOT NULL REFERENCES profiles  ON DELETE CASCADE,
  file_name     TEXT NOT NULL,
  file_url      TEXT,
  rows_imported INTEGER DEFAULT 0,
  rows_skipped  INTEGER DEFAULT 0,
  errors        JSONB,
  status        TEXT DEFAULT 'pending'
                CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- General-purpose audit log
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles ON DELETE SET NULL,
  action      TEXT NOT NULL,
  table_name  TEXT NOT NULL,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
