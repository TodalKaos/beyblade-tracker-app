-- Add placement and total_players columns to tournaments table
-- Run this in Supabase SQL Editor to add the new tournament fields

ALTER TABLE tournaments ADD COLUMN placement INTEGER;
ALTER TABLE tournaments ADD COLUMN total_players INTEGER;

-- Optional: Add check constraints to ensure valid values
ALTER TABLE tournaments ADD CONSTRAINT check_placement_positive CHECK (placement IS NULL OR placement > 0);
ALTER TABLE tournaments ADD CONSTRAINT check_total_players_positive CHECK (total_players IS NULL OR total_players > 0);
ALTER TABLE tournaments ADD CONSTRAINT check_placement_not_greater_than_total CHECK (placement IS NULL OR total_players IS NULL OR placement <= total_players);
