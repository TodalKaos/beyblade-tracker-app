import { supabase } from '@/lib/supabase'
import type {
    BeybladePartDB,
    BeybladePartCreate,
    PartType,
    BeybladeComboCreate,
    BeybladeCombo,
    ComboWithParts,
    TournamentCreate,
    Tournament,
    TournamentWithCombos
} from '@/types/beyblade'

// Get all parts for the current user
export async function getAllParts(): Promise<BeybladePartDB[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('beyblade_parts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching parts:', error)
        throw error
    }

    return data || []
}

// Get parts by type for the current user
export async function getPartsByType(type: PartType): Promise<BeybladePartDB[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('beyblade_parts')
        .select('*')
        .eq('type', type)
        .eq('user_id', user.id)
        .order('name')

    if (error) {
        console.error('Error fetching parts by type:', error)
        throw error
    }

    return data || []
}

// Add a new part for the current user
export async function addPart(part: BeybladePartCreate): Promise<BeybladePartDB> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('beyblade_parts')
        .insert([{ ...part, user_id: user.id }])
        .select()
        .single()

    if (error) {
        console.error('Error adding part:', error)
        throw error
    }

    return data
}

// Update part quantity (user-specific)
export async function updatePartQuantity(id: number, quantity: number): Promise<BeybladePartDB> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('beyblade_parts')
        .update({ quantity })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating part quantity:', error)
        throw error
    }

    return data
}

// Update a part completely (user-specific)
export async function updatePart(id: number, part: BeybladePartCreate): Promise<BeybladePartDB> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('beyblade_parts')
        .update(part)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating part:', error)
        throw error
    }

    return data
}

// Delete a part (user-specific)
export async function deletePart(id: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
        .from('beyblade_parts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting part:', error)
        throw error
    }
}

// Get collection statistics for the current user
export async function getCollectionStats() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('beyblade_parts')
        .select('type, quantity')
        .eq('user_id', user.id)

    if (error) {
        console.error('Error fetching collection stats:', error)
        throw error
    }

    const stats = {
        blade: 0,
        assist_blade: 0,
        ratchet: 0,
        bit: 0,
        total: 0
    }

    data?.forEach(part => {
        if (part.type in stats) {
            stats[part.type as PartType] += part.quantity
            stats.total += part.quantity
        }
    })

    return stats
}

// Search parts by name or filter by type
export async function searchParts(searchTerm: string = '', filterType: PartType | 'all' = 'all'): Promise<BeybladePartDB[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    let query = supabase
        .from('beyblade_parts')
        .select('*')
        .eq('user_id', user.id)

    // Filter by type if specified
    if (filterType !== 'all') {
        query = query.eq('type', filterType)
    }

    // Search by name if term provided
    if (searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error('Error searching parts:', error)
        throw error
    }

    return data || []
}

// COMBO OPERATIONS

// Get all combos with part details for the current user
export async function getAllCombos(): Promise<ComboWithParts[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('beyblade_combos')
        .select(`
      *,
      blade:blade_id(id, name, type, series, color),
      assist_blade:assist_blade_id(id, name, type, series, color),
      ratchet:ratchet_id(id, name, type, series, color),
      bit:bit_id(id, name, type, series, color)
    `)
        .eq('user_id', user.id)
        .order('total_points', { ascending: false })

    if (error) {
        console.error('Error fetching combos:', error)
        throw error
    }

    return data || []
}

// Add a new combo for the current user
export async function addCombo(combo: BeybladeComboCreate): Promise<BeybladeCombo> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('beyblade_combos')
        .insert([{ ...combo, user_id: user.id }])
        .select()
        .single()

    if (error) {
        console.error('Error adding combo:', error)
        throw error
    }

    return data
}

// Update a combo (user-specific)
export async function updateCombo(id: number, combo: BeybladeComboCreate): Promise<BeybladeCombo> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('beyblade_combos')
        .update(combo)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating combo:', error)
        throw error
    }

    return data
}

// Delete a combo (user-specific)
export async function deleteCombo(id: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
        .from('beyblade_combos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting combo:', error)
        throw error
    }
}

// TOURNAMENT OPERATIONS

// Get all tournaments with combo details for the current user
export async function getAllTournaments(): Promise<TournamentWithCombos[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('tournaments')
        .select(`
      *,
      combo1:combo1_id(id, name, total_points, blade:blade_id(name), assist_blade:assist_blade_id(name), ratchet:ratchet_id(name), bit:bit_id(name)),
      combo2:combo2_id(id, name, total_points, blade:blade_id(name), assist_blade:assist_blade_id(name), ratchet:ratchet_id(name), bit:bit_id(name)),
      combo3:combo3_id(id, name, total_points, blade:blade_id(name), assist_blade:assist_blade_id(name), ratchet:ratchet_id(name), bit:bit_id(name))
    `)
        .eq('user_id', user.id)
        .order('tournament_date', { ascending: false })

    if (error) {
        console.error('Error fetching tournaments:', error)
        throw error
    }

    return data || []
}

// Add a new tournament
export async function addTournament(tournament: TournamentCreate): Promise<Tournament> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Calculate total points
    const total_points = tournament.combo1_points + tournament.combo2_points + tournament.combo3_points

    const { data, error } = await supabase
        .from('tournaments')
        .insert([{ ...tournament, total_points, user_id: user.id }])
        .select()
        .single()

    if (error) {
        console.error('Error adding tournament:', error)
        throw error
    }

    // Update combo stats
    await updateComboStats()

    return data
}

// Update tournament
export async function updateTournament(id: number, tournament: TournamentCreate): Promise<Tournament> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const total_points = tournament.combo1_points + tournament.combo2_points + tournament.combo3_points

    const { data, error } = await supabase
        .from('tournaments')
        .update({ ...tournament, total_points })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating tournament:', error)
        throw error
    }

    // Update combo stats
    await updateComboStats()

    return data
}

// Delete tournament (user-specific)
export async function deleteTournament(id: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting tournament:', error)
        throw error
    }

    // Update combo stats
    await updateComboStats()
}

// Update combo statistics based on tournament results (user-specific)
async function updateComboStats(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: combos, error: combosError } = await supabase
        .from('beyblade_combos')
        .select('id')
        .eq('user_id', user.id)

    if (combosError || !combos) return

    for (const combo of combos) {
        const { data: tournaments, error: tournamentsError } = await supabase
            .from('tournaments')
            .select('combo1_id, combo2_id, combo3_id, combo1_points, combo2_points, combo3_points')
            .eq('user_id', user.id)

        if (tournamentsError || !tournaments) continue

        let total_points = 0
        let tournaments_used = 0

        tournaments.forEach(t => {
            if (t.combo1_id === combo.id) {
                total_points += t.combo1_points
                tournaments_used++
            }
            if (t.combo2_id === combo.id) {
                total_points += t.combo2_points
                tournaments_used++
            }
            if (t.combo3_id === combo.id) {
                total_points += t.combo3_points
                tournaments_used++
            }
        })

        await supabase
            .from('beyblade_combos')
            .update({
                total_points,
                tournaments_used
            })
            .eq('id', combo.id)
            .eq('user_id', user.id)
    }
}

// Get tournament statistics (user-specific)
export async function getTournamentStats() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('total_points, tournament_date')
        .eq('user_id', user.id)

    const { data: combos, error: combosError } = await supabase
        .from('beyblade_combos')
        .select('total_points')
        .eq('user_id', user.id)
        .order('total_points', { ascending: false })
        .limit(1)

    if (tournamentsError || combosError) {
        return {
            totalTournaments: 0,
            totalPoints: 0,
            averagePoints: 0,
            topComboPoints: 0
        }
    }

    const totalTournaments = tournaments?.length || 0
    const totalPoints = tournaments?.reduce((sum, t) => sum + t.total_points, 0) || 0
    const averagePoints = totalTournaments > 0 ? Math.round(totalPoints / totalTournaments) : 0
    const topComboPoints = combos?.[0]?.total_points || 0

    return {
        totalTournaments,
        totalPoints,
        averagePoints,
        topComboPoints
    }
}
