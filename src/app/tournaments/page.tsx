'use client'

import { useState, useEffect, useCallback } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getAllTournaments, getTournamentStats, addTournament, updateTournament, deleteTournament, getAllCombos, getComboTestStats, addTournamentRound, getTournamentRounds, deleteTournamentRound } from '@/services/database'
import type { TournamentWithCombos, TournamentCreate, ComboWithParts, DeckRecommendation, FinishType } from '@/types/beyblade'

export default function EnhancedTournaments() {
    const [tournaments, setTournaments] = useState<TournamentWithCombos[]>([])
    const [combos, setCombos] = useState<ComboWithParts[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalTournaments: 0,
        totalPoints: 0,
        averagePoints: 0,
        topComboPoints: 0
    })

    // UI State
    const [activeTab, setActiveTab] = useState<'tournaments' | 'deck-builder' | 'practice'>('tournaments')
    const [showAddForm, setShowAddForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [editingTournament, setEditingTournament] = useState<TournamentWithCombos | null>(null)
    const [showRoundTracker, setShowRoundTracker] = useState(false)
    const [activeTournament, setActiveTournament] = useState<TournamentWithCombos | null>(null)

    // Deck Builder State
    const [deckRecommendations, setDeckRecommendations] = useState<DeckRecommendation[]>([])
    const [selectedDeck, setSelectedDeck] = useState<ComboWithParts[]>([])

    // Form state for tournaments
    const [newTournament, setNewTournament] = useState<TournamentCreate>({
        name: '',
        location: '',
        tournament_date: new Date().toISOString().split('T')[0],
        combo1_id: null,
        combo2_id: null,
        combo3_id: null,
        combo1_points: 0,
        combo2_points: 0,
        combo3_points: 0,
        placement: undefined,
        total_players: undefined,
        notes: ''
    })

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const [tournamentsData, combosData, statsData] = await Promise.all([
                getAllTournaments(),
                getAllCombos(),
                getTournamentStats()
            ])
            setTournaments(tournamentsData)
            setCombos(combosData)
            setStats(
                statsData ?? {
                    totalTournaments: 0,
                    totalPoints: 0,
                    averagePoints: 0,
                    topComboPoints: 0
                }
            )
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    // AI Deck Builder Logic
    const generateDeckRecommendations = useCallback(async () => {
        try {
            // Get combo performance stats
            const comboStats = await getComboTestStats()

            if (comboStats.length === 0) {
                setDeckRecommendations([])
                return
            }

            // Create single optimized deck recommendation
            let bestDeck: ComboWithParts[] = []
            let confidenceScore = 0
            let reasons: string[] = []
            let expectedPerformance = { win_rate: 0, avg_points: 0 }

            // Strategy: Prioritize combos with battle data, then fall back to tournament performance
            const combosWithBattleData = comboStats.filter(stat => stat.total_battles >= 2)

            if (combosWithBattleData.length >= 3) {
                // Use battle-tested combos with highest composite score
                const scoredCombos = combosWithBattleData.map(stat => ({
                    combo: stat.combo,
                    score: (stat.win_rate * 0.4) + (stat.average_points_scored * 10) + ((stat.average_points_scored - stat.average_points_against) * 5),
                    winRate: stat.win_rate,
                    avgPoints: stat.average_points_scored
                }))

                bestDeck = scoredCombos
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3)
                    .map(item => item.combo)

                confidenceScore = 90
                reasons = [
                    'Battle-tested performance data',
                    'Optimized composite scoring',
                    'Proven tournament viability'
                ]

                const avgWinRate = scoredCombos.slice(0, 3).reduce((sum, item) => sum + item.winRate, 0) / 3
                const avgPointsScored = scoredCombos.slice(0, 3).reduce((sum, item) => sum + item.avgPoints, 0) / 3

                expectedPerformance = {
                    win_rate: avgWinRate,
                    avg_points: avgPointsScored
                }
            } else {
                // Fall back to tournament performance if limited battle data
                const tournamentCombos = combos
                    .filter(combo => combo.tournaments_used > 0)
                    .map(combo => ({
                        combo,
                        score: (combo.total_points / Math.max(combo.tournaments_used, 1)) + (combo.wins * 2) - combo.losses
                    }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3)

                if (tournamentCombos.length >= 3) {
                    bestDeck = tournamentCombos.map(item => item.combo)
                    confidenceScore = 65
                    reasons = [
                        'Tournament performance history',
                        'Points per tournament optimization',
                        'Win/loss ratio consideration'
                    ]
                    expectedPerformance = {
                        win_rate: 55,
                        avg_points: 2.0
                    }
                } else {
                    // Last resort: use any available combos
                    bestDeck = combos.slice(0, 3)
                    confidenceScore = 40
                    reasons = [
                        'Based on available combos',
                        'Limited performance data',
                        'Requires testing for optimization'
                    ]
                    expectedPerformance = {
                        win_rate: 50,
                        avg_points: 1.5
                    }
                }
            }

            // Create single recommendation
            const recommendation: DeckRecommendation = {
                combos: bestDeck,
                confidence_score: confidenceScore,
                reasons,
                expected_performance: expectedPerformance
            }

            setDeckRecommendations([recommendation])
        } catch (error) {
            console.error('Error generating deck recommendations:', error)
        }
    }, [combos])

    // Separate effect for generating deck recommendations
    useEffect(() => {
        if (!loading) {
            generateDeckRecommendations()
        }
    }, [combos, loading, generateDeckRecommendations])

    const generatePracticeRecommendations = () => {
        if (!selectedDeck.length) return []

        const recommendations = []

        // Recommend testing against high-performing combos
        const topCombos = combos
            .filter(combo => !selectedDeck.find(deckCombo => deckCombo.id === combo.id))
            .sort((a, b) => (b.wins / Math.max(b.total_points, 1)) - (a.wins / Math.max(a.total_points, 1)))
            .slice(0, 5)

        if (topCombos.length > 0) {
            recommendations.push({
                type: 'test-against-meta',
                title: 'Test Against Top Performers',
                description: 'Practice your tournament deck against these high-performing combos',
                combos: topCombos,
                priority: 'high'
            })
        }

        // Recommend testing weak matchups
        const weakCombos = selectedDeck.filter(combo =>
            combo.losses > combo.wins && combo.tournaments_used > 0
        )

        if (weakCombos.length > 0) {
            recommendations.push({
                type: 'improve-weak-combos',
                title: 'Strengthen Weak Links',
                description: 'These combos in your deck need more practice',
                combos: weakCombos,
                priority: 'medium'
            })
        }

        return recommendations
    }

    const handleAddTournament = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await addTournament(newTournament)
            setNewTournament({
                name: '',
                location: '',
                tournament_date: new Date().toISOString().split('T')[0],
                combo1_id: null,
                combo2_id: null,
                combo3_id: null,
                combo1_points: 0,
                combo2_points: 0,
                combo3_points: 0,
                placement: undefined,
                total_players: undefined,
                notes: ''
            })
            setShowAddForm(false)
            loadData()
        } catch (error) {
            console.error('Error adding tournament:', error)
        }
    }

    const handleDeleteTournament = async (tournamentId: number) => {
        if (window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
            try {
                await deleteTournament(tournamentId)
                loadData() // Reload the data to update the list
            } catch (error) {
                console.error('Error deleting tournament:', error)
            }
        }
    }

    const handleEditTournament = (tournament: TournamentWithCombos) => {
        setEditingTournament(tournament)
        setNewTournament({
            name: tournament.name,
            location: tournament.location || '',
            tournament_date: tournament.tournament_date,
            combo1_id: tournament.combo1_id,
            combo2_id: tournament.combo2_id,
            combo3_id: tournament.combo3_id,
            combo1_points: tournament.combo1_points,
            combo2_points: tournament.combo2_points,
            combo3_points: tournament.combo3_points,
            placement: tournament.placement,
            total_players: tournament.total_players,
            notes: tournament.notes || ''
        })
        setShowEditForm(true)
        setShowAddForm(false) // Close add form if open
    }

    const handleUpdateTournament = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingTournament) return

        try {
            await updateTournament(editingTournament.id, newTournament)
            setNewTournament({
                name: '',
                location: '',
                tournament_date: new Date().toISOString().split('T')[0],
                combo1_id: null,
                combo2_id: null,
                combo3_id: null,
                combo1_points: 0,
                combo2_points: 0,
                combo3_points: 0,
                placement: undefined,
                total_players: undefined,
                notes: ''
            })
            setShowEditForm(false)
            setEditingTournament(null)
            loadData()
        } catch (error) {
            console.error('Error updating tournament:', error)
        }
    }

    const handleCancelEdit = () => {
        setShowEditForm(false)
        setEditingTournament(null)
        setNewTournament({
            name: '',
            location: '',
            tournament_date: new Date().toISOString().split('T')[0],
            combo1_id: null,
            combo2_id: null,
            combo3_id: null,
            combo1_points: 0,
            combo2_points: 0,
            combo3_points: 0,
            placement: undefined,
            total_players: undefined,
            notes: ''
        })
    }

    const handleStartRoundTracker = (tournament: TournamentWithCombos) => {
        setActiveTournament(tournament)
        setShowRoundTracker(true)
        // Close any open forms
        setShowAddForm(false)
        setShowEditForm(false)
        setEditingTournament(null)
    }

    const handleCloseRoundTracker = () => {
        setShowRoundTracker(false)
        setActiveTournament(null)
        // Reload data to refresh any updates
        loadData()
    }

    const formatComboName = (combo: ComboWithParts | null | undefined): string => {
        if (!combo) return 'No combo selected'

        const parts = []
        if (combo.blade?.name) parts.push(combo.blade.name)
        if (combo.assist_blade?.name) parts.push(combo.assist_blade.name)
        if (combo.ratchet?.name) parts.push(combo.ratchet.name)
        if (combo.bit?.name) parts.push(combo.bit.name)
        return parts.length > 0 ? parts.join(' + ') : combo.name
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navigation currentPage="tournaments" />
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center flex-1">
                    <div className="text-xl text-gray-600 dark:text-gray-300">Loading tournaments...</div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            <ProtectedRoute>
                <Navigation currentPage="tournaments" />
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex-1">
                    <div className="container mx-auto px-4 py-16">
                        <header className="text-center mb-16">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Tournament Command Center
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                Advanced tournament tracking, deck building, and performance analysis.
                            </p>
                        </header>

                        <div className="max-w-6xl mx-auto">
                            {/* Navigation Tabs */}
                            <div className="mb-8">
                                <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
                                    {(['tournaments', 'deck-builder', 'practice'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === tab
                                                ? 'bg-green-600 text-white shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`}
                                        >
                                            {tab === 'tournaments' && '🏆 Tournaments'}
                                            {tab === 'deck-builder' && '⚡ Deck Builder'}
                                            {tab === 'practice' && '🎯 Practice'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tournament Stats */}
                            <div className="grid md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-green-900 dark:text-green-300">Tournaments</h3>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalTournaments || 0}</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-300">Total Points</h3>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalPoints || 0}</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-purple-900 dark:text-purple-300">Avg Points</h3>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.averagePoints || 0}</p>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-orange-900 dark:text-orange-300">Top Combo</h3>
                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.topComboPoints || 0}</p>
                                </div>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'tournaments' && !showRoundTracker && (
                                <TournamentsTab
                                    tournaments={tournaments}
                                    combos={combos}
                                    showAddForm={showAddForm}
                                    setShowAddForm={setShowAddForm}
                                    showEditForm={showEditForm}
                                    setShowEditForm={setShowEditForm}
                                    newTournament={newTournament}
                                    setNewTournament={setNewTournament}
                                    handleAddTournament={handleAddTournament}
                                    handleEditTournament={handleEditTournament}
                                    handleUpdateTournament={handleUpdateTournament}
                                    handleDeleteTournament={handleDeleteTournament}
                                    handleCancelEdit={handleCancelEdit}
                                    handleStartRoundTracker={handleStartRoundTracker}
                                    editingTournament={editingTournament}
                                    setEditingTournament={setEditingTournament}
                                    formatComboName={formatComboName}
                                />
                            )}

                            {activeTab === 'deck-builder' && (
                                <DeckBuilderTab
                                    deckRecommendations={deckRecommendations}
                                    selectedDeck={selectedDeck}
                                    setSelectedDeck={setSelectedDeck}
                                    formatComboName={formatComboName}
                                />
                            )}

                            {activeTab === 'practice' && (
                                <PracticeTab
                                    selectedDeck={selectedDeck}
                                    generatePracticeRecommendations={generatePracticeRecommendations}
                                    formatComboName={formatComboName}
                                />
                            )}

                            {/* Round Tracker Modal/Overlay */}
                            {showRoundTracker && activeTournament && (
                                <RoundTracker
                                    tournament={activeTournament}
                                    onClose={handleCloseRoundTracker}
                                    formatComboName={formatComboName}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
            <Footer />
        </div>
    )
}

// Tab Components
function TournamentsTab({
    tournaments,
    combos,
    showAddForm,
    setShowAddForm,
    showEditForm,
    setShowEditForm,
    newTournament,
    setNewTournament,
    handleAddTournament,
    handleEditTournament,
    handleUpdateTournament,
    handleDeleteTournament,
    handleCancelEdit,
    handleStartRoundTracker,
    editingTournament,
    setEditingTournament,
    formatComboName
}: {
    tournaments: TournamentWithCombos[]
    combos: ComboWithParts[]
    showAddForm: boolean
    setShowAddForm: (show: boolean) => void
    showEditForm: boolean
    setShowEditForm: React.Dispatch<React.SetStateAction<boolean>>
    newTournament: TournamentCreate
    setNewTournament: React.Dispatch<React.SetStateAction<TournamentCreate>>
    handleAddTournament: (e: React.FormEvent) => Promise<void>
    handleEditTournament: (tournament: TournamentWithCombos) => void
    handleUpdateTournament: (e: React.FormEvent) => Promise<void>
    handleDeleteTournament: (tournamentId: number) => Promise<void>
    handleCancelEdit: () => void
    handleStartRoundTracker: (tournament: TournamentWithCombos) => void
    editingTournament: TournamentWithCombos | null
    setEditingTournament: React.Dispatch<React.SetStateAction<TournamentWithCombos | null>>
    formatComboName: (combo: ComboWithParts | null | undefined) => string
}) {
    return (
        <div>
            {/* Add Tournament Button */}
            <div className="mb-6">
                <button
                    onClick={() => {
                        setShowAddForm(true)
                        // Close edit form if open
                        if (showEditForm) {
                            setShowEditForm(false)
                            setEditingTournament(null)
                            // Reset form
                            setNewTournament({
                                name: '',
                                location: '',
                                tournament_date: new Date().toISOString().split('T')[0],
                                combo1_id: null,
                                combo2_id: null,
                                combo3_id: null,
                                combo1_points: 0,
                                combo2_points: 0,
                                combo3_points: 0,
                                placement: undefined,
                                total_players: undefined,
                                notes: ''
                            })
                        }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                    <span>+</span>
                    Add New Tournament
                </button>
            </div>

            {/* Add Tournament Form */}
            {showAddForm && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Tournament</h3>
                    <form onSubmit={handleAddTournament} className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tournament Name
                                </label>
                                <input
                                    type="text"
                                    value={newTournament.name}
                                    onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Location (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={newTournament.location || ''}
                                    onChange={(e) => setNewTournament({ ...newTournament, location: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={newTournament.tournament_date}
                                    onChange={(e) => setNewTournament({ ...newTournament, tournament_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* Deck Selection */}
                        <div className="grid md:grid-cols-3 gap-4">
                            {[1, 2, 3].map((comboNum) => (
                                <div key={comboNum} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Combo {comboNum}</h4>
                                    <div className="space-y-2">
                                        <select
                                            value={newTournament[`combo${comboNum}_id` as keyof TournamentCreate] as number || ''}
                                            onChange={(e) => setNewTournament({
                                                ...newTournament,
                                                [`combo${comboNum}_id`]: e.target.value ? parseInt(e.target.value) : null
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="">Select combo...</option>
                                            {combos.map((combo: ComboWithParts) => (
                                                <option key={combo.id} value={combo.id}>
                                                    {formatComboName(combo)}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Points earned"
                                            value={newTournament[`combo${comboNum}_points` as keyof TournamentCreate] as number || ''}
                                            onChange={(e) => setNewTournament({
                                                ...newTournament,
                                                [`combo${comboNum}_points`]: parseInt(e.target.value) || 0
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Add Tournament
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Tournament Form */}
            {showEditForm && editingTournament && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Tournament</h3>
                    <form onSubmit={handleUpdateTournament} className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tournament Name
                                </label>
                                <input
                                    type="text"
                                    value={newTournament.name}
                                    onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Location (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={newTournament.location || ''}
                                    onChange={(e) => setNewTournament({ ...newTournament, location: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={newTournament.tournament_date}
                                    onChange={(e) => setNewTournament({ ...newTournament, tournament_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Placement (Optional)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Final placement"
                                    value={newTournament.placement || ''}
                                    onChange={(e) => setNewTournament({ ...newTournament, placement: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Total Players (Optional)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Total tournament players"
                                    value={newTournament.total_players || ''}
                                    onChange={(e) => setNewTournament({ ...newTournament, total_players: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Deck Selection */}
                        <div className="grid md:grid-cols-3 gap-4">
                            {[1, 2, 3].map((comboNum) => (
                                <div key={comboNum} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Combo {comboNum}</h4>
                                    <div className="space-y-2">
                                        <select
                                            value={newTournament[`combo${comboNum}_id` as keyof TournamentCreate] as number || ''}
                                            onChange={(e) => setNewTournament({
                                                ...newTournament,
                                                [`combo${comboNum}_id`]: e.target.value ? parseInt(e.target.value) : null
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="">Select combo...</option>
                                            {combos.map((combo: ComboWithParts) => (
                                                <option key={combo.id} value={combo.id}>
                                                    {formatComboName(combo)}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Points earned"
                                            value={newTournament[`combo${comboNum}_points` as keyof TournamentCreate] as number || ''}
                                            onChange={(e) => setNewTournament({
                                                ...newTournament,
                                                [`combo${comboNum}_points`]: parseInt(e.target.value) || 0
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={newTournament.notes || ''}
                                onChange={(e) => setNewTournament({ ...newTournament, notes: e.target.value })}
                                placeholder="Any additional notes about this tournament..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Update Tournament
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tournaments List */}
            <div className="space-y-4">
                {tournaments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p className="text-xl mb-2">No tournaments recorded yet</p>
                        <p>Add your first tournament to start tracking your performance!</p>
                    </div>
                ) : (
                    tournaments.map((tournament: TournamentWithCombos) => (
                        <div key={tournament.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {tournament.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {tournament.location && `${tournament.location} • `}
                                        {new Date(tournament.tournament_date).toLocaleDateString()}
                                        {tournament.placement && tournament.total_players &&
                                            ` • ${tournament.placement}/${tournament.total_players}`
                                        }
                                    </p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                                        {tournament.total_points} points total
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStartRoundTracker(tournament)}
                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                                        title="Track Rounds Live"
                                    >
                                        📊 Track Rounds
                                    </button>
                                    <button
                                        onClick={() => handleEditTournament(tournament)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                                        title="Edit Tournament"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTournament(tournament.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                                        title="Delete Tournament"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                                    <div className="font-medium text-gray-900 dark:text-white">Combo 1</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">{formatComboName(tournament.combo1)}</div>
                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{tournament.combo1_points} pts</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                                    <div className="font-medium text-gray-900 dark:text-white">Combo 2</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">{formatComboName(tournament.combo2)}</div>
                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{tournament.combo2_points} pts</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                                    <div className="font-medium text-gray-900 dark:text-white">Combo 3</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">{formatComboName(tournament.combo3)}</div>
                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{tournament.combo3_points} pts</div>
                                </div>
                            </div>

                            {tournament.notes && (
                                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        📝 {tournament.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

function DeckBuilderTab({
    deckRecommendations,
    selectedDeck,
    setSelectedDeck,
    formatComboName
}: {
    deckRecommendations: DeckRecommendation[]
    selectedDeck: ComboWithParts[]
    setSelectedDeck: React.Dispatch<React.SetStateAction<ComboWithParts[]>>
    formatComboName: (combo: ComboWithParts | null | undefined) => string
}) {
    return (
        <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    AI Deck Recommendations
                </h3>

                {deckRecommendations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>Generate recommendations by testing your combos first!</p>
                        <p className="text-sm mt-2">Go to the Testing page to battle your combos and build performance data.</p>
                    </div>
                ) : (
                    <div>
                        {deckRecommendations.map((rec: DeckRecommendation, index: number) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                            Optimal Tournament Deck
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`px-2 py-1 rounded text-sm ${rec.confidence_score >= 80
                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                                : rec.confidence_score >= 60
                                                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                                                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                                }`}>
                                                {rec.confidence_score}% Confidence
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Expected {rec.expected_performance.win_rate.toFixed(1)}% Win Rate
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDeck(rec.combos)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                                    >
                                        Use This Deck
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-3 gap-3 mb-4">
                                    {rec.combos.map((combo: ComboWithParts, comboIndex: number) => (
                                        <div key={`${combo.id}-${comboIndex}`} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                                            <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                                                Deck Slot {comboIndex + 1}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatComboName(combo)}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                {combo.wins}W-{combo.losses}L • {combo.total_points}pts total
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                        Why this deck is recommended:
                                    </div>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                                        {rec.reasons.map((reason, reasonIndex) => (
                                            <li key={reasonIndex}>{reason}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedDeck.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Selected Tournament Deck
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {selectedDeck.map((combo: ComboWithParts, index: number) => (
                            <div key={`selected-${combo.id}-${index}`} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-green-900 dark:text-green-300">
                                    Deck Slot {index + 1}
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    {formatComboName(combo)}
                                </p>
                                <div className="text-xs text-green-700 dark:text-green-400">
                                    {combo.wins}W-{combo.losses}L in {combo.tournaments_used} tournaments
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function PracticeTab({
    selectedDeck,
    generatePracticeRecommendations,
    formatComboName
}: {
    selectedDeck: ComboWithParts[]
    generatePracticeRecommendations: () => Array<{
        type: string
        title: string
        description: string
        combos: ComboWithParts[]
        priority: string
    }>
    formatComboName: (combo: ComboWithParts | null | undefined) => string
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Practice Recommendations
            </h3>

            {selectedDeck.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Select a tournament deck first in the Deck Builder tab!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {generatePracticeRecommendations().map((rec, index: number) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`px-2 py-1 rounded text-sm ${rec.priority === 'high'
                                    ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                    : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                                    }`}>
                                    {rec.priority === 'high' ? '🔥 High Priority' : '⚠️ Medium Priority'}
                                </div>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rec.description}</p>

                            <div className="flex flex-wrap gap-2">
                                {rec.combos.map((combo: ComboWithParts) => (
                                    <div key={combo.id} className="bg-gray-50 dark:bg-gray-700 rounded px-3 py-1">
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {formatComboName(combo)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="text-center pt-4">
                        <a
                            href="/testing"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                            🎯 Go to Testing Page
                            <span>→</span>
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
}

// Round Tracker Component for Live Tournament Tracking
function RoundTracker({
    tournament,
    onClose,
    formatComboName
}: {
    tournament: TournamentWithCombos
    onClose: () => void
    formatComboName: (combo: ComboWithParts | null | undefined) => string
}) {
    const [rounds, setRounds] = useState<Array<{
        id: string
        combo_number: number
        finish_type: FinishType
        points: number
        created_at: string
    }>>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    // Get the tournament combos
    const tournamentCombos = [
        tournament.combo1,
        tournament.combo2,
        tournament.combo3
    ].filter(combo => combo !== null)

    // Load existing rounds when component mounts
    useEffect(() => {
        const loadRounds = async () => {
            try {
                const data = await getTournamentRounds(tournament.id.toString())
                setRounds(data)
            } catch (error) {
                console.error('Error loading tournament rounds:', error)
            } finally {
                setLoading(false)
            }
        }
        loadRounds()
    }, [tournament.id])

    const handleAddPoints = async (comboNumber: number, finishType: FinishType) => {
        if (updating) return

        setUpdating(true)
        try {
            await addTournamentRound(tournament.id.toString(), comboNumber, finishType)
            // Reload rounds to get the updated list
            const updatedRounds = await getTournamentRounds(tournament.id.toString())
            setRounds(updatedRounds)
        } catch (error) {
            console.error('Error adding tournament round:', error)
        } finally {
            setUpdating(false)
        }
    }

    const handleDeleteRound = async (roundId: string) => {
        if (updating) return

        setUpdating(true)
        try {
            await deleteTournamentRound(roundId, tournament.id.toString())
            // Reload rounds to get the updated list
            const updatedRounds = await getTournamentRounds(tournament.id.toString())
            setRounds(updatedRounds)
        } catch (error) {
            console.error('Error deleting tournament round:', error)
        } finally {
            setUpdating(false)
        }
    }

    const getTotalPoints = () => {
        return rounds.reduce((total, round) => total + round.points, 0)
    }

    const getComboTotalPoints = (comboNumber: number) => {
        return rounds
            .filter(round => round.combo_number === comboNumber)
            .reduce((total, round) => total + round.points, 0)
    }

    const getComboRounds = (comboNumber: number) => {
        return rounds.filter(round => round.combo_number === comboNumber)
    }

    const getFinishTypeColor = (finishType: FinishType) => {
        switch (finishType) {
            case 'spin': return 'bg-blue-500 hover:bg-blue-600'
            case 'over': return 'bg-green-500 hover:bg-green-600'
            case 'burst': return 'bg-red-500 hover:bg-red-600'
            case 'xtreme': return 'bg-purple-500 hover:bg-purple-600'
            default: return 'bg-gray-500 hover:bg-gray-600'
        }
    }

    const getFinishTypePoints = (finishType: FinishType) => {
        switch (finishType) {
            case 'spin': return 1
            case 'over': return 2
            case 'burst': return 2
            case 'xtreme': return 3
            default: return 0
        }
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-300">Loading tournament rounds...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                📊 Live Tournament Tracker
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                {tournament.name} • {new Date(tournament.tournament_date).toLocaleDateString()}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            ✕ Close
                        </button>
                    </div>

                    {/* Tournament Summary */}
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-300">Total Rounds</h3>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{rounds.length}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                            <h3 className="font-semibold text-green-900 dark:text-green-300">Total Points</h3>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{getTotalPoints()}</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                            <h3 className="font-semibold text-purple-900 dark:text-purple-300">Best Finish</h3>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {rounds.length > 0 ? Math.max(...rounds.map(r => r.points)) : 0}
                            </p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
                            <h3 className="font-semibold text-orange-900 dark:text-orange-300">Avg/Round</h3>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {rounds.length > 0 ? (getTotalPoints() / rounds.length).toFixed(1) : '0.0'}
                            </p>
                        </div>
                    </div>

                    {/* Quick Entry Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {tournamentCombos.map((combo, index) => {
                            const comboNumber = index + 1
                            const comboRounds = getComboRounds(comboNumber)

                            return (
                                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                    <div className="text-center mb-4">
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                            Combo {comboNumber}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {formatComboName(combo)}
                                        </p>
                                        <div className="bg-white dark:bg-gray-600 rounded-lg p-2">
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {getComboTotalPoints(comboNumber)} pts
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {comboRounds.length} rounds
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Entry Buttons */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['spin', 'over', 'burst', 'xtreme'] as FinishType[]).map((finishType) => (
                                            <button
                                                key={finishType}
                                                onClick={() => handleAddPoints(comboNumber, finishType)}
                                                disabled={updating}
                                                className={`${getFinishTypeColor(finishType)} text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {finishType.charAt(0).toUpperCase() + finishType.slice(1)}
                                                <br />
                                                <span className="text-xs">+{getFinishTypePoints(finishType)} pt{getFinishTypePoints(finishType) > 1 ? 's' : ''}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Recent Rounds for this combo */}
                                    {comboRounds.length > 0 && (
                                        <div className="mt-3 space-y-1">
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Recent:</p>
                                            {comboRounds.slice(0, 3).map((round, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs bg-white dark:bg-gray-600 rounded px-2 py-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="capitalize text-gray-600 dark:text-gray-400">
                                                            {round.finish_type}
                                                        </span>
                                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                                            +{round.points}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteRound(round.id)}
                                                        disabled={updating}
                                                        className="text-red-500 hover:text-red-700 disabled:text-red-300 ml-1 p-0.5 rounded"
                                                        title="Delete this round"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Complete Rounds History */}
                    {rounds.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Complete Round History ({rounds.length} rounds)
                                </h3>
                            </div>
                            <div className="p-4 max-h-64 overflow-y-auto">
                                <div className="space-y-2">
                                    {rounds.map((round, index) => (
                                        <div key={round.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    #{rounds.length - index}
                                                </span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    Combo {round.combo_number}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getFinishTypeColor(round.finish_type).split(' ')[0]}`}>
                                                    {round.finish_type.charAt(0).toUpperCase() + round.finish_type.slice(1)}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(round.created_at).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-green-600 dark:text-green-400">
                                                    +{round.points} pt{round.points > 1 ? 's' : ''}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteRound(round.id)}
                                                    disabled={updating}
                                                    className="text-red-500 hover:text-red-700 disabled:text-red-300 p-1 rounded"
                                                    title="Delete this round"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {updating && (
                        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-10">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                                    <span className="text-gray-700 dark:text-gray-300">Updating...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
