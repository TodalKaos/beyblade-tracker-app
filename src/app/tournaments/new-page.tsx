'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getAllTournaments, getTournamentStats, addTournament, getAllCombos, getComboTestStats } from '@/services/database'
import type { TournamentWithCombos, TournamentCreate, ComboWithParts, DeckRecommendation } from '@/types/beyblade'

export default function EnhancedTournaments() {
    const [tournaments, setTournaments] = useState<TournamentWithCombos[]>([])
    const [combos, setCombos] = useState<ComboWithParts[]>([])
    const [isLoading, setIsLoading] = useState(true)
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

    // Deck Builder State
    const [deckRecommendations, setDeckRecommendations] = useState<DeckRecommendation[]>([])
    const [selectedDeck, setSelectedDeck] = useState<ComboWithParts[]>([])

    // Calendar State
    const [showAddUpcomingForm, setShowAddUpcomingForm] = useState(false)

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
            generateDeckRecommendations()
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // AI Deck Builder Logic
    const generateDeckRecommendations = async () => {
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
                                    {(['tournaments', 'calendar', 'deck-builder', 'practice'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
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
                                    newTournament={newTournament}
                                    setNewTournament={setNewTournament}
                                    handleAddTournament={handleAddTournament}
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
                                <CalendarTab />
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
    newTournament,
    setNewTournament,
    handleAddTournament,
    formatComboName
}: {
    tournaments: TournamentWithCombos[]
    combos: ComboWithParts[]
    showAddForm: boolean
    setShowAddForm: (show: boolean) => void
    newTournament: TournamentCreate
    setNewTournament: React.Dispatch<React.SetStateAction<TournamentCreate>>
    handleAddTournament: (e: React.FormEvent) => Promise<void>
    formatComboName: (combo: ComboWithParts | null | undefined) => string
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
                    <div className="space-y-4">
                        {deckRecommendations.map((rec: DeckRecommendation, index: number) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            Strategy {index + 1}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-2 py-1 rounded text-sm">
                                                {rec.confidence_score}% Confidence
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Expected {rec.expected_performance.win_rate.toFixed(1)}% Win Rate
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDeck(rec.combos)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Select Deck
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-3 gap-3 mb-3">
                                    {rec.combos.map((combo: ComboWithParts, comboIndex: number) => (
                                        <div key={`${combo.id}-${comboIndex}`} className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatComboName(combo)}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                {combo.wins}W-{combo.losses}L • {combo.total_points}pts
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Why this works:</strong> {rec.reasons.join(', ')}
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

function CalendarTab() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Upcoming Tournaments
                </h3>
            </div>

            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No upcoming tournaments scheduled.</p>
                <p className="text-sm mt-2">Check back later for tournament announcements!</p>
            </div>
        </div>
    )
}
