'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { MasterProduct } from '@/data/masterProducts'

interface RandomBoosterModalProps {
    isOpen: boolean
    onClose: () => void
    randomBooster: MasterProduct
    onProductSelect: (selectedProduct: MasterProduct) => void
}

export default function RandomBoosterModal({
    isOpen,
    onClose,
    randomBooster,
    onProductSelect
}: RandomBoosterModalProps) {
    const [selectedProduct, setSelectedProduct] = useState<MasterProduct | null>(null)
    const [isAdding, setIsAdding] = useState(false)

    if (!isOpen) return null

    const handleProductSelect = async (product: MasterProduct) => {
        setSelectedProduct(product)
        setIsAdding(true)

        try {
            await onProductSelect(product)
            setIsAdding(false)
            onClose()
        } catch (error) {
            console.error('Error adding random booster product:', error)
            setIsAdding(false)
        }
    }

    const possibleProducts = randomBooster.possibleProducts || []

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{randomBooster.name}</h2>
                            <p className="text-purple-100 mt-1">Which Beyblade did you get?</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                            disabled={isAdding}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {possibleProducts.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                                No possible products configured for this random booster.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {possibleProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${selectedProduct?.id === product.id
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                                        } ${isAdding ? 'pointer-events-none opacity-50' : ''}`}
                                    onClick={() => handleProductSelect(product)}
                                >
                                    {/* Product Image */}
                                    {product.image && (
                                        <div className="w-full h-32 relative mb-3 bg-gray-100 dark:bg-gray-700 rounded">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-contain rounded"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </div>
                                    )}

                                    {/* Product Info */}
                                    <div className="text-center">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                            {product.name}
                                        </h3>

                                        {/* Series Badge */}
                                        <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-1 rounded-full mb-2">
                                            {product.series}
                                        </span>

                                        {/* Parts List */}
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <p className="font-medium mb-1">Parts:</p>
                                            <ul className="space-y-1">
                                                {product.parts.map((part, partIndex) => (
                                                    <li key={partIndex} className="flex items-center justify-between">
                                                        <span>{part.name}</span>
                                                        <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">
                                                            {part.type.replace('_', ' ')}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Probability (if available) */}
                                        {randomBooster.probabilities && randomBooster.probabilities[index] && (
                                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                Pull Rate: {randomBooster.probabilities[index]}%
                                            </div>
                                        )}

                                        {/* Selection Indicator */}
                                        <div className="mt-3">
                                            {selectedProduct?.id === product.id && isAdding ? (
                                                <div className="flex items-center justify-center text-purple-600">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                                                    Adding...
                                                </div>
                                            ) : (
                                                <div className="text-purple-600 font-medium">
                                                    Click to add all parts
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Select the Beyblade you actually received from the random booster
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            disabled={isAdding}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
