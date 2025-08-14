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
    TournamentWithCombos,
    TestBattle,
    TestBattleCreate,
    TestBattleWithCombos,
    ComboTestStats,
    FinishType
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
        lock_chip: 0,
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
      bit:bit_id(id, name, type, series, color),
      lock_chip:lock_chip_id(id, name, type, series, color)
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
      combo1:combo1_id(id, name, total_points, blade:blade_id(name), assist_blade:assist_blade_id(name), ratchet:ratchet_id(name), bit:bit_id(name), lock_chip:lock_chip_id(name)),
      combo2:combo2_id(id, name, total_points, blade:blade_id(name), assist_blade:assist_blade_id(name), ratchet:ratchet_id(name), bit:bit_id(name), lock_chip:lock_chip_id(name)),
      combo3:combo3_id(id, name, total_points, blade:blade_id(name), assist_blade:assist_blade_id(name), ratchet:ratchet_id(name), bit:bit_id(name), lock_chip:lock_chip_id(name))
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

// ========================================
// TEST BATTLE FUNCTIONS
// ========================================

// Get all test battles for the current user
export async function getAllTestBattles(): Promise<TestBattleWithCombos[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('test_battles')
        .select(`
            *,
            combo1:beyblade_combos!test_battles_combo1_id_fkey (
                *,
                blade:beyblade_parts!beyblade_combos_blade_id_fkey (*),
                assist_blade:beyblade_parts!beyblade_combos_assist_blade_id_fkey (*),
                ratchet:beyblade_parts!beyblade_combos_ratchet_id_fkey (*),
                bit:beyblade_parts!beyblade_combos_bit_id_fkey (*)
            ),
            combo2:beyblade_combos!test_battles_combo2_id_fkey (
                *,
                blade:beyblade_parts!beyblade_combos_blade_id_fkey (*),
                assist_blade:beyblade_parts!beyblade_combos_assist_blade_id_fkey (*),
                ratchet:beyblade_parts!beyblade_combos_ratchet_id_fkey (*),
                bit:beyblade_parts!beyblade_combos_bit_id_fkey (*)
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching test battles:', error)
        throw error
    }

    return data || []
}

// Add a new test battle
export async function addTestBattle(battle: TestBattleCreate): Promise<TestBattle> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('test_battles')
        .insert({
            ...battle,
            user_id: user.id
        })
        .select()
        .single()

    if (error) {
        console.error('Error adding test battle:', error)
        throw error
    }

    return data
}

// Get test battle statistics for combos
export async function getComboTestStats(): Promise<ComboTestStats[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get all test battles for this user
    const { data: battles, error: battlesError } = await supabase
        .from('test_battles')
        .select('*')
        .eq('user_id', user.id)

    if (battlesError) {
        console.error('Error fetching battles for stats:', battlesError)
        throw battlesError
    }

    // Get all combos for this user
    const combos = await getAllCombos()

    // Calculate stats for each combo
    const stats: ComboTestStats[] = combos.map(combo => {
        const comboId = combo.id

        // Find all battles involving this combo
        const comboBattles = battles?.filter(battle =>
            battle.combo1_id === comboId || battle.combo2_id === comboId
        ) || []

        const totalBattles = comboBattles.length
        const wins = comboBattles.filter(battle => battle.winner_combo_id === comboId).length
        const losses = totalBattles - wins

        // Calculate points scored and against
        let totalPointsScored = 0
        let totalPointsAgainst = 0

        comboBattles.forEach(battle => {
            if (battle.combo1_id === comboId) {
                totalPointsScored += battle.combo1_score
                totalPointsAgainst += battle.combo2_score
            } else {
                totalPointsScored += battle.combo2_score
                totalPointsAgainst += battle.combo1_score
            }
        })

        const winRate = totalBattles > 0 ? (wins / totalBattles) * 100 : 0
        const averagePointsScored = totalBattles > 0 ? totalPointsScored / totalBattles : 0
        const averagePointsAgainst = totalBattles > 0 ? totalPointsAgainst / totalBattles : 0

        return {
            combo_id: comboId,
            combo,
            total_battles: totalBattles,
            wins,
            losses,
            total_points_scored: totalPointsScored,
            total_points_against: totalPointsAgainst,
            win_rate: Math.round(winRate * 100) / 100, // Round to 2 decimal places
            average_points_scored: Math.round(averagePointsScored * 100) / 100,
            average_points_against: Math.round(averagePointsAgainst * 100) / 100
        }
    })

    // Sort by win rate, then by total battles
    return stats.sort((a, b) => {
        if (b.win_rate !== a.win_rate) {
            return b.win_rate - a.win_rate
        }
        return b.total_battles - a.total_battles
    })
}

// Update a test battle
export async function updateTestBattle(id: number, updates: Partial<TestBattleCreate>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
        .from('test_battles')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating test battle:', error)
        throw error
    }
}

// Delete a test battle
export async function deleteTestBattle(id: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
        .from('test_battles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting test battle:', error)
        throw error
    }
}

// Tournament Round Functions
export const addTournamentRound = async (tournamentId: string, comboNumber: number, finishType: FinishType) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Point values based on finish type
    const pointValues = {
        spin: 1,
        over: 2,
        burst: 2,
        xtreme: 3
    }

    const points = pointValues[finishType]

    // Add the round to tournament_rounds table
    const { error: roundError } = await supabase
        .from('tournament_rounds')
        .insert({
            tournament_id: tournamentId,
            combo_number: comboNumber,
            finish_type: finishType,
            points: points,
            user_id: user.id
        })

    if (roundError) {
        console.error('Error adding tournament round:', roundError)
        throw roundError
    }

    // Update the tournament combo points
    const { data: tournament, error: fetchError } = await supabase
        .from('tournaments')
        .select('combo1_points, combo2_points, combo3_points')
        .eq('id', parseInt(tournamentId))
        .eq('user_id', user.id)
        .single()

    if (fetchError) {
        console.error('Error fetching tournament:', fetchError)
        throw fetchError
    }

    // Update the appropriate combo points
    const pointField = `combo${comboNumber}_points` as keyof typeof tournament
    const currentPoints = tournament[pointField] || 0
    const newPoints = currentPoints + points

    const { error: updateError } = await supabase
        .from('tournaments')
        .update({ [pointField]: newPoints })
        .eq('id', parseInt(tournamentId))
        .eq('user_id', user.id)

    if (updateError) {
        console.error('Error updating tournament combo points:', updateError)
        throw updateError
    }

    // Update combo stats to reflect the new points
    await updateComboStats()
}

export const getTournamentRounds = async (tournamentId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('tournament_rounds')
        .select('*')
        .eq('tournament_id', parseInt(tournamentId))
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching tournament rounds:', error)
        throw error
    }

    return data || []
}

export const deleteTournamentRound = async (roundId: string, tournamentId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // First get the round data to know how many points to subtract
    const { data: round, error: fetchError } = await supabase
        .from('tournament_rounds')
        .select('combo_number, points')
        .eq('id', roundId)
        .eq('user_id', user.id)
        .single()

    if (fetchError) {
        console.error('Error fetching round for deletion:', fetchError)
        throw fetchError
    }

    // Delete the round
    const { error: deleteError } = await supabase
        .from('tournament_rounds')
        .delete()
        .eq('id', roundId)
        .eq('user_id', user.id)

    if (deleteError) {
        console.error('Error deleting tournament round:', deleteError)
        throw deleteError
    }

    // Update the tournament combo points by subtracting the deleted points
    const { data: tournament, error: fetchTournamentError } = await supabase
        .from('tournaments')
        .select('combo1_points, combo2_points, combo3_points')
        .eq('id', parseInt(tournamentId))
        .eq('user_id', user.id)
        .single()

    if (fetchTournamentError) {
        console.error('Error fetching tournament for update:', fetchTournamentError)
        throw fetchTournamentError
    }

    // Update the appropriate combo points
    const pointField = `combo${round.combo_number}_points` as keyof typeof tournament
    const currentPoints = tournament[pointField] || 0
    const newPoints = Math.max(0, currentPoints - round.points) // Ensure points don't go negative

    const { error: updateError } = await supabase
        .from('tournaments')
        .update({ [pointField]: newPoints })
        .eq('id', parseInt(tournamentId))
        .eq('user_id', user.id)

    if (updateError) {
        console.error('Error updating tournament combo points after deletion:', updateError)
        throw updateError
    }

    // Update combo stats to reflect the removed points
    await updateComboStats()
}
