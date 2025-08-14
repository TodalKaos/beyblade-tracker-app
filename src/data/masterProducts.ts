// Master database of known Beyblade X products for quick collection addition
import type { PartType } from '@/types/beyblade'

export interface ProductPart {
    name: string
    type: PartType
    quantity?: number // Default 1 if not specified
}

export interface MasterProduct {
    id: string
    name: string // "Buster Dran 1-60A"
    series: string // "G1536" or "BX-01"
    manufacturer: string // "Hasbro" or "Takara Tomy"
    parts: ProductPart[]
    image?: string
    notes?: string
    type?: 'standard' | 'random_booster' // New field to identify product type
    possibleProducts?: MasterProduct[] // For random boosters - array of possible Beyblades
    probabilities?: number[] // Optional: pull rates for each possible product
}

export const MASTER_PRODUCTS: MasterProduct[] = [

    // Takara Tomy BX Series
    {
        id: 'TT - BX-01',
        name: 'DranSword 3-60F',
        series: 'BX-01',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Dran Sword (Original)', type: 'blade' },
            { name: '3-60', type: 'ratchet' },
            { name: 'Flat', type: 'bit' }
        ],
        image: '/images/products/DranSword_3-60F.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-02',
        name: 'HellsScythe 4-60T',
        series: 'BX-02',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Hells Scythe', type: 'blade' },
            { name: '4-60', type: 'ratchet' },
            { name: 'Taper', type: 'bit' },

        ],
        image: '/images/products/HellsScythe_4-60T.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-03',
        name: 'WizardArrow 4-80B',
        series: 'BX-03',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Wizard Arrow', type: 'blade' },
            { name: '4-80', type: 'ratchet' },
            { name: 'Ball', type: 'bit' },

        ],
        image: '/images/products/WizardArrow_4-80B.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-04',
        name: 'KnightShield 3-80N',
        series: 'BX-04',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Knight Shield', type: 'blade' },
            { name: '3-80', type: 'ratchet' },
            { name: 'Needle', type: 'bit' },
        ],
        image: '/images/products/KnightShield_3-80N.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-05',
        name: 'WizardArrow 4-80B',
        series: 'BX-05',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Wizard Arrow (Red Ver.)', type: 'blade' },
            { name: '4-80', type: 'ratchet' },
            { name: 'Ball', type: 'bit' },
        ],
        image: '/images/products/WizardArrow_4-80BRed.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-06',
        name: 'KnightShield 3-80N',
        series: 'BX-06',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Knight Shield (Blue Ver.)', type: 'blade' },
            { name: '3-80', type: 'ratchet' },
            { name: 'Needle', type: 'bit' },
        ],
        image: '/images/products/KnightShield_3-80NBlue.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-07',
        name: 'Start Dash Set',
        series: 'BX-07',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Dran Sword (Special Ver.)', type: 'blade' },
            { name: '3-50', type: 'ratchet' },
            { name: 'Flat', type: 'bit' },
        ],
        image: '/images/products/StartDashSet.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-08',
        name: '3on3 Deck Set',
        series: 'BX-08',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Hells Scythe (Yellow Ver.)', type: 'blade' },
            { name: '3-80', type: 'ratchet' },
            { name: 'Ball', type: 'bit' },
            { name: 'Wizard Arrow (Green Ver.)', type: 'blade' },
            { name: '4-60', type: 'ratchet' },
            { name: 'Needle', type: 'bit' },
            { name: 'Knight Shield (Red Ver.)', type: 'blade' },
            { name: '4-80', type: 'ratchet' },
        ],
        image: '/images/products/3on3DeckSet.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-13',
        name: 'KnightLance 4-80HN',
        series: 'BX-13',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Knight Lance', type: 'blade' },
            { name: '4-80', type: 'ratchet' },
            { name: 'High Needle', type: 'bit' },
        ],
        image: '/images/products/KnightLance_4-80HN.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-14',
        name: 'Random Booster Vol. 1',
        series: 'BX - 14',
        manufacturer: 'Takara Tomy',
        parts: [],
        possibleProducts: [], // Will be populated by initializeRandomBoosters()
        probabilities: [], // Will be populated by initializeRandomBoosters()
        image: '/images/products/RandomBoosterVol1.jpg',
        type: 'random_booster',
    },
    {
        id: 'BX - 14 - 01',
        name: 'SharkEdge 3-60LF (Prize)',
        series: 'BX - 14 01',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Shark Edge', type: 'blade' },
            { name: '3-60', type: 'ratchet' },
            { name: 'Low Flat', type: 'bit' },
        ],
        image: '/images/products/SharkEdge_3-60LF.png',
        type: 'standard',
    },
    {
        id: 'BX - 14 - 02',
        name: 'SharkEdge 4-80N',
        series: 'BX - 14 02',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Shark Edge (Opaque Yellow Ver.)', type: 'blade' },
            { name: '4-80', type: 'ratchet' },
            { name: 'Needle', type: 'bit' },
        ],
        image: '/images/products/SharkEdge_4-80N.png',
        type: 'standard',
    },
    {
        id: 'BX - 14 - 03',
        name: 'DranSword 3-80B',
        series: 'BX - 14 03',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Dran Sword (Black Ver.)', type: 'blade' },
            { name: '3-80', type: 'ratchet' },
            { name: 'Ball', type: 'bit' },
        ],
        image: '/images/products/DranSword_3-80B.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 14 - 04',
        name: 'HellsScythe 4-80LF',
        series: 'BX - 14 04',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Hells Scythe (Green Ver.)', type: 'blade' },
            { name: '4-80', type: 'ratchet' },
            { name: 'Low Flat', type: 'bit' },
        ],
        image: '/images/products/HellsScythe_4-80LF.png',
        type: 'standard',
    },
    {
        id: 'BX - 14 - 05',
        name: 'KnightShield 4-60LF',
        series: 'BX - 14 05',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Knight Shield (Cyan Ver.)', type: 'blade' },
            { name: '4-60', type: 'ratchet' },
            { name: 'Low Flat', type: 'bit' },
        ],
        image: '/images/products/KnightShield_4-60LF.png',
        type: 'standard',
    },
    {
        id: 'BX - 14 - 06',
        name: 'WizardArrow 3-60T',
        series: 'BX - 14 06',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Wizard Arrow (Brown Ver.)', type: 'blade' },
            { name: '3-60', type: 'ratchet' },
            { name: 'Taper', type: 'bit' },
        ],
        image: '/images/products/WizardArrow_3-60T.png',
        type: 'standard',
    },
    {
        id: 'TT - BX-15',
        name: 'LeonClaw 5-60P',
        series: 'BX-15',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Leon Claw', type: 'blade' },
            { name: '5-60', type: 'ratchet' },
            { name: 'Point', type: 'bit' },
        ],
        image: '/images/products/LeonClaw_5-60P.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-16',
        name: 'Random Booster ViperTail Select',
        series: 'BX-16',
        manufacturer: 'Takara Tomy',
        parts: [],
        image: '/images/products/RandomBoosterViperTailSelect.jpg',
        type: 'random_booster',
    },
    {
        id: 'BX - 16 - 01',
        name: 'ViperTail 5-80O',
        series: 'BX - 16 01',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Viper Tail', type: 'blade' },
            { name: '5-80', type: 'ratchet' },
            { name: 'Orb', type: 'bit' },
        ],
        image: '/images/products/ViperTail_5-80O.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 16 - 02',
        name: 'ViperTail 4-60F',
        series: 'BX - 16 02',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Viper Tail (Black Ver.)', type: 'blade' },
            { name: '4-60', type: 'ratchet' },
            { name: 'Flat', type: 'bit' },
        ],
        image: '/images/products/ViperTail_4-60F.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 16 - 03',
        name: 'ViperTail 3-80HN',
        series: 'BX - 16 03',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Viper Tail (Yellow Ver.)', type: 'blade' },
            { name: '3-80', type: 'ratchet' },
            { name: 'High Needle', type: 'bit' },
        ],
        image: '/images/products/ViperTail_3-80HN.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-17',
        name: 'Battle Entry Set',
        series: 'BX - 17',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Dran Sword (Red Ver.)', type: 'blade' },
            { name: '3-60', type: 'ratchet' },
            { name: 'Flat', type: 'bit' },
            { name: 'Wizard Arrow (Blue Ver.)', type: 'blade' },
            { name: '4-80', type: 'ratchet' },
            { name: 'Ball', type: 'bit' },
        ],
        image: '/images/products/BattleEntrySet.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-19',
        name: 'RhinoHorn 3-80S',
        series: 'BX - 19',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Rhino Horn', type: 'blade' },
            { name: '3-80', type: 'ratchet' },
            { name: 'Spike', type: 'bit' },
        ],
        image: '/images/products/RhinoHorn_3-80S.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-20',
        name: 'Dran Dagger Deck Set',
        series: 'BX - 20',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Dran Dagger', type: 'blade' },
            { name: '4-60', type: 'ratchet' },
            { name: 'Rush', type: 'bit' },
            { name: 'Knight Shield (Purple Ver.)', type: 'blade' },
            { name: '5-80', type: 'ratchet' },
            { name: 'Taper', type: 'bit' },
            { name: 'Shark Edge (Green Ver.)', type: 'blade' },
            { name: '3-80', type: 'ratchet' },
            { name: 'Flat', type: 'bit' },
        ],
        image: '/images/products/DranDaggerDeckSet.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-21',
        name: 'Hells Chain Deck Set',
        series: 'BX - 21',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Hells Chain', type: 'blade' },
            { name: '5-60', type: 'ratchet' },
            { name: 'High Taper', type: 'bit' },
            { name: 'Knight Lance (Yellow Ver.)', type: 'blade' },
            { name: '3-60', type: 'ratchet' },
            { name: 'Low Flat', type: 'bit' },
            { name: 'Wizard Arrow (Orange Ver.)', type: 'blade' },
            { name: '4-80', type: 'ratchet' },
            { name: 'Needle', type: 'bit' },
        ],
        image: '/images/products/HellsChainDeckSet.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-22',
        name: 'Dran Sword Entry Package',
        series: 'BX - 22',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Dran Sword', type: 'blade' },
            { name: '3-60', type: 'ratchet' },
            { name: 'Flat', type: 'bit' }
        ],
        image: '/images/products/DranSwordEntryPackage.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-23',
        name: 'Phoenix Wing 9-60GF',
        series: 'BX-23',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Phoenix Wing', type: 'blade' },
            { name: '9-60', type: 'ratchet' },
            { name: 'Gear Flat', type: 'bit' }
        ],
        image: '/images/products/PhoenixWing_9-60GF.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-24',
        name: 'Random Booster Vol. 2',
        series: 'BX - 24',
        manufacturer: 'Takara Tomy',
        parts: [],
        possibleProducts: [],
        image: '/images/products/RandomBoosterVol2.jpg',
        type: 'random_booster',
    },
    {
        id: 'BX - 24 - 01',
        name: 'WyvernGale 5-80GB',
        series: 'BX - 24 01',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Wyvern Gale', type: 'blade' },
            { name: '5-80', type: 'ratchet' },
            { name: 'Gear Ball', type: 'bit' }
        ],
        image: '/images/products/WyvernGale_5-80GB.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 24 - 02',
        name: 'WyvernGale 3-60T',
        series: 'BX - 24 02',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Wyvern Gale (Yellow Ver.)', type: 'blade' },
            { name: '3-60', type: 'ratchet' },
            { name: 'Taper', type: 'bit' }
        ],
        image: '/images/products/WyvernGale_3-60T.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 24 - 03',
        name: 'KnightLance 4-60GB',
        series: 'BX - 24 03',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Knight Lance (Black Ver.)', type: 'blade' },
            { name: '4-60', type: 'ratchet' },
            { name: 'Gear Ball', type: 'bit' }
        ],
        image: '/images/products/KnightLance_4-60GB.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 24 - 04',
        name: 'ViperTail 5-60F',
        series: 'BX - 24 04',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Viper Tail (Blue Ver.)', type: 'blade' },
            { name: '5-60', type: 'ratchet' },
            { name: 'Flat', type: 'bit' }
        ],
        image: '/images/products/ViperTail_5-60F.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 24 - 05',
        name: 'LeonClaw 3-80HN',
        series: 'BX - 24 05',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Leon Claw (Red Ver.)', type: 'blade' },
            { name: '3-80', type: 'ratchet' },
            { name: 'High Needle', type: 'bit' }
        ],
        image: '/images/products/LeonClaw_3-80HN.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 24 - 06',
        name: 'Wizard Arrow 4-80GB',
        series: 'BX - 24 06',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Wizard Arrow (Purple Ver.)', type: 'blade' },
            { name: '4-80', type: 'ratchet' },
            { name: 'Gear Ball', type: 'bit' }
        ],
        image: '/images/products/WizardArrow_4-80GB.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-26',
        name: 'UnicornSting 5-60GP',
        series: 'BX - 26',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Unicorn Sting', type: 'blade' },
            { name: '5-60', type: 'ratchet' },
            { name: 'Gear Point', type: 'bit' }
        ],
        image: '/images/products/UnicornSting_5-60GP.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-27',
        name: 'Random Booster SphinxCowl Select',
        series: 'BX - 27',
        manufacturer: 'Takara Tomy',
        parts: [],
        image: '/images/products/RandomBoosterSphinxCowlSelect.jpg',
        type: 'random_booster',
    },
    {
        id: 'BX - 27 - 01',
        name: 'SphinxCowl 9-80GN',
        series: 'BX - 27 01',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Sphinx Cowl', type: 'blade' },
            { name: '9-80', type: 'ratchet' },
            { name: 'Gear Needle', type: 'bit' }
        ],
        image: '/images/products/SphinxCowl_9-80GN.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 27 - 02',
        name: 'SphinxCowl 4-80HT',
        series: 'BX - 27 02',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Sphinx Cowl (Black Ver.)', type: 'blade' },
            { name: '4-80', type: 'ratchet' },
            { name: 'High Taper', type: 'bit' }
        ],
        image: '/images/products/SphinxCowl_4-80HT.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 27 - 03',
        name: 'SphinxCowl 5-60O',
        series: 'BX - 27 03',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Sphinx Cowl (White Ver.)', type: 'blade' },
            { name: '5-60', type: 'ratchet' },
            { name: 'Orb', type: 'bit' }
        ],
        image: '/images/products/SphinxCowl_5-60O.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-31',
        name: 'Random Booster Vol. 3',
        series: 'BX - 31',
        manufacturer: 'Takara Tomy',
        parts: [],
        possibleProducts: [], // Will be populated by initializeRandomBoosters()
        probabilities: [], // Will be populated by initializeRandomBoosters()
        image: '/images/products/RandomBoosterVol3.jpg',
        type: 'random_booster',
    },
    {
        id: 'BX - 31 - 01',
        name: 'TyrannoBeat 4-70Q',
        series: 'BX - 31 01',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Tyranno Beat', type: 'blade' },
            { name: '4-70', type: 'ratchet' },
            { name: 'Quake', type: 'bit' }
        ],
        image: '/images/products/TyrannoBeat_4-70Q.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 31 - 02',
        name: 'TyrannoBeat 3-60S',
        series: 'BX - 31 02',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Tyranno Beat (Green Ver.)', type: 'blade' },
            { name: '3-60', type: 'ratchet' },
            { name: 'Spike', type: 'bit' }
        ],
        image: '/images/products/TyrannoBeat_3-60S.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 31 - 03',
        name: 'HellsChain 9-80O',
        series: 'BX - 31 03',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Hells Chain (Blue Ver.)', type: 'blade' },
            { name: '9-80', type: 'ratchet' },
            { name: 'Orb', type: 'bit' }
        ],
        image: '/images/products/HellsChain_9-80O.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 31 - 04',
        name: 'DranDagger 4-70P',
        series: 'BX - 31 04',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Dran Dagger (Orange Ver.)', type: 'blade' },
            { name: '4-70', type: 'ratchet' },
            { name: 'Point', type: 'bit' }
        ],
        image: '/images/products/DranDagger_4-70P.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 31 - 05',
        name: 'SharkEdge 1-60Q',
        series: 'BX - 31 05',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Shark Edge (Black Ver.)', type: 'blade' },
            { name: '1-60', type: 'ratchet' },
            { name: 'Quake', type: 'bit' }
        ],
        image: '/images/products/SharkEdge_1-60Q.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 31 - 06',
        name: 'RhinoHorn 5-80Q',
        series: 'BX - 31 06',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Rhino Horn (Purple Ver.)', type: 'blade' },
            { name: '5-80', type: 'ratchet' },
            { name: 'Quake', type: 'bit' }
        ],
        image: '/images/products/RhinoHorn_5-80Q.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-33',
        name: 'WeissTiger 3-60U',
        series: 'BX - 33',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Weiss Tiger', type: 'blade' },
            { name: '3-60', type: 'ratchet' },
            { name: 'Unite', type: 'bit' }
        ],
        possibleProducts: [], // Will be populated by initializeRandomBoosters()
        probabilities: [], // Will be populated by initializeRandomBoosters()
        image: '/images/products/WeissTiger_3-60U.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-34',
        name: 'CobaltDragoon 2-60C',
        series: 'BX - 34',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Cobalt Dragoon', type: 'blade' },
            { name: '2-60', type: 'ratchet' },
            { name: 'Cyclone', type: 'bit' }
        ],
        possibleProducts: [], // Will be populated by initializeRandomBoosters()
        probabilities: [], // Will be populated by initializeRandomBoosters()
        image: '/images/products/CobaltDragoon_2-60C.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-35',
        name: 'Random Booster Vol. 4',
        series: 'BX - 35',
        manufacturer: 'Takara Tomy',
        parts: [],
        possibleProducts: [], // Will be populated by initializeRandomBoosters()
        probabilities: [], // Will be populated by initializeRandomBoosters()
        image: '/images/products/RandomBoosterVol4.jpg',
        type: 'random_booster',
    },
    {
        id: 'BX - 35 - 01',
        name: 'BlackShell 4-60D',
        series: 'BX-35 01',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Black Shell', type: 'blade' },
            { name: '4-60', type: 'ratchet' },
            { name: 'Dot', type: 'bit' }
        ],
        image: '/images/products/BlackShell_4-60D.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 35 - 02',
        name: 'BlackShell 9-80B',
        series: 'BX-35 02',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Black Shell (Yellow Ver.)', type: 'blade' },
            { name: '9-80', type: 'ratchet' },
            { name: 'Ball', type: 'bit' }
        ],
        image: '/images/products/BlackShell_9-80B.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 35 - 03',
        name: 'UnicornSting 3-70D',
        series: 'BX-35 03',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Unicorn Sting (Red Ver.)', type: 'blade' },
            { name: '3-70', type: 'ratchet' },
            { name: 'Dot', type: 'bit' }
        ],
        image: '/images/products/UnicornSting_3-70D.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 35 - 04',
        name: 'WizardRod 1-60R',
        series: 'BX-35 04',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Wizard Rod (Green Ver.)', type: 'blade' },
            { name: '1-60', type: 'ratchet' },
            { name: 'Rush', type: 'bit' }
        ],
        image: '/images/products/WizardRod_1-60R.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 35 - 05',
        name: 'PhoenixWing 5-80H',
        series: 'BX-35 05',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Phoenix Wing (Blue Ver.)', type: 'blade' },
            { name: '5-80', type: 'ratchet' },
            { name: 'Hexa', type: 'bit' }
        ],
        image: '/images/products/PhoenixWing_5-80H.jpg',
        type: 'standard',
    },
    {
        id: 'BX - 35 - 06',
        name: 'ViperTail 5-70D',
        series: 'BX-35 06',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Viper Tail (Purple Ver.)', type: 'blade' },
            { name: '5-70', type: 'ratchet' },
            { name: 'Dot', type: 'bit' }
        ],
        image: '/images/products/ViperTail_5-70D.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-36',
        name: 'Random Booster WhaleWave Select',
        series: 'BX - 36',
        manufacturer: 'Takara Tomy',
        parts: [],
        possibleProducts: [], // Will be populated by initializeRandomBoosters()
        probabilities: [], // Will be populated by initializeRandomBoosters()
        image: '/images/products/RandomBoosterWhaleWaveSelect.jpg',
        type: 'random_booster',
    },
    {
        id: 'BX - 36 -01',
        name: 'WhaleWave 5-80E',
        series: 'BX-36 01',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Whale Wave', type: 'blade' },
            { name: '5-80', type: 'ratchet' },
            { name: 'Elevate', type: 'bit' }
        ],
        image: '/images/products/WhaleWave_5-80E.png',
        type: 'standard',
    },
    {
        id: 'BX - 36 -02',
        name: 'WhaleWave 4-70HN',
        series: 'BX-36 02',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Whale Wave (Black Ver.)', type: 'blade' },
            { name: '4-70', type: 'ratchet' },
            { name: 'High Needle', type: 'bit' }
        ],
        image: '/images/products/WhaleWave_4-70HN.png',
        type: 'standard',
    },
    {
        id: 'BX - 36 -03',
        name: 'WhaleWave 3-80GB',
        series: 'BX-36 03',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Whale Wave (White Ver.)', type: 'blade' },
            { name: '3-80', type: 'ratchet' },
            { name: 'Gear Ball', type: 'bit' }
        ],
        image: '/images/products/WhaleWave_3-80GB.png',
        type: 'standard',
    },
    {
        id: 'TT - BX-37',
        name: 'Double Xtreme Stadium Set',
        series: 'BX - 37',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Savage Bear', type: 'blade' },
            { name: '5-60', type: 'ratchet' },
            { name: 'Flat', type: 'bit' },
        ],
        possibleProducts: [], // Will be populated by initializeRandomBoosters()
        probabilities: [], // Will be populated by initializeRandomBoosters()
        image: '/images/products/DoubleXtremeStadiumSet.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-38',
        name: 'CrimsonGaruda 4-70TP',
        series: 'BX-38',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Crimson Garuda', type: 'blade' },
            { name: '4-70', type: 'ratchet' },
            { name: 'Trans Point', type: 'bit' },
        ],
        image: '/images/products/CrimsonGaruda_4-70TP.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-39',
        name: 'Random Booster ShelterDrake Select',
        series: 'BX-39',
        manufacturer: 'Takara Tomy',
        parts: [],
        possibleProducts: [], // Will be populated by initializeRandomBoosters()
        probabilities: [], // Will be populated by initializeRandomBoosters()
        image: '/images/products/RandomBoosterShelterDrakeSelect.jpg',
        type: 'random_booster',
    },
    {
        id: 'BX - 39 - 01',
        name: 'ShelterDrake 7-80GP',
        series: 'BX-39 01',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Shelter Drake', type: 'blade' },
            { name: '7-80', type: 'ratchet' },
            { name: 'Gear Point', type: 'bit' },
        ],
        image: '/images/products/ShelterDrake_7-80GP.png',
        type: 'standard',
    },
    {
        id: 'BX - 39 - 02',
        name: 'ShelterDrake 5-70O',
        series: 'BX-39 02',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Shelter Drake (Yellow Ver.)', type: 'blade' },
            { name: '5-70', type: 'ratchet' },
            { name: 'Orb', type: 'bit' },
        ],
        image: '/images/products/ShelterDrake_5-70O.png',
        type: 'standard',
    },
    {
        id: 'BX - 39 - 03',
        name: 'ShelterDrake 3-60D',
        series: 'BX-39 03',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Shelter Drake (Green Ver.)', type: 'blade' },
            { name: '3-60', type: 'ratchet' },
            { name: 'Dot', type: 'bit' },
        ],
        image: '/images/products/ShelterDrake_3-60D.png',
        type: 'standard',
    },
    {
        id: 'TT - BX-44',
        name: 'TriceraPress M-85BS',
        series: 'BX-44',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Tricera Press', type: 'blade' },
            { name: 'M-85', type: 'ratchet' },
            { name: 'Bound Spike', type: 'bit' },
        ],
        image: '/images/products/TriceraPress_M-85BS.jpg',
        type: 'standard',
    },
    {
        id: 'TT - BX-45',
        name: 'SamuraiCalibur 6-70M',
        series: 'BX-45',
        manufacturer: 'Takara Tomy',
        parts: [
            { name: 'Samurai Calibur', type: 'blade' },
            { name: '6-70', type: 'ratchet' },
            { name: 'Merge', type: 'bit' },
        ],
        image: '/images/products/SamuraiCalibur_6-70M.jpg',
        type: 'standard',
    },


    // Takara Tomy UX Series


    // Takara Tomy CX Series (with Assist Blades and Lock Chips)


    // Hasbro Products
]

// Helper function to get product by ID after MASTER_PRODUCTS is initialized
export function getProductById(id: string): MasterProduct | undefined {
    return MASTER_PRODUCTS.find(product => product.id === id)
}

// Function to search products by name, blade, or series
export function searchMasterProducts(query: string): MasterProduct[] {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return []

    const results = MASTER_PRODUCTS
        .filter(product => {
            const productName = product.name.toLowerCase()
            const series = product.series.toLowerCase()
            const primaryBlade = product.parts.find(p => p.type === 'blade')?.name.toLowerCase() || ''

            // Multiple search strategies
            const matchesName = productName.includes(searchTerm)
            const matchesSeries = series.includes(searchTerm)
            const matchesBlade = primaryBlade.includes(searchTerm)
            const matchesManufacturer = product.manufacturer.toLowerCase().includes(searchTerm)

            return matchesName || matchesSeries || matchesBlade || matchesManufacturer
        })
        .sort((a, b) => {
            // Prioritize exact name matches, then blade matches
            const aName = a.name.toLowerCase()
            const bName = b.name.toLowerCase()
            const aBlade = a.parts.find(p => p.type === 'blade')?.name.toLowerCase() || ''
            const bBlade = b.parts.find(p => p.type === 'blade')?.name.toLowerCase() || ''

            const aNameMatch = aName.startsWith(searchTerm)
            const bNameMatch = bName.startsWith(searchTerm)
            const aBladeMatch = aBlade.startsWith(searchTerm)
            const bBladeMatch = bBlade.startsWith(searchTerm)

            if (aNameMatch && !bNameMatch) return -1
            if (!aNameMatch && bNameMatch) return 1
            if (aBladeMatch && !bBladeMatch) return -1
            if (!aBladeMatch && bBladeMatch) return 1

            return aName.localeCompare(bName)
        })
        .slice(0, 10) // Limit to 10 results

    return results
}

// Initialize random booster possible products after MASTER_PRODUCTS is fully defined
// This prevents circular dependency issues
export function initializeRandomBoosters() {

    // Random Booster Vol. 1 (BX-14)
    const randomBooster1 = MASTER_PRODUCTS.find(product => product.id === 'TT - BX-14')
    if (randomBooster1 && randomBooster1.type === 'random_booster') {
        randomBooster1.possibleProducts = [
            getProductById('BX - 14 - 01'), // SharkEdge 3-60LF (Prize)
            getProductById('BX - 14 - 02'), // SharkEdge 4-80N
            getProductById('BX - 14 - 03'), // DranSword 3-80B
            getProductById('BX - 14 - 04'), // HellsScythe 4-80LF
            getProductById('BX - 14 - 05'), // KnightShield 4-60LF
            getProductById('BX - 14 - 06'), // WizardArrow 3-60T
            // Add more BX-14 specific products here
        ].filter(Boolean) as MasterProduct[]
    }

    // Random Booster Viper Tail Select (BX-16)
    const randomBooster2 = MASTER_PRODUCTS.find(product => product.id === 'TT - BX-16')
    if (randomBooster2 && randomBooster2.type === 'random_booster') {
        randomBooster2.possibleProducts = [
            getProductById('BX - 16 - 01'), // Viper Tail
            getProductById('BX - 16 - 02'), // Viper Tail (Black Ver.)
            getProductById('BX - 16 - 03'), // Viper Tail (Yellow Ver.)
        ].filter(Boolean) as MasterProduct[]
    }

    // Random Booster Vol. 2 (BX-24)
    const randomBooster3 = MASTER_PRODUCTS.find(product => product.id === 'TT - BX-24')
    if (randomBooster3 && randomBooster3.type === 'random_booster') {
        randomBooster3.possibleProducts = [
            getProductById('BX - 24 - 01'), // Wyvern Gale
            getProductById('BX - 24 - 02'), // Wyvern Gale (Yellow Ver.)
            getProductById('BX - 24 - 03'), // Knight Lance (Black Ver.)
            getProductById('BX - 24 - 04'), // Viper Tail (Blue Ver.)
            getProductById('BX - 24 - 05'), // Leon Claw (Red Ver.)
            getProductById('BX - 24 - 06'), // Wizard Arrow (Purple Ver.)
        ].filter(Boolean) as MasterProduct[]
    }

    // Random Booster Sphinx Cowl Select
    const randomBooster4 = MASTER_PRODUCTS.find(product => product.id === 'TT - BX-27')
    if (randomBooster4 && randomBooster4.type === 'random_booster') {
        randomBooster4.possibleProducts = [
            getProductById('BX - 27 - 01'), // SphinxCowl 9-80GN
            getProductById('BX - 27 - 02'), // SphinxCowl 4-80HT
            getProductById('BX - 27 - 03'), // SphinxCowl 5-60O
        ].filter(Boolean) as MasterProduct[]
    }

    // Random Booster Vol. 3 (BX-31)
    const randomBooster5 = MASTER_PRODUCTS.find(product => product.id === 'TT - BX-31')
    if (randomBooster5 && randomBooster5.type === 'random_booster') {
        randomBooster5.possibleProducts = [
            getProductById('BX - 31 - 01'), // Tyranno Beat
            getProductById('BX - 31 - 02'), // Tyranno Beat (Green Ver.)
            getProductById('BX - 31 - 03'), // Hells Chain (Blue Ver.)
            getProductById('BX - 31 - 04'), // Dran Dagger (Orange Ver.)
            getProductById('BX - 31 - 05'), // Shark Edge (Black Ver.)
            getProductById('BX - 31 - 06'), // Rhino Horn (Purple Ver.)
        ].filter(Boolean) as MasterProduct[]
    }

    // Random Booster Vol. 4 (BX-35)
    const randomBooster6 = MASTER_PRODUCTS.find(product => product.id === 'TT - BX-35')
    if (randomBooster6 && randomBooster6.type === 'random_booster') {
        randomBooster6.possibleProducts = [
            getProductById('BX - 35 - 01'), // BlackShell
            getProductById('BX - 35 - 02'), // BlackShell (Yellow Ver.)
            getProductById('BX - 35 - 03'), // UnicornSting (Red Ver.)
            getProductById('BX - 35 - 04'), // WizardRod (Green Ver.)
            getProductById('BX - 35 - 05'), // PhoenixWing (Blue Ver.)
            getProductById('BX - 35 - 06'), // ViperTail (Purple Ver.)
        ].filter(Boolean) as MasterProduct[]
    }

    // Random Booster Whale Wave Select
    const randomBooster7 = MASTER_PRODUCTS.find(product => product.id === 'TT - BX-36')
    if (randomBooster7 && randomBooster7.type === 'random_booster') {
        randomBooster7.possibleProducts = [
            getProductById('BX - 36 - 01'), // Whale Wave
            getProductById('BX - 36 - 02'), // Whale Wave (Black Ver.)
            getProductById('BX - 36 - 03'), // Whale Wave (White Ver.)
        ].filter(Boolean) as MasterProduct[]
    }

    // Random Booster Shelter Drake Select
    const randomBooster8 = MASTER_PRODUCTS.find(product => product.id === 'TT - BX-39')
    if (randomBooster8 && randomBooster8.type === 'random_booster') {
        randomBooster8.possibleProducts = [
            getProductById('BX - 39 - 01'), // ShelterDrake 7-80GP
            getProductById('BX - 39 - 02'), // ShelterDrake 5-70O
            getProductById('BX - 39 - 03'), // ShelterDrake 3-60D
        ].filter(Boolean) as MasterProduct[]
    }
}

// Call the initialization function
initializeRandomBoosters()
