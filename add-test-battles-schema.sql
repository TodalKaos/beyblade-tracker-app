-- Create test_battles table for practice battles
CREATE TABLE test_battles (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    combo1_id INTEGER REFERENCES beyblade_combos(id) ON DELETE CASCADE,
    combo2_id INTEGER REFERENCES beyblade_combos(id) ON DELETE CASCADE,
    combo1_score INTEGER NOT NULL DEFAULT 0,
    combo2_score INTEGER NOT NULL DEFAULT 0,
    winner_combo_id INTEGER REFERENCES beyblade_combos(id) ON DELETE SET NULL,
    battle_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT
);

-- Add Row Level Security (RLS)
ALTER TABLE test_battles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own test battles" ON test_battles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test battles" ON test_battles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test battles" ON test_battles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own test battles" ON test_battles
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_test_battles_user_id ON test_battles(user_id);
CREATE INDEX idx_test_battles_combo1_id ON test_battles(combo1_id);
CREATE INDEX idx_test_battles_combo2_id ON test_battles(combo2_id);
CREATE INDEX idx_test_battles_battle_date ON test_battles(battle_date);
CREATE INDEX idx_test_battles_created_at ON test_battles(created_at);

-- Add check constraints
ALTER TABLE test_battles ADD CONSTRAINT check_different_combos 
    CHECK (combo1_id != combo2_id);

ALTER TABLE test_battles ADD CONSTRAINT check_positive_scores 
    CHECK (combo1_score >= 0 AND combo2_score >= 0);

ALTER TABLE test_battles ADD CONSTRAINT check_winner_is_participant 
    CHECK (winner_combo_id IS NULL OR winner_combo_id = combo1_id OR winner_combo_id = combo2_id);
