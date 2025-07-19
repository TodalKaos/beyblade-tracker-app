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
