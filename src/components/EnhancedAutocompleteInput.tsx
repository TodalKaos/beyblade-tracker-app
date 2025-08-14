'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { BeybladePartDB, PartType } from '@/types/beyblade'
import { searchPartsAndProducts, MASTER_PARTS } from '@/data/masterParts'
import type { MasterProduct } from '@/data/masterProducts'

interface EnhancedAutocompleteInputProps {
    value: string
    onChange: (value: string, partInfo?: { series?: string; type?: PartType }) => void
    onProductSelect?: (product: MasterProduct) => void
    onRandomBoosterSelect?: (randomBooster: MasterProduct) => void // New prop for random boosters
    existingParts: BeybladePartDB[]
    placeholder?: string
    className?: string
    required?: boolean
    showProducts?: boolean // New prop to control product suggestions
}

interface Suggestion {
    name: string
    source: 'existing' | 'master' | 'product'
    series?: string
    image?: string
    type?: PartType
    product?: MasterProduct
}

// Helper function to get image for a part by name and type
const getPartImage = (name: string, type: PartType): string | undefined => {
    // First try to find exact match with name and type
    let masterPart = MASTER_PARTS.find(part =>
        part.name.toLowerCase() === name.toLowerCase() && part.type === type
    )
    
    // If no exact match, try to find by name only (for cases where type might be slightly different)
    if (!masterPart) {
        masterPart = MASTER_PARTS.find(part =>
            part.name.toLowerCase() === name.toLowerCase()
        )
    }
    
    return masterPart?.image
}

export default function EnhancedAutocompleteInput({
    value,
    onChange,
    onProductSelect,
    onRandomBoosterSelect,
    existingParts,
    placeholder = 'Start typing to see suggestions...',
    className = '',
    required = false,
    showProducts = true
}: EnhancedAutocompleteInputProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Generate suggestions based on input
    useEffect(() => {
        if (!value.trim()) {
            setSuggestions([])
            return
        }

        const newSuggestions: Suggestion[] = []

        if (showProducts) {
            // Get both parts and products (no type filtering - show all parts)
            const { parts: masterParts, products } = searchPartsAndProducts(value)

            // Add existing parts (highest priority) - show all types
            const existingMatches = existingParts
                .filter(part =>
                    part.name.toLowerCase().includes(value.toLowerCase())
                )
                .map(part => ({
                    name: part.name,
                    source: 'existing' as const,
                    series: part.series,
                    image: getPartImage(part.name, part.type),
                    type: part.type
                }))

            newSuggestions.push(...existingMatches)

            // Add product suggestions
            const productSuggestions = products.map(product => ({
                name: `${product.name} (Complete Product)`,
                source: 'product' as const,
                series: product.series,
                image: product.image,
                type: 'blade' as PartType,
                product
            }))
            newSuggestions.push(...productSuggestions)

            // Add master parts suggestions
            const masterSuggestions = masterParts
                .filter(part =>
                    !existingMatches.some(existing =>
                        existing.name.toLowerCase() === part.name.toLowerCase()
                    )
                )
                .map(part => ({
                    name: part.name,
                    source: 'master' as const,
                    series: part.series,
                    image: part.image,
                    type: part.type
                }))

            newSuggestions.push(...masterSuggestions)
        } else {
            // Original logic for parts only - show all types
            const existingMatches = existingParts
                .filter(part =>
                    part.name.toLowerCase().includes(value.toLowerCase())
                )
                .map(part => ({
                    name: part.name,
                    source: 'existing' as const,
                    series: part.series,
                    image: getPartImage(part.name, part.type),
                    type: part.type
                }))

            const masterMatches = MASTER_PARTS
                .filter(part =>
                    part.name.toLowerCase().includes(value.toLowerCase()) &&
                    !existingMatches.some(existing =>
                        existing.name.toLowerCase() === part.name.toLowerCase()
                    )
                )
                .map(part => ({
                    name: part.name,
                    source: 'master' as const,
                    series: part.series,
                    image: part.image,
                    type: part.type
                }))

            newSuggestions.push(...existingMatches, ...masterMatches)
        }

        setSuggestions(newSuggestions.slice(0, 15)) // Limit to 15 suggestions
        setSelectedIndex(-1)
    }, [value, existingParts, showProducts])

    const handleSelect = (suggestion: Suggestion) => {
        if (suggestion.source === 'product' && suggestion.product) {
            // Check if it's a random booster
            if (suggestion.product.type === 'random_booster' && onRandomBoosterSelect) {
                // Handle random booster selection
                onRandomBoosterSelect(suggestion.product)
            } else if (onProductSelect) {
                // Handle regular product selection
                onProductSelect(suggestion.product)
            }
            setShowSuggestions(false)
            setSelectedIndex(-1)
        } else {
            // Handle regular part selection
            onChange(suggestion.name, {
                series: suggestion.series,
                type: suggestion.type
            })
            setShowSuggestions(false)
            setSelectedIndex(-1)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                )
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSelect(suggestions[selectedIndex])
                }
                break
            case 'Escape':
                setShowSuggestions(false)
                setSelectedIndex(-1)
                break
        }
    }

    // Handle clicking outside to close suggestions
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
                onChange={(e) => {
                    onChange(e.target.value)
                    setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${className}`}
                required={required}
                autoComplete="off"
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-80 overflow-y-auto"
                >
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={suggestion.product ? `${suggestion.source}-${suggestion.product.id}` : `${suggestion.source}-${suggestion.name}-${index}`}
                            type="button"
                            onClick={() => handleSelect(suggestion)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Part/Product Image */}
                                {suggestion.image && (
                                    <div className="w-10 h-10 relative flex-shrink-0">
                                        <Image
                                            src={suggestion.image}
                                            alt={suggestion.name}
                                            fill
                                            className="object-contain rounded"
                                            sizes="40px"
                                        />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 dark:text-white truncate">
                                            {suggestion.source === 'product' ?
                                                suggestion.product?.name :
                                                suggestion.name
                                            }
                                        </span>

                                        {/* Part Type Badge (for individual parts) */}
                                        {suggestion.source !== 'product' && suggestion.type && (
                                            <span className="text-xs px-2 py-1 rounded-full flex-shrink-0 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                                                {suggestion.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        )}

                                        {/* Source Badge */}
                                        <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${suggestion.source === 'existing'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : suggestion.source === 'product'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                            }`}>
                                            {suggestion.source === 'existing'
                                                ? 'Owned'
                                                : suggestion.source === 'product'
                                                    ? 'Product'
                                                    : 'Database'
                                            }
                                        </span>
                                    </div>

                                    {/* Series and Parts Info */}
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {suggestion.series && (
                                            <span>{suggestion.series}</span>
                                        )}
                                        {suggestion.source === 'product' && suggestion.product && (
                                            <div className="text-xs mt-1 text-gray-500 dark:text-gray-500">
                                                Parts: {suggestion.product.parts.map(p => p.name).join(' + ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
