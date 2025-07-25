'use client'

import { useState, useEffect, useRef } from 'react'
import type { BeybladePartDB, PartType } from '@/types/beyblade'
import { searchMasterParts, MASTER_PARTS } from '@/data/masterParts'

interface AutocompleteInputProps {
    value: string
    onChange: (value: string) => void
    type: PartType
    existingParts: BeybladePartDB[]
    placeholder?: string
    className?: string
    required?: boolean
}

interface Suggestion {
    name: string
    source: 'existing' | 'master'
    series?: string
    image?: string
}

// Helper function to get image for a part by name and type
const getPartImage = (name: string, type: PartType): string | undefined => {
    const masterPart = MASTER_PARTS.find(part =>
        part.name.toLowerCase() === name.toLowerCase() && part.type === type
    )
    return masterPart?.image
}

export default function AutocompleteInput({
    value,
    onChange,
    type,
    existingParts,
    placeholder = 'Start typing to see suggestions...',
    className = '',
    required = false
}: AutocompleteInputProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Generate suggestions based on input
    useEffect(() => {
        if (!value.trim()) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        const searchTerm = value.toLowerCase()
        const newSuggestions: Suggestion[] = []

        // First, add existing parts from user's collection
        const existingMatches = existingParts
            .filter(part =>
                part.type === type &&
                part.name.toLowerCase().includes(searchTerm) &&
                part.name.toLowerCase() !== searchTerm // Don't show exact matches
            )
            .map(part => ({
                name: part.name,
                source: 'existing' as const,
                series: part.series,
                image: getPartImage(part.name, part.type)
            }))

        // Then, add master parts that aren't already in user's collection
        const masterMatches = searchMasterParts(value, type)
            .filter(masterPart =>
                !existingParts.some(existingPart =>
                    existingPart.name.toLowerCase() === masterPart.name.toLowerCase()
                ) &&
                masterPart.name.toLowerCase() !== searchTerm // Don't show exact matches
            )
            .map(part => ({
                name: part.name,
                source: 'master' as const,
                series: part.series,
                image: part.image
            }))

        console.log('AutocompleteInput Debug:', {
            searchTerm,
            type,
            existingPartsCount: existingParts.length,
            masterMatchesCount: masterMatches.length,
            masterMatches: masterMatches.slice(0, 3), // Log first 3 for debugging
        })

        // Combine suggestions (existing first, then master)
        newSuggestions.push(...existingMatches.slice(0, 5)) // Limit existing to 5
        newSuggestions.push(...masterMatches.slice(0, 5)) // Limit master to 5

        setSuggestions(newSuggestions)
        setShowSuggestions(newSuggestions.length > 0)
        setSelectedIndex(-1)
    }, [value, type, existingParts])

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    selectSuggestion(suggestions[selectedIndex])
                }
                break
            case 'Escape':
                setShowSuggestions(false)
                setSelectedIndex(-1)
                break
        }
    }

    // Select a suggestion
    const selectSuggestion = (suggestion: Suggestion) => {
        onChange(suggestion.name)
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.focus()
    }

    // Hide suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => value.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className}`}
                required={required}
                autoComplete="off"
            />

            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={`${suggestion.name}-${suggestion.source}`}
                            className={`px-3 py-2 cursor-pointer flex items-center gap-3 ${index === selectedIndex
                                ? 'bg-blue-500 text-white'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                                }`}
                            onClick={() => selectSuggestion(suggestion)}
                        >
                            {/* Part Image */}
                            <div className="flex-shrink-0">
                                <img
                                    src={suggestion.image || '/images/parts/placeholder.svg'}
                                    alt={suggestion.name}
                                    className="w-10 h-10 rounded-md object-cover bg-gray-100 dark:bg-gray-700"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = '/images/parts/placeholder.svg'
                                    }}
                                />
                            </div>

                            {/* Part Info */}
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{suggestion.name}</div>
                                {suggestion.series && (
                                    <div className={`text-sm truncate ${index === selectedIndex
                                        ? 'text-blue-100'
                                        : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                        {suggestion.series}
                                    </div>
                                )}
                            </div>

                            {/* Source Badge */}
                            <div className={`flex-shrink-0 text-xs px-2 py-1 rounded ${suggestion.source === 'existing'
                                ? index === selectedIndex
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : index === selectedIndex
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                }`}>
                                {suggestion.source === 'existing' ? 'In Collection' : 'Suggested'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
