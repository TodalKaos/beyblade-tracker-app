'use client'

import { useState, useEffect } from 'react'
import { getAllParts, getCollectionStats, addPart, updatePart, deletePart, searchParts } from '@/services/database'
import type { BeybladePartDB, BeybladePartCreate, PartType } from '@/types/beyblade'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Collection() {
    const [parts, setParts] = useState<BeybladePartDB[]>([])
    const [stats, setStats] = useState({
        blade: 0,
        assist_blade: 0,
        ratchet: 0,
        bit: 0,
        total: 0
    })
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingPart, setEditingPart] = useState<BeybladePartDB | null>(null)

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<PartType | 'all'>('all')

    // Form state
    const [newPart, setNewPart] = useState<BeybladePartCreate>({
        name: '',
        type: 'blade' as PartType,
        quantity: 1,
        series: '',
        color: '',
        notes: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        // Search/filter when search term or filter changes
        handleSearch()
    }, [searchTerm, filterType])

    const loadData = async () => {
        try {
            setLoading(true)
            const [partsData, statsData] = await Promise.all([
                getAllParts(),
                getCollectionStats()
            ])
            setParts(partsData)
            setStats(statsData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        try {
            const searchResults = await searchParts(searchTerm, filterType)
            setParts(searchResults)
        } catch (error) {
            console.error('Error searching parts:', error)
        }
    }

    const handleAddPart = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await addPart(newPart)
            setNewPart({ name: '', type: 'blade' as PartType, quantity: 1, series: '', color: '', notes: '' })
            setShowAddForm(false)
            loadData() // Refresh data and stats
            setSearchTerm('') // Clear search to show new part
            setFilterType('all')
        } catch (error) {
            console.error('Error adding part:', error)
        }
    }

    const handleEditPart = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingPart) return

        try {
            await updatePart(editingPart.id, {
                name: editingPart.name,
                type: editingPart.type,
                quantity: editingPart.quantity,
                series: editingPart.series,
                color: editingPart.color,
                notes: editingPart.notes
            })
            setEditingPart(null)
            loadData() // Refresh data and stats
            handleSearch() // Maintain current search/filter
        } catch (error) {
            console.error('Error updating part:', error)
        }
    }

    const handleDeletePart = async (id: number) => {
        if (!confirm('Are you sure you want to delete this part?')) return

        try {
            await deletePart(id)
            loadData() // Refresh data and stats
            handleSearch() // Maintain current search/filter
        } catch (error) {
            console.error('Error deleting part:', error)
        }
    }

    const startEditing = (part: BeybladePartDB) => {
        setEditingPart({ ...part })
        setShowAddForm(false) // Close add form if open
    }

    const cancelEditing = () => {
        setEditingPart(null)
    }

    if (loading) {
        return (
            <div className="min-h-screen">
                <Navigation currentPage="collection" />
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                    <div className="text-xl text-gray-600 dark:text-gray-300">Loading collection...</div>
                </div>
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen">
                <Navigation currentPage="collection" />
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                    <div className="container mx-auto px-4 py-16">
                        <header className="text-center mb-16">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Collection Manager
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                Manage your Beyblade parts collection. Track blades, assist blades, ratchets, and bits.
                            </p>
                        </header>

                        <div className="max-w-6xl mx-auto">
                            {/* Collection Stats */}
                            <div className="grid md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-300">Blades</h3>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.blade || 0}</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-green-900 dark:text-green-300">Assist Blades</h3>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.assist_blade || 0}</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-purple-900 dark:text-purple-300">Ratchets</h3>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.ratchet || 0}</p>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-orange-900 dark:text-orange-300">Bits</h3>
                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.bit || 0}</p>
                                </div>
                            </div>

                            {/* Search and Filter Controls */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Search Parts
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Search by part name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Filter by Type
                                        </label>
                                        <select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value as PartType | 'all')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="blade">Blades</option>
                                            <option value="assist_blade">Assist Blades</option>
                                            <option value="ratchet">Ratchets</option>
                                            <option value="bit">Bits</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Add Part Button */}
                            <div className="mb-8 text-center">
                                <button
                                    onClick={() => {
                                        setShowAddForm(true)
                                        setEditingPart(null) // Close edit form if open
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Add New Part
                                </button>
                            </div>

                            {/* Add Part Form */}
                            {showAddForm && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Part</h3>
                                    <form onSubmit={handleAddPart} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Part Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newPart.name}
                                                    onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Part Type
                                                </label>
                                                <select
                                                    value={newPart.type}
                                                    onChange={(e) => setNewPart({ ...newPart, type: e.target.value as PartType })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                >
                                                    <option value="blade">Blade</option>
                                                    <option value="assist_blade">Assist Blade</option>
                                                    <option value="ratchet">Ratchet</option>
                                                    <option value="bit">Bit</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={newPart.quantity || 1}
                                                    onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Series (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newPart.series || ''}
                                                    onChange={(e) => setNewPart({ ...newPart, series: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Color (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newPart.color || ''}
                                                    onChange={(e) => setNewPart({ ...newPart, color: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Notes (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newPart.notes || ''}
                                                    onChange={(e) => setNewPart({ ...newPart, notes: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                type="submit"
                                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                Add Part
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

                            {/* Edit Part Form */}
                            {editingPart && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Part</h3>
                                    <form onSubmit={handleEditPart} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Part Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingPart.name}
                                                    onChange={(e) => setEditingPart({ ...editingPart, name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Part Type
                                                </label>
                                                <select
                                                    value={editingPart.type}
                                                    onChange={(e) => setEditingPart({ ...editingPart, type: e.target.value as PartType })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                >
                                                    <option value="blade">Blade</option>
                                                    <option value="assist_blade">Assist Blade</option>
                                                    <option value="ratchet">Ratchet</option>
                                                    <option value="bit">Bit</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={editingPart.quantity || 1}
                                                    onChange={(e) => setEditingPart({ ...editingPart, quantity: parseInt(e.target.value) || 1 })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Series (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingPart.series || ''}
                                                    onChange={(e) => setEditingPart({ ...editingPart, series: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Color (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingPart.color || ''}
                                                    onChange={(e) => setEditingPart({ ...editingPart, color: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Notes (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingPart.notes || ''}
                                                    onChange={(e) => setEditingPart({ ...editingPart, notes: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                type="submit"
                                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
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

                            {/* Parts List */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Parts Collection</h3>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                        {searchTerm || filterType !== 'all' ? (
                                            <span>Showing {parts.length} filtered results</span>
                                        ) : (
                                            <span>{parts.length} total parts</span>
                                        )}
                                    </div>
                                </div>
                                {parts.length === 0 ? (
                                    <div className="text-center py-8">
                                        {searchTerm || filterType !== 'all' ? (
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                                    No parts found matching your search criteria.
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm('')
                                                        setFilterType('all')
                                                    }}
                                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    Clear filters
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-gray-600 dark:text-gray-300">
                                                No parts added yet. Add your first part to get started!
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {parts.map((part) => (
                                            <div key={part.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{part.name}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {part.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        {part.series && ` • ${part.series}`}
                                                        {part.color && ` • ${part.color}`}
                                                    </p>
                                                    {part.notes && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            📝 {part.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                        x{part.quantity}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => startEditing(part)}
                                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                                            title="Edit part"
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePart(part.id)}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                                            title="Delete part"
                                                        >
                                                            🗑️ Delete
                                                        </button>
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
            </div>
        </ProtectedRoute>
    )
}
