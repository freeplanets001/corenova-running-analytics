-- ============================================================================
-- Migration: 00006_create_ai_tables
-- Description: Create AI insights and conversation / chat message tables
-- ============================================================================

-- AI-generated insights (session summaries, trend reports, anomalies, etc.)
CREATE TABLE ai_insights (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id          UUID NOT NULL REFERENCES teams    ON DELETE CASCADE,
  insight_type     insight_type NOT NULL,
  session_id       UUID REFERENCES sessions ON DELETE SET NULL,
  player_id        UUID REFERENCES profiles ON DELETE SET NULL,
  title            TEXT NOT NULL,
  content          TEXT NOT NULL,
  summary          TEXT,
  severity         TEXT DEFAULT 'info'
                   CHECK (severity IN ('info', 'warning', 'positive', 'critical')),
  data_context     JSONB,
  model_used       TEXT DEFAULT 'claude-sonnet-4-20250514',
  prompt_tokens    INTEGER,
  completion_tokens INTEGER,
  is_read          BOOLEAN DEFAULT false,
  is_pinned        BOOLEAN DEFAULT false,
  is_dismissed     BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Chat-style AI conversation threads
CREATE TABLE ai_conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    UUID NOT NULL REFERENCES teams    ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  title      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual messages within a conversation
CREATE TABLE ai_chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         TEXT NOT NULL,
  data_context    JSONB,
  tokens_used     INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
