'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getAllTournaments, getTournamentStats, addTournament, updateTournament, deleteTournament, getAllCombos, getComboTestStats } from '@/services/database'
import type { TournamentWithCombos, TournamentCreate, ComboWithParts, TournamentMatch, UpcomingTournament, DeckRecommendation, ComboTestStats } from '@/types/beyblade'

export default function EnhancedTournaments() {
    const [tournaments, setTournaments] = useState<TournamentWithCombos[]>([])
    const [combos, setCombos] = useState<ComboWithParts[]>([])
    const [upcomingTournaments, setUpcomingTournaments] = useState<UpcomingTournament[]>([])
    const [stats, setStats] = useState({
        totalTournaments: 0,
        totalPoints: 0,
        averagePoints: 0,
        topComboPoints: 0
    })
    const [loading, setLoading] = useState(true)

    // UI State
    const [activeTab, setActiveTab] = useState<'tournaments' | 'calendar' | 'deck-builder' | 'practice'>('tournaments')
    const [showAddForm, setShowAddForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [editingTournament, setEditingTournament] = useState<TournamentWithCombos | null>(null)

    // Deck Builder State
    const [deckRecommendations, setDeckRecommendations] = useState<DeckRecommendation[]>([])
    const [selectedDeck, setSelectedDeck] = useState<ComboWithParts[]>([])

    // Calendar State
    const [showAddUpcomingForm, setShowAddUpcomingForm] = useState(false)
    const [newUpcoming, setNewUpcoming] = useState({
        name: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        registration_deadline: '',
        notes: ''
    })

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

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
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

            // Generate deck recommendations
            generateDeckRecommendations(combosData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    // AI Deck Builder Logic
    const generateDeckRecommendations = async (availableCombos: ComboWithParts[]) => {
        try {
            // Get combo performance stats
            const comboStats = await getComboTestStats()

            // Create deck recommendations based on performance
            const recommendations: DeckRecommendation[] = []

            // Strategy 1: Best Win Rate Deck
            const topWinRateCombos = comboStats
                .filter(stat => stat.total_battles >= 3) // Only combos with enough data
                .sort((a, b) => b.win_rate - a.win_rate)
                .slice(0, 3)
                .map(stat => stat.combo)

            if (topWinRateCombos.length >= 3) {
                recommendations.push({
                    combos: topWinRateCombos,
                    confidence_score: 85,
                    reasons: [
                        'Highest individual win rates',
                        'Proven battle performance',
                        'Consistent scoring potential'
                    ],
                    expected_performance: {
                        win_rate: topWinRateCombos.reduce((sum, _, i) => sum + comboStats[i].win_rate, 0) / 3,
                        avg_points: topWinRateCombos.reduce((sum, _, i) => sum + comboStats[i].average_points_scored, 0) / 3
                    }
                })
            }

            // Strategy 2: Balanced Attack/Defense/Stamina Deck
            const attackCombos = comboStats.filter(stat =>
                stat.combo.blade?.name?.toLowerCase().includes('attack') ||
                stat.average_points_scored > 2.5
            )
            const defenseCombos = comboStats.filter(stat =>
                stat.combo.blade?.name?.toLowerCase().includes('defense') ||
                stat.average_points_against < 2.0
            )
            const staminaCombos = comboStats.filter(stat =>
                stat.combo.blade?.name?.toLowerCase().includes('stamina') ||
                stat.win_rate > 60
            )

            const balancedDeck = [
                attackCombos[0]?.combo,
                defenseCombos[0]?.combo || comboStats[1]?.combo,
                staminaCombos[0]?.combo || comboStats[2]?.combo
            ].filter(Boolean)

            if (balancedDeck.length >= 3) {
                recommendations.push({
                    combos: balancedDeck as ComboWithParts[],
                    confidence_score: 75,
                    reasons: [
                        'Balanced type coverage',
                        'Versatile against different opponents',
                        'Strategic depth and adaptability'
                    ],
                    expected_performance: {
                        win_rate: 65,
                        avg_points: 2.2
                    }
                })
            }

            // Strategy 3: Meta Counter Deck (based on common opponent combos)
            const metaCounterDeck = comboStats
                .filter(stat => stat.total_battles >= 2)
                .sort((a, b) => (b.average_points_scored - b.average_points_against) - (a.average_points_scored - a.average_points_against))
                .slice(0, 3)
                .map(stat => stat.combo)

            if (metaCounterDeck.length >= 3) {
                recommendations.push({
                    combos: metaCounterDeck,
                    confidence_score: 70,
                    reasons: [
                        'Strong point differential',
                        'Effective against tested opponents',
                        'Proven clutch performance'
                    ],
                    expected_performance: {
                        win_rate: 58,
                        avg_points: 2.0
                    }
                })
            }

            setDeckRecommendations(recommendations)
        } catch (error) {
            console.error('Error generating deck recommendations:', error)
        }
    }

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

    const handleEditTournament = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingTournament) return

        try {
            const updatedData: TournamentCreate = {
                name: editingTournament.name,
                location: editingTournament.location,
                tournament_date: editingTournament.tournament_date,
                combo1_id: editingTournament.combo1_id,
                combo2_id: editingTournament.combo2_id,
                combo3_id: editingTournament.combo3_id,
                combo1_points: editingTournament.combo1_points,
                combo2_points: editingTournament.combo2_points,
                combo3_points: editingTournament.combo3_points,
                placement: editingTournament.placement,
                total_players: editingTournament.total_players,
                notes: editingTournament.notes
            }

            await updateTournament(editingTournament.id, updatedData)
            setShowEditForm(false)
            setEditingTournament(null)
            loadData()
        } catch (error) {
            console.error('Error updating tournament:', error)
        }
    }

    const startEdit = (tournament: TournamentWithCombos) => {
        setEditingTournament(tournament)
        setShowEditForm(true)
    }

    const handleAddUpcoming = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // For now, just add to local state since we don't have a database table for upcoming tournaments yet
            const newTournament: UpcomingTournament = {
                id: Date.now(),
                created_at: new Date().toISOString(),
                name: newUpcoming.name,
                location: newUpcoming.location,
                tournament_date: newUpcoming.date,
                registration_deadline: newUpcoming.registration_deadline || undefined,
                notes: newUpcoming.notes || undefined,
                is_registered: false
            }
            setUpcomingTournaments([...upcomingTournaments, newTournament])
            setNewUpcoming({
                name: '',
                location: '',
                date: new Date().toISOString().split('T')[0],
                registration_deadline: '',
                notes: ''
            })
            setShowAddUpcomingForm(false)
        } catch (error) {
            console.error('Error adding upcoming tournament:', error)
        }
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
                                    {['tournaments', 'calendar', 'deck-builder', 'practice'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab as 'tournaments' | 'calendar' | 'deck-builder' | 'practice')}
                                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === tab
                                                    ? 'bg-green-600 text-white shadow-sm'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`}
                                        >
                                            {tab === 'tournaments' && '🏆 Tournaments'}
                                            {tab === 'calendar' && '📅 Calendar'}
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
                            {activeTab === 'tournaments' && (
                                <TournamentsTab
                                    tournaments={tournaments}
                                    combos={combos}
                                    showAddForm={showAddForm}
                                    setShowAddForm={setShowAddForm}
                                    showEditForm={showEditForm}
                                    setShowEditForm={setShowEditForm}
                                    editingTournament={editingTournament}
                                    setEditingTournament={setEditingTournament}
                                    newTournament={newTournament}
                                    setNewTournament={setNewTournament}
                                    handleAddTournament={handleAddTournament}
                                    handleEditTournament={handleEditTournament}
                                    startEdit={startEdit}
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

                            {activeTab === 'calendar' && (
                                <CalendarTab
                                    upcomingTournaments={upcomingTournaments}
                                    showAddUpcomingForm={showAddUpcomingForm}
                                    setShowAddUpcomingForm={setShowAddUpcomingForm}
                                    newUpcoming={newUpcoming}
                                    setNewUpcoming={setNewUpcoming}
                                    handleAddUpcoming={handleAddUpcoming}
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
    editingTournament,
    setEditingTournament,
    newTournament,
    setNewTournament,
    handleAddTournament,
    handleEditTournament,
    startEdit,
    formatComboName
}: {
    tournaments: TournamentWithCombos[]
    combos: ComboWithParts[]
    showAddForm: boolean
    setShowAddForm: (show: boolean) => void
    showEditForm: boolean
    setShowEditForm: (show: boolean) => void
    editingTournament: TournamentWithCombos | null
    setEditingTournament: (tournament: TournamentWithCombos | null) => void
    newTournament: TournamentCreate
    setNewTournament: React.Dispatch<React.SetStateAction<TournamentCreate>>
    handleAddTournament: (e: React.FormEvent) => Promise<void>
    handleEditTournament: (e: React.FormEvent) => Promise<void>
    startEdit: (tournament: TournamentWithCombos) => void
    formatComboName: (combo: ComboWithParts) => string
}) {
    return (
        <div>
            {/* Add Tournament Button */}
            <div className="mb-6">
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                    <span>+</span>
                    Add Tournament
                </button>
            </div>

            {/* Add Tournament Form */}
            {showAddForm && (
                <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Tournament</h3>
                    <form onSubmit={handleAddTournament} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tournament Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newTournament.name}
                                    onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Tournament name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={newTournament.location}
                                    onChange={(e) => setNewTournament({ ...newTournament, location: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Location"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={newTournament.tournament_date}
                                    onChange={(e) => setNewTournament({ ...newTournament, tournament_date: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Placement
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newTournament.placement || ''}
                                        onChange={(e) => setNewTournament({ ...newTournament, placement: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Place"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Total Players
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newTournament.total_players || ''}
                                        onChange={(e) => setNewTournament({ ...newTournament, total_players: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Players"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tournament Deck Selection */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Tournament Deck</h4>
                            {[1, 2, 3].map((comboNum) => (
                                <div key={comboNum} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Combo {comboNum}
                                            </label>
                                            <select
                                                value={newTournament[`combo${comboNum}_id` as keyof TournamentCreate] as number || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value ? parseInt(e.target.value) : null
                                                    setNewTournament({ ...newTournament, [`combo${comboNum}_id`]: value })
                                                }}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option value="">Select combo...</option>
                                                {combos.map((combo) => (
                                                    <option key={combo.id} value={combo.id}>
                                                        {formatComboName(combo)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Points Earned
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={newTournament[`combo${comboNum}_points` as keyof TournamentCreate] as number || 0}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0
                                                    setNewTournament({ ...newTournament, [`combo${comboNum}_points`]: value })
                                                }}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="0.0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={newTournament.notes}
                                onChange={(e) => setNewTournament({ ...newTournament, notes: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                rows={3}
                                placeholder="Tournament notes, strategy, lessons learned..."
                            />
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
                <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Tournament</h3>
                    <form onSubmit={handleEditTournament} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tournament Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editingTournament.name}
                                    onChange={(e) => setEditingTournament({ ...editingTournament, name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={editingTournament.location || ''}
                                    onChange={(e) => setEditingTournament({ ...editingTournament, location: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={editingTournament.tournament_date}
                                    onChange={(e) => setEditingTournament({ ...editingTournament, tournament_date: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Placement
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editingTournament.placement || ''}
                                        onChange={(e) => setEditingTournament({ ...editingTournament, placement: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Total Players
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editingTournament.total_players || ''}
                                        onChange={(e) => setEditingTournament({ ...editingTournament, total_players: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Edit Tournament Deck */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Tournament Deck</h4>
                            {[1, 2, 3].map((comboNum) => (
                                <div key={`edit-combo-${comboNum}`} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Combo {comboNum}
                                            </label>
                                            <select
                                                value={editingTournament[`combo${comboNum}_id` as keyof TournamentWithCombos] as number || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value ? parseInt(e.target.value) : null
                                                    setEditingTournament({ ...editingTournament, [`combo${comboNum}_id`]: value })
                                                }}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option value="">Select combo...</option>
                                                {combos.map((combo) => (
                                                    <option key={combo.id} value={combo.id}>
                                                        {formatComboName(combo)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Points Earned
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={editingTournament[`combo${comboNum}_points` as keyof TournamentWithCombos] as number || 0}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0
                                                    setEditingTournament({ ...editingTournament, [`combo${comboNum}_points`]: value })
                                                }}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={editingTournament.notes || ''}
                                onChange={(e) => setEditingTournament({ ...editingTournament, notes: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Update Tournament
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowEditForm(false)
                                    setEditingTournament(null)
                                }}
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
                                <button
                                    onClick={() => startEdit(tournament)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg transition-colors text-sm"
                                >
                                    Edit
                                </button>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                                    <div className="font-medium text-gray-900 dark:text-white">Combo 1</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">{tournament.combo1 ? formatComboName(tournament.combo1) : 'N/A'}</div>
                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{tournament.combo1_points} pts</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                                    <div className="font-medium text-gray-900 dark:text-white">Combo 2</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">{tournament.combo2 ? formatComboName(tournament.combo2) : 'N/A'}</div>
                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{tournament.combo2_points} pts</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                                    <div className="font-medium text-gray-900 dark:text-white">Combo 3</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">{tournament.combo3 ? formatComboName(tournament.combo3) : 'N/A'}</div>
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
    formatComboName: (combo: ComboWithParts) => string
}) {
    return (
        <div className="space-y-6">
            {/* AI Deck Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🤖 AI Deck Recommendations</h3>
                <div className="space-y-4">
                    {deckRecommendations.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No recommendations available. Add some combos and test them to get AI suggestions!</p>
                    ) : (
                        deckRecommendations.map((rec: DeckRecommendation, index: number) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Strategy #{index + 1}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                                                {rec.confidence_score}% Confidence
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Expected: {rec.expected_performance.win_rate.toFixed(1)}% WR, {rec.expected_performance.avg_points.toFixed(1)} pts avg
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDeck(rec.combos)}
                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded transition-colors text-sm"
                                    >
                                        Select Deck
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-3 gap-2 mb-3">
                                    {rec.combos.map((combo: ComboWithParts, comboIndex: number) => (
                                        <div key={`deck-rec-${index}-combo-${comboIndex}-${combo.id}`} className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                                            <div className="font-medium text-sm text-gray-900 dark:text-white">
                                                {formatComboName(combo)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Strategy:</strong> {rec.reasons.join(', ')}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Selected Tournament Deck */}
            {selectedDeck.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🏆 Selected Tournament Deck</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {selectedDeck.map((combo: ComboWithParts, index: number) => (
                            <div key={`selected-deck-${index}-${combo.id}`} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <div className="font-semibold text-green-900 dark:text-green-300 mb-2">
                                    Deck Position {index + 1}
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    {formatComboName(combo)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {combo.wins}W-{combo.losses}L • {combo.tournaments_used} tournaments
                                </div>
                            </div>
                        ))}
                    </div>

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

function PracticeTab({
    selectedDeck,
    generatePracticeRecommendations,
    formatComboName
}: {
    selectedDeck: ComboWithParts[]
    generatePracticeRecommendations: () => {
        type: string
        title: string
        description: string
        combos: ComboWithParts[]
        priority: string
    }[]
    formatComboName: (combo: ComboWithParts) => string
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🎯 Practice Recommendations</h3>

            {selectedDeck.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Select a tournament deck from the Deck Builder to get personalized practice recommendations!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {generatePracticeRecommendations().map((rec: { type: string, title: string, description: string, combos: ComboWithParts[], priority: string }, index: number) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                            rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                                'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                        }`}>
                                        {rec.priority.toUpperCase()} PRIORITY
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h5 className="font-medium text-gray-900 dark:text-white text-sm">Recommended Combos:</h5>
                                <div className="flex flex-wrap gap-2">
                                    {rec.combos.map((combo: ComboWithParts, comboIndex: number) => (
                                        <div key={`practice-rec-${index}-combo-${comboIndex}-${combo.id}`} className="bg-gray-50 dark:bg-gray-700 rounded px-3 py-1">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {formatComboName(combo)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function CalendarTab({
    upcomingTournaments,
    showAddUpcomingForm,
    setShowAddUpcomingForm,
    newUpcoming,
    setNewUpcoming,
    handleAddUpcoming
}: {
    upcomingTournaments: UpcomingTournament[]
    showAddUpcomingForm: boolean
    setShowAddUpcomingForm: React.Dispatch<React.SetStateAction<boolean>>
    newUpcoming: {
        name: string
        location: string
        date: string
        registration_deadline: string
        notes: string
    }
    setNewUpcoming: React.Dispatch<React.SetStateAction<{
        name: string
        location: string
        date: string
        registration_deadline: string
        notes: string
    }>>
    handleAddUpcoming: (e: React.FormEvent) => Promise<void>
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Upcoming Tournaments
                </h3>
                <button
                    onClick={() => setShowAddUpcomingForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    + Add Tournament
                </button>
            </div>

            {/* Add Upcoming Tournament Form */}
            {showAddUpcomingForm && (
                <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Upcoming Tournament</h4>
                    <form onSubmit={handleAddUpcoming} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tournament Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newUpcoming.name}
                                    onChange={(e) => setNewUpcoming({ ...newUpcoming, name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Enter tournament name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={newUpcoming.location}
                                    onChange={(e) => setNewUpcoming({ ...newUpcoming, location: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Enter location"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tournament Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={newUpcoming.date}
                                    onChange={(e) => setNewUpcoming({ ...newUpcoming, date: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Registration Deadline
                                </label>
                                <input
                                    type="date"
                                    value={newUpcoming.registration_deadline}
                                    onChange={(e) => setNewUpcoming({ ...newUpcoming, registration_deadline: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={newUpcoming.notes}
                                onChange={(e) => setNewUpcoming({ ...newUpcoming, notes: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                rows={3}
                                placeholder="Any additional notes about the tournament"
                            />
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
                                onClick={() => setShowAddUpcomingForm(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Upcoming Tournaments List */}
            {upcomingTournaments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No upcoming tournaments scheduled.</p>
                    <p className="text-sm mt-2">Add tournaments to track registration deadlines and prepare your decks!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {upcomingTournaments.map((tournament) => (
                        <div key={tournament.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{tournament.name}</h4>
                                    {tournament.location && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">📍 {tournament.location}</p>
                                    )}
                                    <p className="text-sm text-gray-600 dark:text-gray-400">📅 {new Date(tournament.tournament_date).toLocaleDateString()}</p>
                                    {tournament.registration_deadline && (
                                        <p className="text-sm text-red-600 dark:text-red-400">⏰ Registration: {new Date(tournament.registration_deadline).toLocaleDateString()}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs ${tournament.is_registered ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                        {tournament.is_registered ? 'Registered' : 'Not Registered'}
                                    </span>
                                </div>
                            </div>
                            {tournament.notes && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{tournament.notes}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
