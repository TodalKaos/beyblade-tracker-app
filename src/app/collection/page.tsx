'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { getAllParts, getCollectionStats, addPart, updatePart, deletePart, searchParts } from '@/services/database'
import type { BeybladePartDB, BeybladePartCreate, PartType } from '@/types/beyblade'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import AutocompleteInput from '@/components/AutocompleteInput'
import { MASTER_PARTS } from '@/data/masterParts'

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

    // Sorting state
    const [sortBy, setSortBy] = useState<'name' | 'type' | 'quantity' | 'series' | 'date_added'>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Form state
    const [newPart, setNewPart] = useState<BeybladePartCreate>({
        name: '',
        type: 'blade' as PartType,
        quantity: 1,
        series: '',
        color: '',
        notes: ''
    })

    // Helper function to get part image from master parts
    const getPartImage = (partName: string, partType: PartType): string => {
        const masterPart = MASTER_PARTS.find(
            masterPart => masterPart.name.toLowerCase() === partName.toLowerCase() && masterPart.type === partType
        )
        return masterPart?.image || '/images/parts/placeholder.svg'
    }

    const handleSearch = useCallback(async () => {
        try {
            const searchResults = await searchParts(searchTerm, filterType)

            // Apply sorting
            searchResults.sort((a, b) => {
                let comparison = 0

                switch (sortBy) {
                    case 'name':
                        comparison = a.name.localeCompare(b.name)
                        break
                    case 'type':
                        comparison = a.type.localeCompare(b.type)
                        break
                    case 'quantity':
                        comparison = a.quantity - b.quantity
                        break
                    case 'series':
                        comparison = (a.series || '').localeCompare(b.series || '')
                        break
                    case 'date_added':
                        comparison = new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
                        break
                    default:
                        comparison = 0
                }

                return sortOrder === 'desc' ? -comparison : comparison
            })

            setParts(searchResults)
            setCurrentPage(1) // Reset to first page when searching
        } catch (error) {
            console.error('Error searching parts:', error)
        }
    }, [searchTerm, filterType, sortBy, sortOrder])

    // Pagination calculations
    const totalItems = parts.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentParts = parts.slice(startIndex, endIndex)

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        // Search/filter when search term or filter changes
        handleSearch()
    }, [handleSearch])

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

    const handleAddPart = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // Check if part already exists (same name and type)
            const existingPart = parts.find(
                part => part.name.toLowerCase() === newPart.name.toLowerCase() &&
                    part.type === newPart.type
            )

            if (existingPart) {
                // Update existing part quantity
                const updatedQuantity = existingPart.quantity + newPart.quantity
                await updatePart(existingPart.id, {
                    name: existingPart.name,
                    type: existingPart.type,
                    quantity: updatedQuantity,
                    series: existingPart.series || newPart.series, // Keep existing series or use new one if empty
                    color: existingPart.color || newPart.color, // Keep existing color or use new one if empty
                    notes: existingPart.notes || newPart.notes // Keep existing notes or use new one if empty
                })

                // Show success message with quantity update info
                alert(`Updated "${newPart.name}" quantity from ${existingPart.quantity} to ${updatedQuantity} (+${newPart.quantity})`)
            } else {
                // Add as new part
                await addPart(newPart)
                alert(`Added new part: "${newPart.name}" (x${newPart.quantity})`)
            }

            setNewPart({ name: '', type: 'blade' as PartType, quantity: 1, series: '', color: '', notes: '' })
            setShowAddForm(false)
            loadData() // Refresh data and stats
            setSearchTerm('') // Clear search to show updated/new part
            setFilterType('all')
            setCurrentPage(1) // Reset to first page
        } catch (error) {
            console.error('Error adding/updating part:', error)
            alert('Error adding part. Please try again.')
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
            // Keep current page unless it's now out of bounds
            if (currentPage > Math.ceil(parts.length / itemsPerPage)) {
                setCurrentPage(1)
            }
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
            // Keep current page unless it's now out of bounds
            if (currentPage > Math.ceil(parts.length / itemsPerPage)) {
                setCurrentPage(Math.max(1, currentPage - 1))
            }
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

    const handleClearAllFilters = () => {
        setSearchTerm('')
        setFilterType('all')
        setSortBy('name')
        setSortOrder('asc')
        setCurrentPage(1)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navigation currentPage="collection" />
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center flex-1">
                    <div className="text-xl text-gray-600 dark:text-gray-300">Loading collection...</div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
                <Navigation currentPage="collection" />
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex-1">
                    <div className="container mx-auto px-4 py-8 sm:py-16">
                        <header className="text-center mb-8 sm:mb-16">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Collection Manager
                            </h1>
                            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                Manage your Beyblade parts collection. Track blades, assist blades, ratchets, and bits.
                            </p>
                        </header>

                        <div className="max-w-6xl mx-auto">
                            {/* Collection Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 text-sm sm:text-base">Blades</h3>
                                    <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.blade || 0}</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-green-900 dark:text-green-300 text-sm sm:text-base">Assist Blades</h3>
                                    <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.assist_blade || 0}</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-purple-900 dark:text-purple-300 text-sm sm:text-base">Ratchets</h3>
                                    <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.ratchet || 0}</p>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
                                    <h3 className="font-semibold text-orange-900 dark:text-orange-300 text-sm sm:text-base">Bits</h3>
                                    <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.bit || 0}</p>
                                </div>
                            </div>

                            {/* Search, Filter, and Sort Controls */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="sm:col-span-2 lg:col-span-1">
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Sort By
                                        </label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as 'name' | 'type' | 'quantity' | 'series' | 'date_added')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="name">Name</option>
                                            <option value="type">Type</option>
                                            <option value="quantity">Quantity</option>
                                            <option value="series">Series</option>
                                            <option value="date_added">Date Added</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Sort Order
                                        </label>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="asc">Ascending</option>
                                            <option value="desc">Descending</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Clear Filters Button */}
                                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <button
                                        onClick={handleClearAllFilters}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Clear All Filters & Sort
                                    </button>
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

                                    {/* Existing Part Detection */}
                                    {(() => {
                                        const existingPart = parts.find(
                                            part => part.name.toLowerCase() === newPart.name.toLowerCase() &&
                                                part.type === newPart.type &&
                                                newPart.name.trim() !== ''
                                        )

                                        if (existingPart) {
                                            return (
                                                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                                        <span className="text-lg">ℹ️</span>
                                                        <span className="font-medium">Existing Part Found</span>
                                                    </div>
                                                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                                        You already have &quot;{existingPart.name}&quot; (x{existingPart.quantity}).
                                                        Adding this will increase the quantity to x{existingPart.quantity + newPart.quantity}.
                                                    </p>
                                                </div>
                                            )
                                        }
                                        return null
                                    })()}

                                    <form onSubmit={handleAddPart} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Part Name
                                                </label>
                                                <AutocompleteInput
                                                    value={newPart.name}
                                                    onChange={(value, partInfo) => {
                                                        console.log('Collection - received part info:', {
                                                            value,
                                                            partInfo: partInfo ? { series: partInfo.series, type: partInfo.type } : null,
                                                            currentSeries: newPart.series
                                                        })
                                                        const updatedPart = { ...newPart, name: value }
                                                        // Auto-fill series if it's from master parts and series isn't already set
                                                        if (partInfo?.series && !newPart.series) {
                                                            updatedPart.series = partInfo.series
                                                        }
                                                        setNewPart(updatedPart)
                                                    }}
                                                    type={newPart.type}
                                                    existingParts={parts}
                                                    placeholder="Start typing part name..."
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
                                                    value={newPart.quantity === 0 ? '' : newPart.quantity || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        if (value === '') {
                                                            setNewPart({ ...newPart, quantity: 0 }) // Temporarily allow 0 for empty state
                                                        } else {
                                                            const numValue = parseInt(value)
                                                            setNewPart({
                                                                ...newPart,
                                                                quantity: isNaN(numValue) ? 1 : Math.max(1, numValue)
                                                            })
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        // Ensure we have a valid quantity when field loses focus
                                                        if (!e.target.value || parseInt(e.target.value) < 1) {
                                                            setNewPart({ ...newPart, quantity: 1 })
                                                        }
                                                    }}
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
                                                <AutocompleteInput
                                                    value={editingPart.name}
                                                    onChange={(value, partInfo) => {
                                                        const updatedPart = { ...editingPart, name: value }
                                                        // Auto-fill series if it's from master parts and series isn't already set
                                                        if (partInfo?.series && !editingPart.series) {
                                                            updatedPart.series = partInfo.series
                                                        }
                                                        setEditingPart(updatedPart)
                                                    }}
                                                    type={editingPart.type}
                                                    existingParts={parts}
                                                    placeholder="Start typing part name..."
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
                                                    value={editingPart.quantity === 0 ? '' : editingPart.quantity || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        if (value === '') {
                                                            setEditingPart({ ...editingPart, quantity: 0 }) // Temporarily allow 0 for empty state
                                                        } else {
                                                            const numValue = parseInt(value)
                                                            setEditingPart({
                                                                ...editingPart,
                                                                quantity: isNaN(numValue) ? 1 : Math.max(1, numValue)
                                                            })
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        // Ensure we have a valid quantity when field loses focus
                                                        if (!e.target.value || parseInt(e.target.value) < 1) {
                                                            setEditingPart({ ...editingPart, quantity: 1 })
                                                        }
                                                    }}
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
                                    <>
                                        {/* Pagination Controls - Top */}
                                        {totalItems > 0 && (
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-600">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                                        Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} parts
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm text-gray-600 dark:text-gray-300">
                                                            Show:
                                                        </label>
                                                        <select
                                                            value={itemsPerPage}
                                                            onChange={(e) => {
                                                                setItemsPerPage(parseInt(e.target.value))
                                                                setCurrentPage(1)
                                                            }}
                                                            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        >
                                                            <option value={5}>5</option>
                                                            <option value={10}>10</option>
                                                            <option value={20}>20</option>
                                                            <option value={50}>50</option>
                                                        </select>
                                                        <span className="text-sm text-gray-600 dark:text-gray-300">per page</span>
                                                    </div>
                                                </div>

                                                {totalPages > 1 && (
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <button
                                                            onClick={goToPrevPage}
                                                            disabled={currentPage === 1}
                                                            className="px-2 sm:px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:disabled:bg-gray-700 dark:text-white rounded-md text-sm transition-colors"
                                                        >
                                                            ← Prev
                                                        </button>

                                                        <div className="flex items-center gap-1">
                                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                                let pageNum;
                                                                if (totalPages <= 5) {
                                                                    pageNum = i + 1;
                                                                } else if (currentPage <= 3) {
                                                                    pageNum = i + 1;
                                                                } else if (currentPage >= totalPages - 2) {
                                                                    pageNum = totalPages - 4 + i;
                                                                } else {
                                                                    pageNum = currentPage - 2 + i;
                                                                }

                                                                return (
                                                                    <button
                                                                        key={pageNum}
                                                                        onClick={() => goToPage(pageNum)}
                                                                        className={`px-2 sm:px-3 py-1 rounded-md text-sm transition-colors ${currentPage === pageNum
                                                                            ? 'bg-blue-600 text-white dark:bg-blue-500'
                                                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white'
                                                                            }`}
                                                                    >
                                                                        {pageNum}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        <button
                                                            onClick={goToNextPage}
                                                            disabled={currentPage === totalPages}
                                                            className="px-2 sm:px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:disabled:bg-gray-700 dark:text-white rounded-md text-sm transition-colors"
                                                        >
                                                            Next →
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="grid gap-4">
                                            {currentParts.map((part) => (
                                                <div key={part.id} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    {/* Part Image */}
                                                    <div className="flex-shrink-0">
                                                        <Image
                                                            src={getPartImage(part.name, part.type)}
                                                            alt={part.name}
                                                            width={64}
                                                            height={64}
                                                            className="w-16 h-16 rounded-lg object-cover bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement
                                                                target.src = '/images/parts/placeholder.svg'
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Part Info */}
                                                    <div className="flex-1 min-w-0 text-center sm:text-left">
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

                                                    {/* Quantity and Actions */}
                                                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                            x{part.quantity}
                                                        </div>
                                                        <div className="flex gap-2 w-full sm:w-auto">
                                                            <button
                                                                onClick={() => startEditing(part)}
                                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm transition-colors flex-1 sm:flex-none"
                                                                title="Edit part"
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePart(part.id)}
                                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors flex-1 sm:flex-none"
                                                                title="Delete part"
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination Controls - Bottom */}
                                        {totalItems > 0 && totalPages > 1 && (
                                            <div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    <button
                                                        onClick={goToPrevPage}
                                                        disabled={currentPage === 1}
                                                        className="px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:disabled:bg-gray-700 dark:text-white rounded-md text-sm transition-colors"
                                                    >
                                                        ← Prev
                                                    </button>

                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                            let pageNum;
                                                            if (totalPages <= 5) {
                                                                pageNum = i + 1;
                                                            } else if (currentPage <= 3) {
                                                                pageNum = i + 1;
                                                            } else if (currentPage >= totalPages - 2) {
                                                                pageNum = totalPages - 4 + i;
                                                            } else {
                                                                pageNum = currentPage - 2 + i;
                                                            }

                                                            return (
                                                                <button
                                                                    key={pageNum}
                                                                    onClick={() => goToPage(pageNum)}
                                                                    className={`px-2 sm:px-3 py-2 rounded-md text-sm transition-colors ${currentPage === pageNum
                                                                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                                                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white'
                                                                        }`}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <button
                                                        onClick={goToNextPage}
                                                        disabled={currentPage === totalPages}
                                                        className="px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:disabled:bg-gray-700 dark:text-white rounded-md text-sm transition-colors"
                                                    >
                                                        Next →
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
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
