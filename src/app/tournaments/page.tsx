'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getAllTournaments, getTournamentStats, addTournament, updateTournament, deleteTournament, getAllCombos } from '@/services/database'
import type { TournamentWithCombos, TournamentCreate, ComboWithParts } from '@/types/beyblade'

export default function Tournaments() {
    const [tournaments, setTournaments] = useState<TournamentWithCombos[]>([])
    const [combos, setCombos] = useState<ComboWithParts[]>([])
    const [stats, setStats] = useState({
        totalTournaments: 0,
        totalPoints: 0,
        averagePoints: 0,
        topComboPoints: 0
    })
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [editingTournament, setEditingTournament] = useState<TournamentWithCombos | null>(null)

    // Form state
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
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
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
            loadData() // Refresh data
        } catch (error) {
            console.error('Error adding tournament:', error)
        }
    }

    const handleEditTournament = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingTournament) return

        try {
            const tournamentData: TournamentCreate = {
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
            await updateTournament(editingTournament.id, tournamentData)
            setShowEditForm(false)
            setEditingTournament(null)
            loadData() // Refresh data
        } catch (error) {
            console.error('Error updating tournament:', error)
        }
    }

    const startEditing = (tournament: TournamentWithCombos) => {
        setEditingTournament(tournament)
        setShowEditForm(true)
        setShowAddForm(false) // Close add form if open
    }

    const cancelEditing = () => {
        setShowEditForm(false)
        setEditingTournament(null)
    }

    const handleDeleteTournament = async (id: number) => {
        if (!confirm('Are you sure you want to delete this tournament?')) return

        try {
            await deleteTournament(id)
            loadData() // Refresh data
        } catch (error) {
            console.error('Error deleting tournament:', error)
        }
    }

    const formatComboName = (combo: any) => {
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
            <div className="min-h-screen">
                <Navigation currentPage="tournaments" />
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center min-h-screen">
                    <div className="text-xl text-gray-600 dark:text-gray-300">Loading tournaments...</div>
                </div>
            </div>
        )
    }
    return (
        <ProtectedRoute>
            <div className="min-h-screen">
                <Navigation currentPage="tournaments" />
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
                    <div className="container mx-auto px-4 py-16">
                        <header className="text-center mb-16">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Tournament Tracker
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                Track your tournament performance and analyze your combo statistics.
                            </p>
                        </header>

                        <div className="max-w-6xl mx-auto">
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

                            {/* Add Tournament Button */}
                            <div className="mb-8 text-center">
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Add New Tournament
                                </button>
                            </div>

                            {/* Add Tournament Form */}
                            {showAddForm && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Tournament</h3>
                                    {combos.length < 3 && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                                            <p className="text-yellow-800 dark:text-yellow-300">
                                                ⚠️ You need at least 3 combos to create a tournament deck.
                                                <a href="/collection" className="underline ml-1">Create some combos first</a>
                                            </p>
                                        </div>
                                    )}
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

                                        {/* Tournament Results */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Final Placement (Optional)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="e.g. 3 (for 3rd place)"
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
                                                    placeholder="e.g. 32"
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
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                                        >
                                                            <option value="">Select combo...</option>
                                                            {combos.map((combo) => (
                                                                <option key={combo.id} value={combo.id}>
                                                                    {combo.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder="Points earned"
                                                            value={newTournament[`combo${comboNum}_points` as keyof TournamentCreate] as number || 0}
                                                            onChange={(e) => setNewTournament({
                                                                ...newTournament,
                                                                [`combo${comboNum}_points`]: parseInt(e.target.value) || 0
                                                            })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                type="submit"
                                                disabled={combos.length < 3}
                                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
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
                                    <form onSubmit={handleEditTournament} className="space-y-4">
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Tournament Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingTournament.name}
                                                    onChange={(e) => setEditingTournament({ ...editingTournament, name: e.target.value })}
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
                                                    value={editingTournament.location || ''}
                                                    onChange={(e) => setEditingTournament({ ...editingTournament, location: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={editingTournament.tournament_date}
                                                    onChange={(e) => setEditingTournament({ ...editingTournament, tournament_date: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Tournament Results */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Final Placement (Optional)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="e.g. 3 (for 3rd place)"
                                                    value={editingTournament.placement || ''}
                                                    onChange={(e) => setEditingTournament({ ...editingTournament, placement: e.target.value ? parseInt(e.target.value) : undefined })}
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
                                                    placeholder="e.g. 32"
                                                    value={editingTournament.total_players || ''}
                                                    onChange={(e) => setEditingTournament({ ...editingTournament, total_players: e.target.value ? parseInt(e.target.value) : undefined })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Deck Selection for Editing */}
                                        <div className="grid md:grid-cols-3 gap-4">
                                            {[1, 2, 3].map((comboNum) => (
                                                <div key={comboNum} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Combo {comboNum}</h4>
                                                    <div className="space-y-2">
                                                        <select
                                                            value={editingTournament[`combo${comboNum}_id` as keyof TournamentWithCombos] as number || ''}
                                                            onChange={(e) => setEditingTournament({
                                                                ...editingTournament,
                                                                [`combo${comboNum}_id`]: e.target.value ? parseInt(e.target.value) : null
                                                            })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                                        >
                                                            <option value="">Select combo...</option>
                                                            {combos.map((combo) => (
                                                                <option key={combo.id} value={combo.id}>
                                                                    {combo.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder="Points earned"
                                                            value={editingTournament[`combo${comboNum}_points` as keyof TournamentWithCombos] as number || 0}
                                                            onChange={(e) => setEditingTournament({
                                                                ...editingTournament,
                                                                [`combo${comboNum}_points`]: parseInt(e.target.value) || 0
                                                            })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
                                                value={editingTournament.notes || ''}
                                                onChange={(e) => setEditingTournament({ ...editingTournament, notes: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                type="submit"
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                Update Tournament
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelEditing}
                                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Tournament History */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Tournament History</h3>
                                {tournaments.length === 0 ? (
                                    <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                                        No tournaments recorded yet. Add your first tournament to get started!
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {tournaments.map((tournament) => (
                                            <div key={tournament.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{tournament.name}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                                            {tournament.location && `${tournament.location} • `}
                                                            {new Date(tournament.tournament_date).toLocaleDateString()}
                                                            {tournament.placement && tournament.total_players && (
                                                                <span className="ml-2 text-blue-600 dark:text-blue-400 font-semibold">
                                                                    • Placed {tournament.placement} of {tournament.total_players}
                                                                </span>
                                                            )}
                                                            {tournament.placement && !tournament.total_players && (
                                                                <span className="ml-2 text-blue-600 dark:text-blue-400 font-semibold">
                                                                    • Placed {tournament.placement}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                                {tournament.total_points || 0} pts
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => startEditing(tournament)}
                                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                                                title="Edit tournament"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTournament(tournament.id)}
                                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                                                title="Delete tournament"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
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
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
