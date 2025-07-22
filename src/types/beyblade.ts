// Beyblade part types
export type PartType = 'blade' | 'assist_blade' | 'ratchet' | 'bit'

export interface BeybladePartDB {
    id: number
    created_at: string
    name: string
    type: PartType
    quantity: number
    series?: string
    color?: string
    notes?: string
}

export interface BeybladeCombo {
    id: number
    created_at: string
    name: string
    blade_id: number | null
    assist_blade_id: number | null
    ratchet_id: number | null
    bit_id: number | null
    notes?: string
    total_points: number
    tournaments_used: number
    wins: number
    losses: number
}

export interface Tournament {
    id: number
    created_at: string
    name: string
    location?: string
    tournament_date: string
    combo1_id: number | null
    combo2_id: number | null
    combo3_id: number | null
    combo1_points: number
    combo2_points: number
    combo3_points: number
    total_points: number
    placement?: number
    total_players?: number
    notes?: string
}

// Extended combo with part details for display
export interface ComboWithParts extends BeybladeCombo {
    blade?: BeybladePartDB
    assist_blade?: BeybladePartDB
    ratchet?: BeybladePartDB
    bit?: BeybladePartDB
}

// Tournament with combo details for display
export interface TournamentWithCombos extends Tournament {
    combo1?: ComboWithParts
    combo2?: ComboWithParts
    combo3?: ComboWithParts
}

// For forms and frontend
export interface BeybladePartCreate {
    name: string
    type: PartType
    quantity: number
    series?: string
    color?: string
    notes?: string
}

export interface BeybladeComboCreate {
    name: string
    blade_id: number | null
    assist_blade_id: number | null
    ratchet_id: number | null
    bit_id: number | null
    notes?: string
}

export interface TournamentCreate {
    name: string
    location?: string
    tournament_date: string
    combo1_id: number | null
    combo2_id: number | null
    combo3_id: number | null
    combo1_points: number
    combo2_points: number
    combo3_points: number
    placement?: number
    total_players?: number
    notes?: string
}

// Testing/Practice Battle Types
export type FinishType = 'spin' | 'over' | 'burst' | 'xtreme'

export interface TestBattle {
    id: number
    created_at: string
    combo1_id: number
    combo2_id: number
    combo1_score: number
    combo2_score: number
    winner_combo_id: number | null
    battle_date: string
    notes?: string
}

export interface TestBattleWithCombos extends TestBattle {
    combo1: ComboWithParts
    combo2: ComboWithParts
}

export interface TestBattleCreate {
    combo1_id: number
    combo2_id: number
    combo1_score: number
    combo2_score: number
    winner_combo_id: number | null
    battle_date: string
    notes?: string
}

export interface ComboTestStats {
    combo_id: number
    combo: ComboWithParts
    total_battles: number
    wins: number
    losses: number
    total_points_scored: number
    total_points_against: number
    win_rate: number
    average_points_scored: number
    average_points_against: number
}
