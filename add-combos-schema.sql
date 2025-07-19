-- Add Combos and Tournaments Tables to Existing Database
-- Run this in Supabase SQL Editor if you haven't already

-- Beyblade Combos Table
CREATE TABLE IF NOT EXISTS beyblade_combos (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    blade_id BIGINT REFERENCES beyblade_parts(id) ON DELETE SET NULL,
    assist_blade_id BIGINT REFERENCES beyblade_parts(id) ON DELETE SET NULL,
    ratchet_id BIGINT REFERENCES beyblade_parts(id) ON DELETE SET NULL,
    bit_id BIGINT REFERENCES beyblade_parts(id) ON DELETE SET NULL,
    notes TEXT,
    total_points INTEGER DEFAULT 0,
    tournaments_used INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0
);

-- Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    location TEXT,
    tournament_date DATE NOT NULL,
    combo1_id BIGINT REFERENCES beyblade_combos(id) ON DELETE SET NULL,
    combo2_id BIGINT REFERENCES beyblade_combos(id) ON DELETE SET NULL,
    combo3_id BIGINT REFERENCES beyblade_combos(id) ON DELETE SET NULL,
    combo1_points INTEGER DEFAULT 0,
    combo2_points INTEGER DEFAULT 0,
    combo3_points INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    notes TEXT
);

-- Enable RLS for new tables
ALTER TABLE beyblade_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now
CREATE POLICY "Enable all operations for beyblade_combos" ON beyblade_combos
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for tournaments" ON tournaments
    FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_beyblade_combos_name ON beyblade_combos(name);
CREATE INDEX IF NOT EXISTS idx_beyblade_combos_total_points ON beyblade_combos(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(tournament_date DESC);
CREATE INDEX IF NOT EXISTS idx_tournaments_total_points ON tournaments(total_points DESC);

-- Insert some sample combos (using the parts we created earlier)
-- Note: This assumes your part IDs start from 1
INSERT INTO beyblade_combos (name, blade_id, assist_blade_id, ratchet_id, bit_id, notes) VALUES
    ('DranSword Starter', 1, NULL, 4, 6, 'Basic starter combo'),
    ('WizardArrow Attack', 2, NULL, 5, 7, 'Aggressive attack type'),
    ('KnightShield Defense', 3, NULL, 4, 8, 'Defensive setup')
ON CONFLICT DO NOTHING;

-- Insert some sample tournaments
INSERT INTO tournaments (name, location, tournament_date, combo1_id, combo2_id, combo3_id, combo1_points, combo2_points, combo3_points, total_points) VALUES
    ('Local Tournament #1', 'Community Center', '2025-01-15', 1, 2, 3, 8, 12, 6, 26),
    ('Weekly Beyblade Battle', 'Toy Store', '2025-01-22', 2, 1, 3, 15, 10, 8, 33)
ON CONFLICT DO NOTHING;

-- Update combo stats based on tournament results
UPDATE beyblade_combos SET 
    total_points = (SELECT COALESCE(SUM(combo1_points), 0) FROM tournaments WHERE combo1_id = beyblade_combos.id) +
                   (SELECT COALESCE(SUM(combo2_points), 0) FROM tournaments WHERE combo2_id = beyblade_combos.id) +
                   (SELECT COALESCE(SUM(combo3_points), 0) FROM tournaments WHERE combo3_id = beyblade_combos.id),
    tournaments_used = (SELECT COUNT(*) FROM tournaments WHERE combo1_id = beyblade_combos.id OR combo2_id = beyblade_combos.id OR combo3_id = beyblade_combos.id);
