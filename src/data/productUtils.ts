// Utility functions for searching and filtering products including random boosters
import type { MasterProduct } from './masterProducts'

// Get product by ID - this function should be called after MASTER_PRODUCTS is fully initialized
export function getProductById(products: MasterProduct[], id: string): MasterProduct | undefined {
    return products.find(product => product.id === id)
}

// Helper function to validate random booster structure
export function validateRandomBooster(randomBooster: MasterProduct): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = []

    if (randomBooster.type !== 'random_booster') {
        errors.push('Product type must be "random_booster"')
    }

    if (!randomBooster.possibleProducts || randomBooster.possibleProducts.length === 0) {
        errors.push('Random booster must have at least one possible product')
    }

    if (randomBooster.probabilities) {
        if (randomBooster.probabilities.length !== randomBooster.possibleProducts?.length) {
            errors.push('Number of probabilities must match number of possible products')
        }

        const totalProbability = randomBooster.probabilities.reduce((sum, prob) => sum + prob, 0)
        if (Math.abs(totalProbability - 100) > 0.01) {
            errors.push('Probabilities must add up to 100%')
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

// Example structure for creating a random booster (for documentation)
export const RANDOM_BOOSTER_EXAMPLE: MasterProduct = {
    id: 'takara-randombooster01',
    name: 'Random Booster Vol. 1',
    series: 'RB-01',
    manufacturer: 'Takara Tomy',
    parts: [], // Empty for random boosters since you get one of the possible products
    type: 'random_booster',
    image: '/images/products/rb01-random-booster.jpg',
    possibleProducts: [
        // You would add references to existing products here
        // Example:
        // getProductById('takara-bx01'), // Dran Sword 3-60F
        // getProductById('takara-bx02'), // Hells Scythe 4-60T
        // etc.
    ],
    probabilities: [
        // Optional: pull rates in percentages (must add up to 100)
        // 25, 25, 25, 25 // Equal chance for each
    ],
    notes: 'Random Booster containing 4 possible Beyblades'
}
