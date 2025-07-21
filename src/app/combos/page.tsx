'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getAllParts, getAllCombos, addCombo, updateCombo, deleteCombo } from '@/services/database'
import type { BeybladePartDB, ComboWithParts, BeybladeComboCreate, PartType } from '@/types/beyblade'

export default function Combos() {
    const [parts, setParts] = useState<BeybladePartDB[]>([])
    const [combos, setCombos] = useState<ComboWithParts[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingCombo, setEditingCombo] = useState<ComboWithParts | null>(null)

    // Form state
    const [newCombo, setNewCombo] = useState<BeybladeComboCreate>({
        name: '',
        blade_id: null,
        assist_blade_id: null,
        ratchet_id: null,
        bit_id: null,
        notes: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    // Refresh data when page becomes visible (e.g., navigating back from tournaments)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadData()
            }
        }

        const handleFocus = () => {
            loadData()
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('focus', handleFocus)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('focus', handleFocus)
        }
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [partsData, combosData] = await Promise.all([
                getAllParts(),
                getAllCombos()
            ])
            setParts(partsData)
            setCombos(combosData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddCombo = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await addCombo(newCombo)
            setNewCombo({
                name: '',
                blade_id: null,
                assist_blade_id: null,
                ratchet_id: null,
                bit_id: null,
                notes: ''
            })
            setShowAddForm(false)
            loadData() // Refresh data
        } catch (error) {
            console.error('Error adding combo:', error)
        }
    }

    const handleEditCombo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingCombo) return

        try {
            await updateCombo(editingCombo.id, {
                name: editingCombo.name,
                blade_id: editingCombo.blade_id,
                assist_blade_id: editingCombo.assist_blade_id,
                ratchet_id: editingCombo.ratchet_id,
                bit_id: editingCombo.bit_id,
                notes: editingCombo.notes
            })
            setEditingCombo(null)
            loadData() // Refresh data
        } catch (error) {
            console.error('Error updating combo:', error)
        }
    }

    const handleDeleteCombo = async (id: number) => {
        if (!confirm('Are you sure you want to delete this combo?')) return

        try {
            await deleteCombo(id)
            loadData() // Refresh data
        } catch (error) {
            console.error('Error deleting combo:', error)
        }
    }

    const startEditing = (combo: ComboWithParts) => {
        setEditingCombo({ ...combo })
        setShowAddForm(false) // Close add form if open
    }

    const cancelEditing = () => {
        setEditingCombo(null)
    }

    const getPartsByType = (type: PartType) => {
        return parts.filter(part => part.type === type && part.quantity > 0)
    }

    const formatComboDisplay = (combo: ComboWithParts) => {
        const parts = []
        if (combo.blade?.name) parts.push(combo.blade.name)
        if (combo.assist_blade?.name) parts.push(combo.assist_blade.name)
        if (combo.ratchet?.name) parts.push(combo.ratchet.name)
        if (combo.bit?.name) parts.push(combo.bit.name)
        return parts.length > 0 ? parts.join(' + ') : 'Incomplete combo'
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navigation currentPage="combos" />
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center flex-1">
                    <div className="text-xl text-gray-600 dark:text-gray-300">Loading combos...</div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
                <Navigation currentPage="combos" />
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex-1">
                    <div className="container mx-auto px-4 py-16">
                        <header className="text-center mb-16">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Combo Builder
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                Create and manage your Beyblade combinations for tournaments.
                            </p>
                        </header>

                        <div className="max-w-6xl mx-auto">
                            {/* Quick Stats */}
                            <div className="grid md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-purple-900 dark:text-purple-300">Total Combos</h3>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{combos.length}</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-green-900 dark:text-green-300">Top Performer</h3>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {combos.length > 0 ? (combos[0].total_points || 0) : 0} pts
                                    </p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-300">Tournament Ready</h3>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{combos.length >= 3 ? 'Yes' : 'No'}</p>
                                </div>
                            </div>

                            {/* Add Combo Button */}
                            <div className="mb-8 text-center flex gap-4 justify-center">
                                <button
                                    onClick={() => {
                                        setShowAddForm(true)
                                        setEditingCombo(null)
                                    }}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Create New Combo
                                </button>
                                <button
                                    onClick={loadData}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                    title="Refresh combo data"
                                >
                                    🔄 Refresh
                                </button>
                            </div>

                            {/* Add Combo Form */}
                            {showAddForm && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Combo</h3>
                                    <form onSubmit={handleAddCombo} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Combo Name
                                            </label>
                                            <input
                                                type="text"
                                                value={newCombo.name}
                                                onChange={(e) => setNewCombo({ ...newCombo, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                required
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Blade
                                                </label>
                                                <select
                                                    value={newCombo.blade_id || ''}
                                                    onChange={(e) => setNewCombo({ ...newCombo, blade_id: e.target.value ? parseInt(e.target.value) : null })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                >
                                                    <option value="">
                                                        {getPartsByType('blade').length === 0 ? 'No blades available - add to collection first' : 'Select blade...'}
                                                    </option>
                                                    {getPartsByType('blade').map((part) => (
                                                        <option key={part.id} value={part.id}>
                                                            {part.name} {part.series && `(${part.series})`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Assist Blade (Optional)
                                                </label>
                                                <select
                                                    value={newCombo.assist_blade_id || ''}
                                                    onChange={(e) => setNewCombo({ ...newCombo, assist_blade_id: e.target.value ? parseInt(e.target.value) : null })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                >
                                                    <option value="">
                                                        {getPartsByType('assist_blade').length === 0 ? 'No assist blades available (optional)' : 'No assist blade'}
                                                    </option>
                                                    {getPartsByType('assist_blade').map((part) => (
                                                        <option key={part.id} value={part.id}>
                                                            {part.name} {part.series && `(${part.series})`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Ratchet
                                                </label>
                                                <select
                                                    value={newCombo.ratchet_id || ''}
                                                    onChange={(e) => setNewCombo({ ...newCombo, ratchet_id: e.target.value ? parseInt(e.target.value) : null })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                >
                                                    <option value="">
                                                        {getPartsByType('ratchet').length === 0 ? 'No ratchets available - add to collection first' : 'Select ratchet...'}
                                                    </option>
                                                    {getPartsByType('ratchet').map((part) => (
                                                        <option key={part.id} value={part.id}>
                                                            {part.name} {part.series && `(${part.series})`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Bit
                                                </label>
                                                <select
                                                    value={newCombo.bit_id || ''}
                                                    onChange={(e) => setNewCombo({ ...newCombo, bit_id: e.target.value ? parseInt(e.target.value) : null })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                >
                                                    <option value="">
                                                        {getPartsByType('bit').length === 0 ? 'No bits available - add to collection first' : 'Select bit...'}
                                                    </option>
                                                    {getPartsByType('bit').map((part) => (
                                                        <option key={part.id} value={part.id}>
                                                            {part.name} {part.series && `(${part.series})`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Notes (Optional)
                                            </label>
                                            <textarea
                                                value={newCombo.notes || ''}
                                                onChange={(e) => setNewCombo({ ...newCombo, notes: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                type="submit"
                                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                Create Combo
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

                            {/* Edit Combo Form */}
                            {editingCombo && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Combo</h3>
                                    <form onSubmit={handleEditCombo} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Combo Name
                                            </label>
                                            <input
                                                type="text"
                                                value={editingCombo.name}
                                                onChange={(e) => setEditingCombo({ ...editingCombo, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                required
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Blade
                                                </label>
                                                <select
                                                    value={editingCombo.blade_id || ''}
                                                    onChange={(e) => setEditingCombo({ ...editingCombo, blade_id: e.target.value ? parseInt(e.target.value) : null })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                >
                                                    <option value="">
                                                        {getPartsByType('blade').length === 0 ? 'No blades available - add to collection first' : 'Select blade...'}
                                                    </option>
                                                    {getPartsByType('blade').map((part) => (
                                                        <option key={part.id} value={part.id}>
                                                            {part.name} {part.series && `(${part.series})`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Assist Blade (Optional)
                                                </label>
                                                <select
                                                    value={editingCombo.assist_blade_id || ''}
                                                    onChange={(e) => setEditingCombo({ ...editingCombo, assist_blade_id: e.target.value ? parseInt(e.target.value) : null })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                >
                                                    <option value="">
                                                        {getPartsByType('assist_blade').length === 0 ? 'No assist blades available (optional)' : 'No assist blade'}
                                                    </option>
                                                    {getPartsByType('assist_blade').map((part) => (
                                                        <option key={part.id} value={part.id}>
                                                            {part.name} {part.series && `(${part.series})`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Ratchet
                                                </label>
                                                <select
                                                    value={editingCombo.ratchet_id || ''}
                                                    onChange={(e) => setEditingCombo({ ...editingCombo, ratchet_id: e.target.value ? parseInt(e.target.value) : null })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                >
                                                    <option value="">
                                                        {getPartsByType('ratchet').length === 0 ? 'No ratchets available - add to collection first' : 'Select ratchet...'}
                                                    </option>
                                                    {getPartsByType('ratchet').map((part) => (
                                                        <option key={part.id} value={part.id}>
                                                            {part.name} {part.series && `(${part.series})`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Bit
                                                </label>
                                                <select
                                                    value={editingCombo.bit_id || ''}
                                                    onChange={(e) => setEditingCombo({ ...editingCombo, bit_id: e.target.value ? parseInt(e.target.value) : null })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                >
                                                    <option value="">
                                                        {getPartsByType('bit').length === 0 ? 'No bits available - add to collection first' : 'Select bit...'}
                                                    </option>
                                                    {getPartsByType('bit').map((part) => (
                                                        <option key={part.id} value={part.id}>
                                                            {part.name} {part.series && `(${part.series})`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Notes (Optional)
                                            </label>
                                            <textarea
                                                value={editingCombo.notes || ''}
                                                onChange={(e) => setEditingCombo({ ...editingCombo, notes: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                type="submit"
                                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                Save Changes
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

                            {/* Combos List */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Your Combos</h3>
                                {combos.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                                            No combos created yet. Create your first combo to get started!
                                        </p>
                                        {parts.length === 0 && (
                                            <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                                💡 You&apos;ll need some parts first. <a href="/collection" className="underline">Add parts to your collection</a>
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {combos.map((combo) => (
                                            <div key={combo.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{combo.name}</h4>
                                                        <p className="text-gray-600 dark:text-gray-300">{formatComboDisplay(combo)}</p>
                                                        {combo.notes && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                📝 {combo.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                                                {combo.total_points || 0} pts
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {combo.tournaments_used || 0} tournaments
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => startEditing(combo)}
                                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                                                title="Edit combo"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCombo(combo.id)}
                                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                                                title="Delete combo"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </ProtectedRoute>
    )
}
