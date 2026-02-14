-- ============================================================================
-- Migration: 00002_create_core_tables
-- Description: Create teams, profiles, and team_members tables
-- ============================================================================

-- Teams
CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  sport       TEXT DEFAULT 'basketball',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id                       UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email                    TEXT UNIQUE NOT NULL,
  display_name             TEXT NOT NULL,
  avatar_url               TEXT,
  role                     user_role DEFAULT 'viewer',
  player_name              TEXT,
  jersey_number            INTEGER,
  position                 TEXT,
  date_of_birth            DATE,
  height_cm                NUMERIC(5,1),
  weight_kg                NUMERIC(5,1),
  is_active                BOOLEAN DEFAULT true,
  locale                   TEXT DEFAULT 'ja',
  notification_preferences JSONB,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-many relationship between teams and profiles
CREATE TABLE team_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    UUID NOT NULL REFERENCES teams    ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  role       user_role DEFAULT 'player',
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, profile_id)
);
