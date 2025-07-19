-- Update database schema to add user_id to all tables
-- Run this in Supabase SQL Editor to make data user-specific

-- Add user_id column to beyblade_parts table
ALTER TABLE beyblade_parts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to beyblade_combos table  
ALTER TABLE beyblade_combos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to tournaments table
ALTER TABLE tournaments ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to filter by user_id
DROP POLICY IF EXISTS "Enable all operations for beyblade_parts" ON beyblade_parts;
DROP POLICY IF EXISTS "Enable all operations for beyblade_combos" ON beyblade_combos;
DROP POLICY IF EXISTS "Enable all operations for tournaments" ON tournaments;

-- Create user-specific policies for beyblade_parts
CREATE POLICY "Users can only see their own parts" ON beyblade_parts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own parts" ON beyblade_parts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create user-specific policies for beyblade_combos
CREATE POLICY "Users can only see their own combos" ON beyblade_combos
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own combos" ON beyblade_combos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create user-specific policies for tournaments
CREATE POLICY "Users can only see their own tournaments" ON tournaments
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own tournaments" ON tournaments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Clear existing sample data (since it doesn't have user_id)
DELETE FROM tournaments;
DELETE FROM beyblade_combos;
DELETE FROM beyblade_parts;

-- Note: New users will start with empty collections
-- They can add their own parts, combos, and tournaments
