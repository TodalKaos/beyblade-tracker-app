// Beyblade part types
export type PartType = 'blade' | 'assist_blade' | 'ratchet' | 'bit' | 'lock_chip'

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
    lock_chip_id: number | null
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

// New types for enhanced tournament tracking
export interface TournamentMatch {
    id: number
    created_at: string
    tournament_id: number
    round_number: number
    opponent_name?: string
    my_combo_id: number
    opponent_combo?: string
    result: 'win' | 'loss' | 'tie'
    my_score: number
    opponent_score: number
    notes?: string
}

export interface TournamentMatchWithCombo extends TournamentMatch {
    my_combo: ComboWithParts
}

export interface UpcomingTournament {
    id: number
    created_at: string
    name: string
    location?: string
    tournament_date: string
    entry_fee?: number
    prize_pool?: string
    format?: string
    registration_deadline?: string
    notes?: string
    is_registered: boolean
}

export interface DeckRecommendation {
    combos: ComboWithParts[]
    confidence_score: number
    reasons: string[]
    expected_performance: {
        win_rate: number
        avg_points: number
    }
}

// Extended combo with part details for display
export interface ComboWithParts extends BeybladeCombo {
    blade?: BeybladePartDB
    assist_blade?: BeybladePartDB
    ratchet?: BeybladePartDB
    bit?: BeybladePartDB
    lock_chip?: BeybladePartDB
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
    lock_chip_id: number | null
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

export interface TournamentMatchCreate {
    tournament_id: number
    round_number: number
    opponent_name?: string
    my_combo_id: number
    opponent_combo?: string
    result: 'win' | 'loss' | 'tie'
    my_score: number
    opponent_score: number
    notes?: string
}

export interface UpcomingTournamentCreate {
    name: string
    location?: string
    tournament_date: string
    entry_fee?: number
    prize_pool?: string
    format?: string
    registration_deadline?: string
    notes?: string
    is_registered: boolean
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
