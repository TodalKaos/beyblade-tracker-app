'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import AutocompleteInput from '@/components/AutocompleteInput'
import { getAllParts, getAllCombos, addCombo, updateCombo, deleteCombo } from '@/services/database'
import { calculateComboStats } from '@/data/masterParts'
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

    // Form values for autocomplete (part names)
    const [formValues, setFormValues] = useState({
        blade: '',
        assistBlade: '',
        ratchet: '',
        bit: ''
    })

    // Edit form values for autocomplete (part names)
    const [editFormValues, setEditFormValues] = useState({
        blade: '',
        assistBlade: '',
        ratchet: '',
        bit: ''
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
            // Convert form values (names) to IDs for database
            const comboData = {
                ...newCombo,
                blade_id: getPartIdByName(formValues.blade, 'blade'),
                assist_blade_id: getPartIdByName(formValues.assistBlade, 'assist_blade'),
                ratchet_id: getPartIdByName(formValues.ratchet, 'ratchet'),
                bit_id: getPartIdByName(formValues.bit, 'bit')
            }

            await addCombo(comboData)
            setNewCombo({
                name: '',
                blade_id: null,
                assist_blade_id: null,
                ratchet_id: null,
                bit_id: null,
                notes: ''
            })
            setFormValues({
                blade: '',
                assistBlade: '',
                ratchet: '',
                bit: ''
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
            // Convert edit form values (names) to IDs for database
            await updateCombo(editingCombo.id, {
                name: editingCombo.name,
                blade_id: getPartIdByName(editFormValues.blade, 'blade'),
                assist_blade_id: getPartIdByName(editFormValues.assistBlade, 'assist_blade'),
                ratchet_id: getPartIdByName(editFormValues.ratchet, 'ratchet'),
                bit_id: getPartIdByName(editFormValues.bit, 'bit'),
                notes: editingCombo.notes
            })
            setEditingCombo(null)
            setEditFormValues({
                blade: '',
                assistBlade: '',
                ratchet: '',
                bit: ''
            })
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
        setEditFormValues({
            blade: combo.blade?.name || '',
            assistBlade: combo.assist_blade?.name || '',
            ratchet: combo.ratchet?.name || '',
            bit: combo.bit?.name || ''
        })
        setShowAddForm(false) // Close add form if open
    }

    const cancelEditing = () => {
        setEditingCombo(null)
        setEditFormValues({
            blade: '',
            assistBlade: '',
            ratchet: '',
            bit: ''
        })
    }

    const getPartsByType = (type: PartType) => {
        return parts
            .filter(part => part.type === type && part.quantity > 0)
            .sort((a, b) => a.name.localeCompare(b.name))
    }

    const getPartIdByName = (name: string, type: PartType): number | null => {
        if (!name) return null
        const part = parts.find(p => p.name === name && p.type === type && p.quantity > 0)
        return part ? part.id : null
    }

    const getPartNameById = (id: number | null): string => {
        if (!id) return ''
        const part = parts.find(p => p.id === id)
        return part ? part.name : ''
    }

    const getComboStats = (combo: BeybladeComboCreate | ComboWithParts, formVals?: typeof formValues) => {
        let bladeName: string | undefined
        let assistBladeName: string | undefined
        let ratchetName: string | undefined
        let bitName: string | undefined

        if (formVals) {
            // Use form values directly (for real-time preview)
            bladeName = formVals.blade || undefined
            assistBladeName = formVals.assistBlade || undefined
            ratchetName = formVals.ratchet || undefined
            bitName = formVals.bit || undefined
        } else if ('blade_id' in combo) {
            // BeybladeComboCreate type
            const bladePart = parts.find(p => p.id === combo.blade_id)
            const assistBladePart = parts.find(p => p.id === combo.assist_blade_id)
            const ratchetPart = parts.find(p => p.id === combo.ratchet_id)
            const bitPart = parts.find(p => p.id === combo.bit_id)

            bladeName = bladePart?.name
            assistBladeName = assistBladePart?.name
            ratchetName = ratchetPart?.name
            bitName = bitPart?.name
        } else {
            // ComboWithParts type
            const comboWithParts = combo as ComboWithParts
            bladeName = comboWithParts.blade?.name
            assistBladeName = comboWithParts.assist_blade?.name
            ratchetName = comboWithParts.ratchet?.name
            bitName = comboWithParts.bit?.name
        }

        return calculateComboStats({
            blade: bladeName,
            assistBlade: assistBladeName,
            ratchet: ratchetName,
            bit: bitName
        })
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
                                                <AutocompleteInput
                                                    type="blade"
                                                    value={formValues.blade}
                                                    onChange={(value) => setFormValues({ ...formValues, blade: value })}
                                                    placeholder={getPartsByType('blade').length === 0 ? 'No blades available - add to collection first' : 'Select blade...'}
                                                    existingParts={getPartsByType('blade')}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Assist Blade (Optional)
                                                </label>
                                                <AutocompleteInput
                                                    type="assist_blade"
                                                    value={formValues.assistBlade}
                                                    onChange={(value) => setFormValues({ ...formValues, assistBlade: value })}
                                                    placeholder={getPartsByType('assist_blade').length === 0 ? 'No assist blades available (optional)' : 'No assist blade'}
                                                    existingParts={getPartsByType('assist_blade')}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Ratchet
                                                </label>
                                                <AutocompleteInput
                                                    type="ratchet"
                                                    value={formValues.ratchet}
                                                    onChange={(value) => setFormValues({ ...formValues, ratchet: value })}
                                                    placeholder={getPartsByType('ratchet').length === 0 ? 'No ratchets available - add to collection first' : 'Select ratchet...'}
                                                    existingParts={getPartsByType('ratchet')}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Bit
                                                </label>
                                                <AutocompleteInput
                                                    type="bit"
                                                    value={formValues.bit}
                                                    onChange={(value) => setFormValues({ ...formValues, bit: value })}
                                                    placeholder={getPartsByType('bit').length === 0 ? 'No bits available - add to collection first' : 'Select bit...'}
                                                    existingParts={getPartsByType('bit')}
                                                />
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

                                        {/* Stats Display */}
                                        {(() => {
                                            const stats = getComboStats(newCombo, formValues)
                                            if (!stats) return null

                                            return (
                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Combo Stats</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-red-600">{stats.attack}</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">Attack</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-blue-600">{stats.defense}</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">Defense</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-green-600">{stats.stamina}</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">Stamina</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-purple-600">{stats.weight}g</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">Weight</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-orange-600">{stats.burstResistance}</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">Burst Resist</div>
                                                        </div>
                                                    </div>
                                                    {!stats.canUseAssistBlade && formValues.assistBlade && (
                                                        <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-sm text-yellow-800 dark:text-yellow-200">
                                                            ⚠️ Assist blade only works with CX blades - stats not included
                                                        </div>
                                                    )}
                                                    {stats.assistBladeUsed && (
                                                        <div className="mt-3 p-2 bg-green-100 dark:bg-green-900 rounded text-sm text-green-800 dark:text-green-200">
                                                            ✅ Assist blade stats included
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })()}

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

                                        {/* Stats Display */}
                                        {(() => {
                                            const stats = getComboStats(editingCombo)
                                            if (!stats) return null

                                            return (
                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Combo Stats</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-red-600">{stats.attack}</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">Attack</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-blue-600">{stats.defense}</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">Defense</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-green-600">{stats.stamina}</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">Stamina</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-purple-600">{stats.weight}g</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">Weight</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-orange-600">{stats.burstResistance}</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">Burst Resist</div>
                                                        </div>
                                                    </div>
                                                    {!stats.canUseAssistBlade && editingCombo.assist_blade && (
                                                        <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-sm text-yellow-800 dark:text-yellow-200">
                                                            ⚠️ Assist blade only works with CX blades - stats not included
                                                        </div>
                                                    )}
                                                    {stats.assistBladeUsed && (
                                                        <div className="mt-3 p-2 bg-green-100 dark:bg-green-900 rounded text-sm text-green-800 dark:text-green-200">
                                                            ✅ Assist blade stats included
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })()}

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

                                                        {/* Combo Stats Display */}
                                                        {(() => {
                                                            const stats = getComboStats(combo)
                                                            if (!stats) return null

                                                            return (
                                                                <div className="mt-2 grid grid-cols-5 gap-2 text-xs">
                                                                    <div className="text-center">
                                                                        <div className="font-bold text-red-600 dark:text-red-400">{stats.attack}</div>
                                                                        <div className="text-gray-500 dark:text-gray-400">ATK</div>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <div className="font-bold text-blue-600 dark:text-blue-400">{stats.defense}</div>
                                                                        <div className="text-gray-500 dark:text-gray-400">DEF</div>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <div className="font-bold text-green-600 dark:text-green-400">{stats.stamina}</div>
                                                                        <div className="text-gray-500 dark:text-gray-400">STA</div>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <div className="font-bold text-purple-600 dark:text-purple-400">{stats.weight}g</div>
                                                                        <div className="text-gray-500 dark:text-gray-400">WGT</div>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <div className="font-bold text-orange-600 dark:text-orange-400">{stats.burstResistance}</div>
                                                                        <div className="text-gray-500 dark:text-gray-400">BST</div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })()}

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
