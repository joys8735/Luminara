-- Unified Points System - Supabase Schema
-- This file contains all SQL migrations for the points system

-- ============================================================================
-- Points Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alpha_points INTEGER DEFAULT 0 CHECK (alpha_points >= 0),
  reward_points INTEGER DEFAULT 0 CHECK (reward_points >= 0),
  platform_balance INTEGER DEFAULT 0 CHECK (platform_balance >= 0),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_points_user_id ON points(user_id);
CREATE INDEX IF NOT EXISTS idx_points_last_updated ON points(last_updated);

-- ============================================================================
-- Transactions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('add', 'subtract', 'transfer', 'achievement_bonus', 'level_bonus', 'migration')),
  points_type VARCHAR(20) NOT NULL CHECK (points_type IN ('alpha', 'rewards', 'balance')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  reason TEXT,
  balance_before INTEGER NOT NULL CHECK (balance_before >= 0),
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_operation_type ON transactions(operation_type);
CREATE INDEX IF NOT EXISTS idx_transactions_points_type ON transactions(points_type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_timestamp ON transactions(user_id, timestamp DESC);

-- ============================================================================
-- Achievements Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  points_threshold INTEGER NOT NULL CHECK (points_threshold >= 0),
  reward_points INTEGER DEFAULT 0 CHECK (reward_points >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

CREATE INDEX IF NOT EXISTS idx_achievements_points_threshold ON achievements(points_threshold);

-- ============================================================================
-- User Achievements Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);

-- ============================================================================
-- User Levels Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level VARCHAR(20) NOT NULL CHECK (current_level IN ('Bronze', 'Silver', 'Gold')),
  total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
  last_level_up_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_current_level ON user_levels(current_level);
CREATE INDEX IF NOT EXISTS idx_user_levels_total_points ON user_levels(total_points DESC);

-- ============================================================================
-- Migration Status Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS migration_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  migrated BOOLEAN DEFAULT FALSE,
  migrated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_migration_status_user_id ON migration_status(user_id);
CREATE INDEX IF NOT EXISTS idx_migration_status_migrated ON migration_status(migrated);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE points ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_status ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for Points Table
-- ============================================================================

CREATE POLICY "Users can view their own points" ON points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own points" ON points
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all points" ON points
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- RLS Policies for Transactions Table
-- ============================================================================

CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions" ON transactions
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- RLS Policies for Achievements Table
-- ============================================================================

CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage achievements" ON achievements
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- RLS Policies for User Achievements Table
-- ============================================================================

CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all user achievements" ON user_achievements
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- RLS Policies for User Levels Table
-- ============================================================================

CREATE POLICY "Users can view their own level" ON user_levels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all user levels" ON user_levels
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- RLS Policies for Migration Status Table
-- ============================================================================

CREATE POLICY "Users can view their own migration status" ON migration_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all migration status" ON migration_status
  FOR ALL USING (auth.role() = 'service_role');
