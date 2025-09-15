// Master database of known Beyblade X parts for autocomplete suggestions
import type { PartType } from '@/types/beyblade'
import { searchMasterProducts, type MasterProduct } from './masterProducts'

export interface MasterPart {
    name: string
    type: PartType
    series?: string
    color?: string // Color variant of the part
    image?: string // Path to the part image
    notes?: string // Custom notes about the part
    stats?: {
        attack: number      // 0-100 scale
        defense: number     // 0-100 scale  
        stamina: number     // 0-100 scale
        weight: number      // in grams
        burstResistance: number // 0-100 scale
    }
}

export const MASTER_PARTS: MasterPart[] = [
    // BX Series Blades
    {
        name: 'Dran Sword (Original)',
        type: 'blade',
        series: 'BX-01/22',
        color: 'Blue',
        image: '/images/parts/blades/DranSword.png',
        stats: { attack: 55, defense: 25, stamina: 20, weight: 35.1, burstResistance: 0 }
    },
    {
        name: 'Dran Sword (Katsushika City Ver.)',
        type: 'blade',
        series: 'BX-01',
        color: 'Blue',
        image: '/images/parts/blades/DranSwordKatsushika.jpg',
        stats: { attack: 55, defense: 25, stamina: 20, weight: 35.1, burstResistance: 0 },
        notes: 'Reprint of BX-01 with two optional "Katsushika City" collaboration Gear Chip stickers.',
    },
    {
        name: 'Dran Sword (Special Ver.)',
        type: 'blade',
        series: 'BX-07',
        color: 'Opaque Blue',
        image: '/images/parts/blades/DranSwordSpecial.png',
        stats: { attack: 55, defense: 25, stamina: 20, weight: 35.1, burstResistance: 0 },
    },
    {
        name: 'Dran Sword (Black Ver.)',
        type: 'blade',
        series: 'BX-14',
        color: 'Black',
        image: '/images/parts/blades/DranSwordBlack.png',
        stats: { attack: 55, defense: 25, stamina: 20, weight: 35.1, burstResistance: 0 },
    },
    {
        name: 'Dran Sword (Red Ver.)',
        type: 'blade',
        series: 'BX-17/G0197',
        color: 'Red',
        image: '/images/parts/blades/DranSwordRed.png',
        stats: { attack: 55, defense: 25, stamina: 20, weight: 35.1, burstResistance: 0 },
    },
    {
        name: 'Dran Sword (Metal Coat: Bronze G1 Prize)',
        type: 'blade',
        series: 'BX-00',
        color: 'Bronze',
        image: '/images/parts/blades/DranSwordBronze.png',
        stats: { attack: 55, defense: 25, stamina: 20, weight: 35.1, burstResistance: 0 }
    },
    {
        name: 'Dran Sword (Metal Coat: Silver G1 Prize)',
        type: 'blade',
        series: 'BX-00',
        color: 'Silver',
        image: '/images/parts/blades/DranSwordSilver.png',
        stats: { attack: 55, defense: 25, stamina: 20, weight: 35.1, burstResistance: 0 }
    },
    {
        name: 'Dran Sword (Metal Coat: Gold G1 Prize)',
        type: 'blade',
        series: 'BX-00',
        color: 'Gold',
        image: '/images/parts/blades/DranSwordGold.png',
        stats: { attack: 55, defense: 25, stamina: 20, weight: 35.1, burstResistance: 0 }
    },
    {
        name: 'Dran Sword (Sushiro Ver.)',
        type: 'blade',
        series: 'BX-00',
        color: 'White/Red',
        image: '/images/parts/blades/DranSwordSushiro.png',
        stats: { attack: 55, defense: 25, stamina: 20, weight: 35.1, burstResistance: 0 }
    },
    {
        name: 'Dran Sword (Metal Coat: Blue CoroCoro Exclusive)',
        type: 'blade',
        series: 'BX-00',
        color: 'Blue',
        image: '/images/parts/blades/DranSwordCoro.jpg',
        stats: { attack: 55, defense: 25, stamina: 20, weight: 35.1, burstResistance: 0 }
    },
    {
        name: 'Dran Sword (Metal Coat: White)',
        type: 'blade',
        series: 'BX-00',
        color: 'White',
        image: '/images/parts/blades/DranSwordWhite.png',
        stats: { attack: 55, defense: 25, stamina: 20, weight: 35.1, burstResistance: 0 }
    },
    {
        name: 'Dran Sword (Holo Sticker Ver.)',
        type: 'blade',
        series: 'BX-00',
        color: 'Holo',
        image: '/images/parts/blades/DranSwordHolo.jpg',
        stats: { attack: 55, defense: 25, stamina: 20, weight: 35.1, burstResistance: 0 },
        notes: 'Released in Beyblade 25th Anniversary Set.',
    },
    {
        name: 'Hells Scythe',
        type: 'blade',
        series: 'BX-02',
        color: 'Red',
        image: '/images/parts/blades/HellsScythe.png',
        stats: { attack: 30, defense: 35, stamina: 35, weight: 33.0, burstResistance: 0 }
    },
    {
        name: 'Hells Scythe (Yellow Ver.)',
        type: 'blade',
        series: 'BX-08',
        color: 'Yellow',
        image: '/images/parts/blades/HellsScytheYellow.jpg',
        stats: { attack: 30, defense: 35, stamina: 35, weight: 33.0, burstResistance: 0 }
    },
    {
        name: 'Hells Scythe (Green Ver.)',
        type: 'blade',
        series: 'BX-14',
        color: 'Green',
        image: '/images/parts/blades/HellsScytheGreen.png',
        stats: { attack: 30, defense: 35, stamina: 35, weight: 33.0, burstResistance: 0 }
    },
    {
        name: 'Hells Scythe (Metal Coat: Gold)',
        type: 'blade',
        series: 'BX-00',
        color: 'Gold',
        image: '/images/parts/blades/HellsScytheGold.jpg',
        stats: { attack: 30, defense: 35, stamina: 35, weight: 33.0, burstResistance: 0 }
    },
    {
        name: 'Hells Scythe (SP X Bey)',
        type: 'blade',
        series: 'BX-00',
        color: 'Blue',
        image: '/images/parts/blades/HellsScytheSPX.png',
        stats: { attack: 30, defense: 35, stamina: 35, weight: 33.0, burstResistance: 0 }
    },
    {
        name: 'Wizard Arrow',
        type: 'blade',
        series: 'BX-03',
        color: 'Yellow',
        image: '/images/parts/blades/WizardArrow.jpg',
        stats: { attack: 15, defense: 30, stamina: 55, weight: 31.8, burstResistance: 0 }
    },
    {
        name: 'Wizard Arrow (Red Ver.)',
        type: 'blade',
        series: 'BX-05',
        color: 'Red',
        image: '/images/parts/blades/WizardArrowRed.png',
        stats: { attack: 15, defense: 30, stamina: 55, weight: 31.8, burstResistance: 0 }
    },
    {
        name: 'Wizard Arrow (Green Ver.)',
        type: 'blade',
        series: 'BX-08',
        color: 'Green',
        image: '/images/parts/blades/WizardArrowGreen.png',
        stats: { attack: 15, defense: 30, stamina: 55, weight: 31.8, burstResistance: 0 }
    },
    {
        name: 'Wizard Arrow (Brown Ver.)',
        type: 'blade',
        series: 'BX-14',
        color: 'Brown',
        image: '/images/parts/blades/WizardArrowBrown.png',
        stats: { attack: 15, defense: 30, stamina: 55, weight: 31.8, burstResistance: 0 }
    },
    {
        name: 'Wizard Arrow (Blue Ver.)',
        type: 'blade',
        series: 'BX-17',
        color: 'Blue',
        image: '/images/parts/blades/WizardArrowBlue.png',
        stats: { attack: 15, defense: 30, stamina: 55, weight: 31.8, burstResistance: 0 }
    },
    {
        name: 'Wizard Arrow (Orange Ver.)',
        type: 'blade',
        series: 'BX-21',
        color: 'Orange',
        image: '/images/parts/blades/WizardArrowOrange.png',
        stats: { attack: 15, defense: 30, stamina: 55, weight: 31.8, burstResistance: 0 }
    },
    {
        name: 'Wizard Arrow (Purple Ver.)',
        type: 'blade',
        series: 'BX-24 06',
        color: 'Purple',
        image: '/images/parts/blades/WizardArrowPurple.jpg',
        stats: { attack: 15, defense: 30, stamina: 55, weight: 31.8, burstResistance: 0 }
    },
    {
        name: 'Knight Shield',
        type: 'blade',
        series: 'BX-04',
        color: 'Green',
        image: '/images/parts/blades/KnightShield.jpg',
        stats: { attack: 20, defense: 55, stamina: 25, weight: 34.8, burstResistance: 0 }
    },
    {
        name: 'Knight Shield (Blue Ver.)',
        type: 'blade',
        series: 'BX-06',
        color: 'Blue',
        image: '/images/parts/blades/KnightShieldBlue.png',
        stats: { attack: 20, defense: 55, stamina: 25, weight: 34.8, burstResistance: 0 }
    },
    {
        name: 'Knight Shield (Red Ver.)',
        type: 'blade',
        series: 'BX-08',
        color: 'Red',
        image: '/images/parts/blades/KnightShieldRed.png',
        stats: { attack: 20, defense: 55, stamina: 25, weight: 34.8, burstResistance: 0 }
    },
    {
        name: 'Knight Shield (Cyan Ver.)',
        type: 'blade',
        series: 'BX-14',
        color: 'Cyan',
        image: '/images/parts/blades/KnightShieldCyan.png',
        stats: { attack: 20, defense: 55, stamina: 25, weight: 34.8, burstResistance: 0 }
    },
    {
        name: 'Knight Shield (Purple Ver.)',
        type: 'blade',
        series: 'BX-20',
        color: 'Purple',
        image: '/images/parts/blades/KnightShieldPurple.png',
        stats: { attack: 20, defense: 55, stamina: 25, weight: 34.8, burstResistance: 0 }
    },
    {
        name: 'Knight Shield (Metal Coat: Gold - G3 Tournament Prize)',
        type: 'blade',
        series: 'BX-00',
        color: 'Gold',
        image: '/images/parts/blades/KnightShieldGold.png',
        stats: { attack: 20, defense: 55, stamina: 25, weight: 34.8, burstResistance: 0 }
    },
    {
        name: 'Knight Lance',
        type: 'blade',
        series: 'BX-13',
        color: 'Green',
        image: '/images/parts/blades/KnightLance.jpg',
        stats: { attack: 25, defense: 60, stamina: 15, weight: 32.9, burstResistance: 0 }
    },
    {
        name: 'Knight Lance (Yellow Ver.)',
        type: 'blade',
        series: 'BX-21',
        color: 'Yellow',
        image: '/images/parts/blades/KnightLanceYellow.png',
        stats: { attack: 25, defense: 60, stamina: 15, weight: 32.9, burstResistance: 0 }
    },
    {
        name: 'Knight Lance (Black Ver.)',
        type: 'blade',
        series: 'BX-24 03',
        color: 'Black',
        image: '/images/parts/blades/KnightLanceBlack.jpg',
        stats: { attack: 25, defense: 60, stamina: 15, weight: 32.9, burstResistance: 0 }
    },
    {
        name: 'Shark Edge',
        type: 'blade',
        series: 'BX-14',
        image: '/images/parts/blades/SharkEdge.png',
        stats: { attack: 60, defense: 25, stamina: 15, weight: 34.5, burstResistance: 0 }
    },
    {
        name: 'Shark Edge (Opaque Yellow Ver.)',
        type: 'blade',
        series: 'BX-14 02',
        color: 'Yellow',
        image: '/images/parts/blades/SharkEdgeYellow.png',
        stats: { attack: 60, defense: 25, stamina: 15, weight: 34.5, burstResistance: 0 }
    },
    {
        name: 'Shark Edge (Green Ver.)',
        type: 'blade',
        series: 'BX-20',
        color: 'Green',
        image: '/images/parts/blades/SharkEdgeGreen.png',
        stats: { attack: 60, defense: 25, stamina: 15, weight: 34.5, burstResistance: 0 }
    },
    {
        name: 'Shark Edge (Black Ver.)',
        type: 'blade',
        series: 'BX-31 05',
        color: 'Black',
        image: '/images/parts/blades/SharkEdgeBlack.jpg',
        stats: { attack: 60, defense: 25, stamina: 15, weight: 34.5, burstResistance: 0 }
    },
    {
        name: 'Shark Edge (Metal Coat: Blue)',
        type: 'blade',
        series: 'BX-00',
        color: 'Blue',
        image: '/images/parts/blades/SharkEdgeBlue.jpg',
        stats: { attack: 60, defense: 25, stamina: 15, weight: 34.5, burstResistance: 0 }
    },
    {
        name: 'Leon Claw',
        type: 'blade',
        series: 'BX-15',
        image: '/images/parts/blades/LeonClaw.jpg',
        stats: { attack: 40, defense: 40, stamina: 20, weight: 31.4, burstResistance: 0 }
    },
    {
        name: 'Leon Claw (Red Ver.)',
        type: 'blade',
        series: 'BX-24 05',
        color: 'Red',
        image: '/images/parts/blades/LeonClawRed.jpg',
        stats: { attack: 40, defense: 40, stamina: 20, weight: 31.4, burstResistance: 0 }
    },
    {
        name: 'Leon Claw (Metal Coat: Gold)',
        type: 'blade',
        series: 'BX-00',
        color: 'Gold',
        image: '/images/parts/blades/LeonClawGold.jpg',
        stats: { attack: 40, defense: 40, stamina: 20, weight: 31.4, burstResistance: 0 }
    },
    {
        name: 'Leon Claw (Yellow Ver.)',
        type: 'blade',
        series: 'UX-12 04',
        color: 'Yellow',
        image: '/images/parts/blades/LeonClawYellow.png',
        stats: { attack: 40, defense: 40, stamina: 20, weight: 31.4, burstResistance: 0 }
    },
    {
        name: 'Viper Tail',
        type: 'blade',
        series: 'BX-16',
        image: '/images/parts/blades/ViperTail.jpg',
        stats: { attack: 30, defense: 20, stamina: 50, weight: 34.7, burstResistance: 0 }
    },
    {
        name: 'Viper Tail (Black Ver.)',
        type: 'blade',
        series: 'BX-16 02',
        color: 'Black',
        image: '/images/parts/blades/ViperTailBlack.jpg',
        stats: { attack: 30, defense: 20, stamina: 50, weight: 34.7, burstResistance: 0 }
    },
    {
        name: 'Viper Tail (Yellow Ver.)',
        type: 'blade',
        series: 'BX-16 03',
        color: 'Yellow',
        image: '/images/parts/blades/ViperTailYellow.jpg',
        stats: { attack: 30, defense: 20, stamina: 50, weight: 34.7, burstResistance: 0 }
    },
    {
        name: 'Viper Tail (Blue Ver.)',
        type: 'blade',
        series: 'BX-24 04',
        color: 'Blue',
        image: '/images/parts/blades/ViperTailBlue.jpg',
        stats: { attack: 30, defense: 20, stamina: 50, weight: 34.7, burstResistance: 0 }
    },
    {
        name: 'Viper Tail (Purple Ver.)',
        type: 'blade',
        series: 'BX-35',
        color: 'Purple',
        image: '/images/parts/blades/ViperTailPurple.jpg',
        stats: { attack: 30, defense: 20, stamina: 50, weight: 34.7, burstResistance: 0 }
    },
    {
        name: 'Rhino Horn',
        type: 'blade',
        series: 'BX-19',
        color: 'White',
        image: '/images/parts/blades/RhinoHorn.jpg',
        stats: { attack: 20, defense: 50, stamina: 30, weight: 32.7, burstResistance: 0 }
    },
    {
        name: 'Rhino Horn (Purple Ver.)',
        type: 'blade',
        series: 'BX-31 06',
        color: 'Purple',
        image: '/images/parts/blades/RhinoHornPurple.jpg',
        stats: { attack: 20, defense: 50, stamina: 30, weight: 32.7, burstResistance: 0 }
    },
    {
        name: 'Dran Dagger',
        type: 'blade',
        series: 'BX-20',
        color: 'Blue',
        image: '/images/parts/blades/DranDagger.jpg',
        stats: { attack: 50, defense: 25, stamina: 25, weight: 36.0, burstResistance: 0 }
    },
    {
        name: 'Dran Dagger (Orange Ver.)',
        type: 'blade',
        series: 'BX-31 04',
        color: 'Orange',
        image: '/images/parts/blades/DranDaggerOrange.jpg',
        stats: { attack: 50, defense: 25, stamina: 25, weight: 36.0, burstResistance: 0 }
    },
    {
        name: 'Dran Dagger (Metal Coat: Black, Giants Version)',
        type: 'blade',
        series: 'BX-00',
        color: 'Black',
        image: '/images/parts/blades/DranDaggerBlack.png',
        stats: { attack: 50, defense: 25, stamina: 25, weight: 36.0, burstResistance: 0 }
    },
    {
        name: 'Dran Dagger (Metal Coat: White)',
        type: 'blade',
        series: 'UX-00',
        color: 'White',
        image: '/images/parts/blades/DranDaggerWhite.png',
        stats: { attack: 50, defense: 25, stamina: 25, weight: 36.0, burstResistance: 0 }
    },
    {
        name: 'Hells Chain',
        type: 'blade',
        series: 'BX-21',
        color: 'Purple',
        image: '/images/parts/blades/HellsChain.jpg',
        stats: { attack: 35, defense: 40, stamina: 25, weight: 33.2, burstResistance: 0 }
    },
    {
        name: 'Hells Chain',
        type: 'blade',
        series: 'BX-31 03',
        color: 'Blue',
        image: '/images/parts/blades/HellsChainBlue.jpg',
        stats: { attack: 35, defense: 40, stamina: 25, weight: 33.2, burstResistance: 0 }
    },
    {
        name: 'Phoenix Wing',
        type: 'blade',
        series: 'BX-23',
        color: 'Red and Yellow',
        image: '/images/parts/blades/PhoenixWing.jpg',
        stats: { attack: 60, defense: 25, stamina: 15, weight: 39.0, burstResistance: 0 }
    },
    {
        name: 'Phoenix Wing (Blue Ver.)',
        type: 'blade',
        series: 'BX-35 05',
        color: 'Blue',
        image: '/images/parts/blades/PhoenixWingBlue.jpg',
        stats: { attack: 60, defense: 25, stamina: 15, weight: 39.0, burstResistance: 0 }
    },
    {
        name: 'Phoenix Wing (Metal Coat: Black Ver.)',
        type: 'blade',
        series: 'BX-00',
        color: 'Black',
        notes: '(Black and red) (Tatsuya Kitani Online Store Exclusive)',
        image: '/images/parts/blades/PhoenixWingBlack.png',
        stats: { attack: 60, defense: 25, stamina: 15, weight: 39.0, burstResistance: 0 }
    },
    {
        name: 'Phoenix Wing (Metal Coat: Navy Ver.)',
        type: 'blade',
        series: 'BX-00',
        color: 'Navy',
        notes: ' (Navy blue and green) (CoroCoro Mail Order Exclusive)',
        image: '/images/parts/blades/PhoenixWingNavy.jpg',
        stats: { attack: 60, defense: 25, stamina: 15, weight: 39.0, burstResistance: 0 }
    },
    {
        name: 'Wyvern Gale',
        type: 'blade',
        series: 'BX-24 01',
        image: '/images/parts/blades/WyvernGale.jpg',
        stats: { attack: 10, defense: 40, stamina: 50, weight: 31.9, burstResistance: 0 }
    },
    {
        name: 'Wyvern Gale (Yellow Ver.)',
        type: 'blade',
        series: 'BX-24 02',
        color: 'Yellow',
        image: '/images/parts/blades/WyvernGaleYellow.png',
        stats: { attack: 10, defense: 40, stamina: 50, weight: 31.9, burstResistance: 0 }
    },
    {
        name: 'Wyvern Gale (Black Ver.)',
        type: 'blade',
        series: 'UX-07',
        color: 'Black',
        image: '/images/parts/blades/WyvernGaleBlack.png',
        stats: { attack: 10, defense: 40, stamina: 50, weight: 31.9, burstResistance: 0 }
    },
    {
        name: 'Wyvern Gale (Red Ver.)',
        type: 'blade',
        series: 'UX-12',
        color: 'Red',
        image: '/images/parts/blades/WyvernGaleRed.png',
        stats: { attack: 10, defense: 40, stamina: 50, weight: 31.9, burstResistance: 0 }
    },
    {
        name: 'Unicorn Sting',
        type: 'blade',
        series: 'BX-26',
        color: 'Teal',
        image: '/images/parts/blades/UnicornSting.jpg',
        stats: { attack: 35, defense: 35, stamina: 30, weight: 34.0, burstResistance: 0 }
    },
    {
        name: 'Unicorn Sting (Red Ver.)',
        type: 'blade',
        series: 'BX-35 03',
        color: 'Red',
        image: '/images/parts/blades/UnicornStingRed.jpg',
        stats: { attack: 35, defense: 35, stamina: 30, weight: 34.0, burstResistance: 0 }
    },
    {
        name: 'Unicorn Sting (Yellow Ver.)',
        type: 'blade',
        series: 'G0199',
        color: 'Yellow',
        notes: 'Bite Croc and Sting Unicorn Dual Pack - Sting Unicorn 4-60P',
        image: '/images/parts/blades/UnicornStingYellow.jpg',
        stats: { attack: 35, defense: 35, stamina: 30, weight: 34.0, burstResistance: 0 }
    },
    {
        name: 'Sphinx Cowl',
        type: 'blade',
        series: 'BX-27',
        image: '/images/parts/blades/SphinxCowl.jpg',
        stats: { attack: 35, defense: 55, stamina: 10, weight: 32.7, burstResistance: 0 }
    },
    {
        name: 'Sphinx Cowl (Black Ver.)',
        type: 'blade',
        series: 'BX-27 02',
        color: 'Black',
        image: '/images/parts/blades/SphinxCowlBlack.jpg',
        stats: { attack: 35, defense: 55, stamina: 10, weight: 32.7, burstResistance: 0 }
    },
    {
        name: 'Sphinx Cowl (White Ver.)',
        type: 'blade',
        series: 'BX-27 03',
        color: 'White',
        image: '/images/parts/blades/SphinxCowlWhite.jpg',
        stats: { attack: 35, defense: 55, stamina: 10, weight: 32.7, burstResistance: 0 }
    },
    {
        name: 'Sphinx Cowl (Blue Ver.)',
        type: 'blade',
        series: 'UX-07',
        color: 'Blue',
        image: '/images/parts/blades/SphinxCowlBlue.png',
        stats: { attack: 35, defense: 55, stamina: 10, weight: 32.7, burstResistance: 0 }
    },
    {
        name: 'Tyranno Beat',
        type: 'blade',
        series: 'BX-31 01',
        image: '/images/parts/blades/TyrannoBeat.jpg',
        stats: { attack: 65, defense: 30, stamina: 5, weight: 37.0, burstResistance: 0 }
    },
    {
        name: 'Tyranno Beat (Green Ver.)',
        type: 'blade',
        series: 'BX-31 02',
        color: 'Green',
        image: '/images/parts/blades/TyrannoBeatGreen.jpg',
        stats: { attack: 65, defense: 30, stamina: 5, weight: 37.0, burstResistance: 0 }
    },
    {
        name: 'Tyranno Beat (Metal Coat: Red Ver.)',
        type: 'blade',
        series: 'UX-10',
        color: 'Red',
        image: '/images/parts/blades/TyrannoBeatRed.png',
        stats: { attack: 65, defense: 30, stamina: 5, weight: 37.0, burstResistance: 0 }
    },
    {
        name: 'Weiss Tiger',
        type: 'blade',
        series: 'BX-33',
        color: 'White',
        image: '/images/parts/blades/WeissTiger.jpg',
        stats: { attack: 45, defense: 30, stamina: 25, weight: 34.6, burstResistance: 0 }
    },
    {
        name: 'Cobalt Dragoon',
        type: 'blade',
        series: 'BX-34',
        color: 'Blue',
        image: '/images/parts/blades/CobaltDragoon.jpg',
        stats: { attack: 60, defense: 15, stamina: 25, weight: 37.8, burstResistance: 0 }
    },
    {
        name: 'Cobalt Dragoon (Metal Coat: Black Ver.)',
        type: 'blade',
        series: 'BX-00',
        color: 'Black',
        image: '/images/parts/blades/CobaltDragoonBlack.png',
        stats: { attack: 60, defense: 15, stamina: 25, weight: 37.8, burstResistance: 0 }
    },
    {
        name: 'Cobalt Dragoon (Yellow Ver.)',
        type: 'blade',
        series: 'CX-08',
        color: 'Yellow',
        image: '/images/parts/blades/CobaltDragoonYellow.png',
        stats: { attack: 60, defense: 15, stamina: 25, weight: 37.8, burstResistance: 0 }
    },
    {
        name: 'Black Shell',
        type: 'blade',
        series: 'BX-35',
        image: '/images/parts/blades/BlackShell.jpg',
        stats: { attack: 10, defense: 65, stamina: 25, weight: 32.1, burstResistance: 0 }
    },
    {
        name: 'Black Shell (Yellow Ver.)',
        type: 'blade',
        series: 'BX-35 02',
        color: 'Yellow',
        image: '/images/parts/blades/BlackShellYellow.jpg',
        stats: { attack: 10, defense: 65, stamina: 25, weight: 32.1, burstResistance: 0 }
    },
    {
        name: 'Black Shell (Pink Ver.)',
        type: 'blade',
        series: 'CX-08',
        color: 'Pink',
        image: '/images/parts/blades/BlackShellPink.png',
        stats: { attack: 10, defense: 65, stamina: 25, weight: 32.1, burstResistance: 0 }
    },
    {
        name: 'Whale Wave',
        type: 'blade',
        series: 'BX-36',
        image: '/images/parts/blades/WhaleWave.png',
        stats: { attack: 45, defense: 35, stamina: 20, weight: 38.2, burstResistance: 0 }
    },
    {
        name: 'Whale Wave (Black Ver.)',
        type: 'blade',
        series: 'BX-36 02',
        color: 'Black',
        image: '/images/parts/blades/WhaleWaveBlack.png',
        stats: { attack: 45, defense: 35, stamina: 20, weight: 38.2, burstResistance: 0 }
    },
    {
        name: 'Whale Wave (White Ver.)',
        type: 'blade',
        series: 'BX-36 03',
        color: 'White',
        image: '/images/parts/blades/WhaleWaveWhite.png',
        stats: { attack: 45, defense: 35, stamina: 20, weight: 38.2, burstResistance: 0 }
    },
    {
        name: 'Whale Wave (Yellow Ver.)',
        type: 'blade',
        series: 'CX-05 06',
        color: 'Yellow',
        image: '/images/parts/blades/WhaleWaveYellow.png',
        stats: { attack: 45, defense: 35, stamina: 20, weight: 38.2, burstResistance: 0 }
    },
    {
        name: 'Savage Bear',
        type: 'blade',
        series: 'BX-HASBRO',
        color: 'Yellow',
        image: '/images/parts/blades/SavageBear.png',
        stats: { attack: 25, defense: 45, stamina: 30, weight: 29.6, burstResistance: 0 }
    },
    {
        name: 'Crimson Garuda',
        type: 'blade',
        series: 'BX-38',
        color: 'Red',
        image: '/images/parts/blades/CrimsonGaruda.png',
        stats: { attack: 45, defense: 25, stamina: 30, weight: 35.0, burstResistance: 0 }
    },
    {
        name: 'Shelter Drake',
        type: 'blade',
        series: 'BX-39',
        image: '/images/parts/blades/ShelterDrake.png',
        stats: { attack: 25, defense: 40, stamina: 35, weight: 32.6, burstResistance: 0 }
    },
    {
        name: 'Shelter Drake (Yellow Ver.)',
        type: 'blade',
        series: 'BX-39 02',
        color: 'Yellow',
        image: '/images/parts/blades/ShelterDrakeYellow.png',
        stats: { attack: 25, defense: 40, stamina: 35, weight: 32.6, burstResistance: 0 }
    },
    {
        name: 'Shelter Drake (Green Ver.)',
        type: 'blade',
        series: 'BX-39 03',
        color: 'Green',
        image: '/images/parts/blades/ShelterDrakeGreen.png',
        stats: { attack: 25, defense: 40, stamina: 35, weight: 32.6, burstResistance: 0 }
    },
    {
        name: 'Tricera Press',
        type: 'blade',
        series: 'BX-44',
        color: 'Green',
        image: '/images/parts/blades/TriceraPress.jpg',
        stats: { attack: 20, defense: 65, stamina: 15, weight: 36.5, burstResistance: 0 }
    },
    {
        name: 'Samurai Calibur',
        type: 'blade',
        series: 'BX-45',
        color: 'Purple',
        image: '/images/parts/blades/SamuraiCalibur.jpg',
        stats: { attack: 40, defense: 30, stamina: 30, weight: 0.0, burstResistance: 0 }
    },
    {
        name: 'Talon Ptera',
        type: 'blade',
        series: 'BX-ORG02',
        color: 'Orange',
        image: '/images/parts/blades/TalonPtera.jpg',
        stats: { attack: 27, defense: 23, stamina: 50, weight: 34.3, burstResistance: 0 }
    },
    {
        name: 'Talon Ptera (Yellow Ver.)',
        type: 'blade',
        series: 'UX-10',
        color: 'Yellow',
        image: '/images/parts/blades/TalonPteraYellow.png',
        stats: { attack: 27, defense: 23, stamina: 50, weight: 34.3, burstResistance: 0 }
    },
    {
        name: 'Bite Croc',
        type: 'blade',
        series: 'BX-00',
        image: '/images/parts/blades/CrocCrunch.jpg',
        stats: { attack: 60, defense: 22, stamina: 18, weight: 34.1, burstResistance: 0 }
    },
    {
        name: 'Cobalt Drake',
        type: 'blade',
        series: 'BX-00',
        color: 'Green',
        image: '/images/parts/blades/CrocCrunchGreen.jpg',
        stats: { attack: 60, defense: 22, stamina: 18, weight: 34.1, burstResistance: 0 }
    },
    {
        name: 'Cobalt Drake (Metal Coat: Blue Ver.)',
        type: 'blade',
        series: 'BX-00',
        color: 'Blue',
        notes: 'Rare Bey Get Battle Prize',
        image: '/images/parts/blades/CobaltDrake.png',
        stats: { attack: 65, defense: 30, stamina: 20, weight: 37.3, burstResistance: 0 }
    },
    {
        name: 'Cobalt Drake (Clear Ver.)',
        type: 'blade',
        series: 'BX-00',
        color: 'Clear',
        notes: 'Rare Bey Get Battle Prize',
        image: '/images/parts/blades/CobaltDrakeClear.png',
        stats: { attack: 65, defense: 30, stamina: 20, weight: 37.3, burstResistance: 0 }
    },
    {
        name: 'Gill Shark',
        type: 'blade',
        series: 'BX-HASBRO',
        color: 'Orange',
        image: '/images/parts/blades/GillShark.jpg',
        stats: { attack: 20, defense: 25, stamina: 55, weight: 29.5, burstResistance: 0 }
    },
    {
        name: 'Shinobi Knife',
        type: 'blade',
        series: 'BX-00',
        image: '/images/parts/blades/KnifeShinobi.png',
        stats: { attack: 23, defense: 50, stamina: 27, weight: 30.9, burstResistance: 0 }
    },
    {
        name: 'Shinobi Knife (Metal Coat: Blue Ver.)',
        type: 'blade',
        series: 'BX-00',
        color: 'Blue',
        image: '/images/parts/blades/KnifeShinobiBlue.png',
        stats: { attack: 23, defense: 50, stamina: 27, weight: 30.9, burstResistance: 0 }
    },
    {
        name: 'Phoenix Feather',
        type: 'blade',
        series: 'BX-00',
        color: 'Red',
        notes: 'CoroCoro Mail Order Exclusive',
        image: '/images/parts/blades/PhoenixFeather.png',
        stats: { attack: 50, defense: 20, stamina: 30, weight: 33.3, burstResistance: 0 }
    },
    {
        name: 'Phoenix Feather (Metal Coat: Orange Ver.)',
        type: 'blade',
        series: 'BX-00',
        color: 'Orange',
        image: '/images/parts/blades/PhoenixFeatherOrange.png',
        stats: { attack: 50, defense: 20, stamina: 30, weight: 33.3, burstResistance: 0 }
    },
    {
        name: 'Phoenix Feather (Black Ver.)',
        type: 'blade',
        series: 'UX-12 05',
        color: 'Black',
        image: '/images/parts/blades/PhoenixFeatherBlack.png',
        stats: { attack: 50, defense: 20, stamina: 30, weight: 33.3, burstResistance: 0 }
    },
    {
        name: 'Steel Samurai',
        type: 'blade',
        series: 'BX-HASBRO',
        color: 'Red',
        image: '/images/parts/blades/SteelSamurai.jpg',
        stats: { attack: 40, defense: 37, stamina: 23, weight: 31.2, burstResistance: 0 }
    },
    {
        name: 'Steel Samurai (Metal Coat: White Ver.)',
        type: 'blade',
        series: 'BX-00',
        color: 'White',
        image: '/images/parts/blades/SteelSamuraiWhite.jpg',
        stats: { attack: 40, defense: 37, stamina: 23, weight: 31.2, burstResistance: 0 }
    },
    {
        name: 'Tackle Goat',
        type: 'blade',
        series: 'BX-HASBRO',
        color: 'Blue',
        image: '/images/parts/blades/TackleGoat.jpg',
        stats: { attack: 13, defense: 65, stamina: 22, weight: 31.5, burstResistance: 0 }
    },
    {
        name: 'Tusk Mammoth',
        type: 'blade',
        series: 'BX-HASBRO',
        color: 'Purple',
        image: '/images/parts/blades/TuskMammoth.jpg',
        stats: { attack: 33, defense: 35, stamina: 32, weight: 32.0, burstResistance: 0 }
    },
    {
        name: 'Tusk Mammoth (Metal Coat: Black Ver.)',
        type: 'blade',
        series: 'BX-00',
        color: 'Black',
        image: '/images/parts/blades/TuskMammothBlack.png',
        stats: { attack: 33, defense: 35, stamina: 32, weight: 32.0, burstResistance: 0 }
    },
    {
        name: 'Yell Kong',
        type: 'blade',
        series: 'BX-HASBRO',
        color: 'Green',
        image: '/images/parts/blades/YellKong.jpg',
        stats: { attack: 13, defense: 37, stamina: 50, weight: 31.1, burstResistance: 0 }
    },
    {
        name: 'Roar Tyranno',
        type: 'blade',
        series: 'BX-HASBRO',
        color: 'Blue',
        image: '/images/parts/blades/RoarTyranno.jpg',
        stats: { attack: 60, defense: 28, stamina: 12, weight: 36.0, burstResistance: 0 }
    },
    {
        name: 'Roar Tyranno (Orange Ver.)',
        type: 'blade',
        series: 'UX-15',
        color: 'Orange',
        image: '/images/parts/blades/RoarTyrannoOrange.png',
        stats: { attack: 60, defense: 28, stamina: 12, weight: 36.0, burstResistance: 0 }
    },


    // UX Series Blades
    {
        name: 'Dran Buster',
        type: 'blade',
        series: 'UX-01',
        color: 'Blue',
        image: '/images/parts/blades/DranBuster.jpg',
        stats: { attack: 70, defense: 20, stamina: 10, weight: 36.5, burstResistance: 0 }
    },
    {
        name: 'Dran Buster (Special Ver.)',
        type: 'blade',
        series: 'UX-04',
        color: 'Light Blue',
        image: '/images/parts/blades/DranBusterSpecial.jpg',
        stats: { attack: 70, defense: 20, stamina: 10, weight: 36.5, burstResistance: 0 }
    },
    {
        name: 'Dran Buster (Metal Coat: Red Ver.)',
        type: 'blade',
        series: 'UX-00',
        color: 'Red',
        image: '/images/parts/blades/DranBusterRed.jpg',
        stats: { attack: 70, defense: 20, stamina: 10, weight: 36.5, burstResistance: 0 }
    },
    {
        name: 'Dran Buster (Metal Coat: White Ver.)',
        type: 'blade',
        series: 'UX-00',
        color: 'White',
        image: '/images/parts/blades/DranBusterWhite.png',
        stats: { attack: 70, defense: 20, stamina: 10, weight: 36.5, burstResistance: 0 }
    },
    {
        name: 'Dran Buster (Metal Coat: Blue FC Barcelona Ver.)',
        type: 'blade',
        series: 'UX-00',
        color: 'Blue and Red',
        image: '/images/parts/blades/DranBusterFCBarcelona.png',
        stats: { attack: 70, defense: 20, stamina: 10, weight: 36.5, burstResistance: 0 }
    },
    {
        name: 'Dran Buster (Metal Coat: Black Ver.)',
        type: 'blade',
        series: 'UX-00',
        color: 'Black',
        image: '/images/parts/blades/DranBusterBlack.png',
        stats: { attack: 70, defense: 20, stamina: 10, weight: 36.5, burstResistance: 0 }
    },
    {
        name: 'Dran Buster (Metal Coat: Cyan Ver.)',
        type: 'blade',
        series: 'UX-00',
        color: 'Cyan',
        image: '/images/parts/blades/DranBusterCyan.png',
        stats: { attack: 70, defense: 20, stamina: 10, weight: 36.5, burstResistance: 0 }
    },
    {
        name: 'Dran Buster (Metal Coat: Violet Ver.)',
        type: 'blade',
        series: 'UX-00',
        color: 'Violet',
        image: '/images/parts/blades/DranBusterViolet.png',
        stats: { attack: 70, defense: 20, stamina: 10, weight: 36.5, burstResistance: 0 }
    },
    {
        name: 'Dran Buster (Green Ver.)',
        type: 'blade',
        series: 'UX-HASBRO',
        color: 'Green',
        image: '/images/parts/blades/DranBusterGreen.png',
        stats: { attack: 70, defense: 20, stamina: 10, weight: 36.5, burstResistance: 0 }
    },
    {
        name: 'Dran Buster (Purple Ver.)',
        type: 'blade',
        series: 'CX-08',
        color: 'Purple',
        image: '/images/parts/blades/DranBusterPurple.png',
        stats: { attack: 70, defense: 20, stamina: 10, weight: 36.5, burstResistance: 0 }
    },
    {
        name: 'Hells Hammer',
        type: 'blade',
        series: 'UX-02',
        color: 'Red',
        image: '/images/parts/blades/HellsHammer.jpg',
        stats: { attack: 50, defense: 25, stamina: 25, weight: 33.0, burstResistance: 0 }
    },
    {
        name: 'Hells Hammer (Metal Coat: Blue Ver.)',
        type: 'blade',
        series: 'UX-10',
        color: 'Blue',
        image: '/images/parts/blades/HellsHammerBlue.png',
        stats: { attack: 50, defense: 25, stamina: 25, weight: 33.0, burstResistance: 0 }
    },
    {
        name: 'Hells Hammer (Metal Coat: Red FC Barcelona Ver.)',
        type: 'blade',
        series: 'UX-00',
        color: 'Red and Blue',
        image: '/images/parts/blades/HellsHammerFCBarcelona.png',
        stats: { attack: 50, defense: 25, stamina: 25, weight: 33.0, burstResistance: 0 }
    },
    {
        name: 'Wizard Rod',
        type: 'blade',
        series: 'UX-03',
        color: 'Yellow',
        image: '/images/parts/blades/WizardRod.jpg',
        stats: { attack: 15, defense: 25, stamina: 60, weight: 35.3, burstResistance: 0 }
    },
    {
        name: 'Wizard Rod (Green Ver.)',
        type: 'blade',
        series: 'BX-35 04',
        color: 'Green',
        image: '/images/parts/blades/WizardRodGreen.jpg',
        stats: { attack: 15, defense: 25, stamina: 60, weight: 35.3, burstResistance: 0 }
    },
    {
        name: 'Wizard Rod (Special Ver.)',
        type: 'blade',
        series: 'UX-04',
        color: 'Yellow',
        image: '/images/parts/blades/WizardRodSpecial.jpg',
        stats: { attack: 15, defense: 25, stamina: 60, weight: 35.3, burstResistance: 0 }
    },
    {
        name: 'Wizard Rod (Metal Coat: Gold G3 Tournament Prize Ver.)',
        type: 'blade',
        series: 'UX-00',
        color: 'Gold',
        image: '/images/parts/blades/WizardRodGold.png',
        stats: { attack: 15, defense: 25, stamina: 60, weight: 35.3, burstResistance: 0 }
    },
    {
        name: 'Shinobi Shadow',
        type: 'blade',
        series: 'UX-05',
        image: '/images/parts/blades/ShinobiShadow.jpg',
        stats: { attack: 10, defense: 70, stamina: 20, weight: 28.2, burstResistance: 0 }
    },
    {
        name: 'Shinobi Shadow (Black Ver.)',
        type: 'blade',
        series: 'UX-05 02',
        color: 'Black',
        image: '/images/parts/blades/ShinobiShadowBlack.jpg',
        stats: { attack: 10, defense: 70, stamina: 20, weight: 28.2, burstResistance: 0 }
    },
    {
        name: 'Shinobi Shadow (Yellow Ver.)',
        type: 'blade',
        series: 'UX-05 03',
        color: 'Yellow',
        image: '/images/parts/blades/ShinobiShadowYellow.jpg',
        stats: { attack: 10, defense: 70, stamina: 20, weight: 28.2, burstResistance: 0 }
    },
    {
        name: 'Shinobi Shadow (Blue Ver.)',
        type: 'blade',
        series: 'UX-12 03',
        color: 'Blue',
        image: '/images/parts/blades/ShinobiShadowBlue.png',
        stats: { attack: 10, defense: 70, stamina: 20, weight: 28.2, burstResistance: 0 }
    },
    {
        name: 'Leon Crest',
        type: 'blade',
        series: 'UX-06',
        color: 'Yellow',
        image: '/images/parts/blades/LeonCrest.jpg',
        stats: { attack: 15, defense: 70, stamina: 15, weight: 35.0, burstResistance: 0 }
    },
    {
        name: 'Phoenix Rudder',
        type: 'blade',
        series: 'UX-07',
        image: '/images/parts/blades/PhoenixRudder.jpg',
        stats: { attack: 10, defense: 35, stamina: 55, weight: 34.5, burstResistance: 0 }
    },
    {
        name: 'Phoenix Rudder (Black Ver.)',
        type: 'blade',
        series: 'CX-05 05',
        color: 'Black',
        image: '/images/parts/blades/PhoenixRudderBlack.png',
        stats: { attack: 10, defense: 35, stamina: 55, weight: 34.5, burstResistance: 0 }
    },
    {
        name: 'Silver Wolf',
        type: 'blade',
        series: 'UX-08',
        color: 'Silver',
        image: '/images/parts/blades/SilverWolf.png',
        stats: { attack: 15, defense: 30, stamina: 65, weight: 36.8, burstResistance: 0 }
    },
    {
        name: 'Samurai Saber',
        type: 'blade',
        series: 'UX-09',
        color: 'Purple',
        image: '/images/parts/blades/SamuraiSaber.png',
        stats: { attack: 65, defense: 20, stamina: 25, weight: 36.5, burstResistance: 0 }
    },
    {
        name: 'Samurai Saber (Metal Coat: Orange Ver.)',
        type: 'blade',
        series: 'UX-00',
        color: 'Orange',
        image: '/images/parts/blades/SamuraiSaberOrange.jpg',
        stats: { attack: 65, defense: 20, stamina: 25, weight: 36.5, burstResistance: 0 }
    },
    {
        name: 'Knight Mail',
        type: 'blade',
        series: 'UX-10',
        color: 'Green',
        image: '/images/parts/blades/KnightMail.png',
        stats: { attack: 10, defense: 65, stamina: 35, weight: 36.7, burstResistance: 0 }
    },
    {
        name: 'Knight Mail (Metal Coat: Navy Ver.)',
        type: 'blade',
        series: 'UX-00',
        color: 'Navy',
        notes: 'Rare Bey Get Battle Prize',
        image: '/images/parts/blades/KnightMailNavy.png',
        stats: { attack: 10, defense: 65, stamina: 35, weight: 36.7, burstResistance: 0 }
    },
    {
        name: 'Impact Drake',
        type: 'blade',
        series: 'UX-11',
        color: 'Blue',
        image: '/images/parts/blades/ImpactDrake.jpg',
        stats: { attack: 75, defense: 25, stamina: 10, weight: 39.0, burstResistance: 0 }
    },
    {
        name: 'Ghost Circle',
        type: 'blade',
        series: 'UX-12',
        image: '/images/parts/blades/GhostCircle.png',
        stats: { attack: 5, defense: 40, stamina: 55, weight: 26.7, burstResistance: 0 }
    },
    {
        name: 'Ghost Circle (Green Ver.)',
        type: 'blade',
        series: 'UX-12 02',
        color: 'Green',
        image: '/images/parts/blades/GhostCircleGreen.png',
        stats: { attack: 5, defense: 40, stamina: 55, weight: 26.7, burstResistance: 0 }
    },
    {
        name: 'Golem Rock',
        type: 'blade',
        series: 'UX-13',
        color: 'Orange',
        image: '/images/parts/blades/GolemRock.jpg',
        stats: { attack: 30, defense: 60, stamina: 10, weight: 34.0, burstResistance: 0 }
    },
    {
        name: 'Scorpio Spear',
        type: 'blade',
        series: 'UX-14',
        color: 'Yellow',
        image: '/images/parts/blades/ScorpioSpear.png',
        stats: { attack: 55, defense: 25, stamina: 30, weight: 39.6, burstResistance: 0 }
    },
    {
        name: 'Shark Scale',
        type: 'blade',
        series: 'UX-15',
        color: 'Purple',
        image: '/images/parts/blades/SharkScale.png',
        stats: { attack: 70, defense: 15, stamina: 15, weight: 0.0, burstResistance: 0 }
    },
    {
        name: 'Hover Wyvern',
        type: 'blade',
        series: 'UX-HASBRO',
        color: 'Green',
        image: '/images/parts/blades/HoverWyvern.jpg',
        stats: { attack: 13, defense: 60, stamina: 27, weight: 35.0, burstResistance: 0 }
    },

    // CX Series Blades
    {
        name: 'Brave',
        type: 'blade',
        series: 'CX-01',
        color: 'Blue',
        image: '/images/parts/blades/Brave.png',
        stats: { attack: 40, defense: 10, stamina: 10, weight: 31.2, burstResistance: 0 }
    },
    {
        name: 'Brave (Special Ver.)',
        type: 'blade',
        series: 'CX-04',
        color: 'Orange',
        image: '/images/parts/blades/BraveSpecial.png',
        stats: { attack: 40, defense: 10, stamina: 10, weight: 31.2, burstResistance: 0 }
    },
    {
        name: 'Brave (Yellow Ver.)',
        type: 'blade',
        series: 'UX-15',
        color: 'Yellow',
        image: '/images/parts/blades/BraveYellow.png',
        stats: { attack: 40, defense: 10, stamina: 10, weight: 31.2, burstResistance: 0 }
    },
    {
        name: 'Arc',
        type: 'blade',
        series: 'CX-02',
        image: '/images/parts/blades/Arc.png',
        stats: { attack: 10, defense: 10, stamina: 40, weight: 29.4, burstResistance: 0 }
    },
    {
        name: 'Arc (Blue Ver.)',
        type: 'blade',
        series: 'CX-05',
        color: 'Blue',
        image: '/images/parts/blades/ArcBlue.png',
        stats: { attack: 10, defense: 10, stamina: 40, weight: 29.4, burstResistance: 0 }
    },
    {
        name: 'Arc (Metal Coat: Black Ver.)',
        type: 'blade',
        series: 'CX-00',
        color: 'Black',
        image: '/images/parts/blades/ArcBlack.png',
        stats: { attack: 10, defense: 10, stamina: 40, weight: 29.4, burstResistance: 0 }
    },
    {
        name: 'Arc (Metal Coat: Blue Ver.)',
        type: 'blade',
        series: 'CX-00',
        color: 'Blue',
        image: '/images/parts/blades/ArcMCBlue.jpg',
        stats: { attack: 10, defense: 10, stamina: 40, weight: 29.4, burstResistance: 0 }
    },
    {
        name: 'Dark',
        type: 'blade',
        series: 'CX-03',
        color: 'Black',
        image: '/images/parts/blades/Dark.jpg',
        stats: { attack: 10, defense: 40, stamina: 10, weight: 30.3, burstResistance: 0 }
    },
    {
        name: 'Dark (Special Ver.)',
        type: 'blade',
        series: 'CX-04',
        color: 'White',
        image: '/images/parts/blades/DarkSpecial.png',
        stats: { attack: 10, defense: 40, stamina: 10, weight: 30.3, burstResistance: 0 }
    },
    {
        name: 'Dark (Green Ver.)',
        type: 'blade',
        series: 'CX-08',
        color: 'Green',
        image: '/images/parts/blades/DarkGreen.png',
        stats: { attack: 10, defense: 40, stamina: 10, weight: 30.3, burstResistance: 0 }
    },
    {
        name: 'Reaper',
        type: 'blade',
        series: 'CX-05 01',
        color: 'Red',
        image: '/images/parts/blades/Reaper.png',
        stats: { attack: 40, defense: 20, stamina: 40, weight: 29.0, burstResistance: 0 }
    },
    {
        name: 'Reaper (Blue Ver.)',
        type: 'blade',
        series: 'CX-05 02',
        color: 'Blue',
        image: '/images/parts/blades/ReaperBlue.png',
        notes: 'RhinoReaper C4-55D',
        stats: { attack: 35, defense: 20, stamina: 45, weight: 29.0, burstResistance: 0 }
    },
    {
        name: 'Brush',
        type: 'blade',
        series: 'CX-06 01',
        color: 'White',
        image: '/images/parts/blades/Brush.png',
        stats: { attack: 60, defense: 30, stamina: 10, weight: 30.3, burstResistance: 0 }
    },
    {
        name: 'Brush (Black Ver.)',
        type: 'blade',
        series: 'CX-06 02',
        color: 'Black',
        image: '/images/parts/blades/BrushBlack.png',
        stats: { attack: 60, defense: 30, stamina: 10, weight: 30.3, burstResistance: 0 }
    },
    {
        name: 'Brush (Gold Ver.)',
        type: 'blade',
        series: 'CX-06 03',
        color: 'Gold',
        image: '/images/parts/blades/BrushGold.png',
        stats: { attack: 60, defense: 30, stamina: 10, weight: 30.3, burstResistance: 0 }
    },
    {
        name: 'Blast (Metal Coat: Green Ver.)',
        type: 'blade',
        series: 'CX-07',
        color: 'Green',
        image: '/images/parts/blades/Blast.png',
        stats: { attack: 50, defense: 25, stamina: 25, weight: 32.0, burstResistance: 0 }
    },
    {
        name: 'Blast (Metal Coat: Red Ver.)',
        type: 'blade',
        series: 'CX-00',
        color: 'Red',
        image: '/images/parts/blades/BlastRed.png',
        stats: { attack: 50, defense: 25, stamina: 25, weight: 32.0, burstResistance: 0 }
    },
    {
        name: 'Flame',
        type: 'blade',
        series: 'CX-08 01',
        image: '/images/parts/blades/Flame.png',
        stats: { attack: 45, defense: 30, stamina: 25, weight: 33.5, burstResistance: 0 }
    },
    {
        name: 'Flame',
        type: 'blade',
        series: 'CX-08 02',
        color: 'Blue',
        image: '/images/parts/blades/FlameBlue.png',
        stats: { attack: 45, defense: 30, stamina: 25, weight: 33.5, burstResistance: 0 }
    },
    {
        name: 'Volt (Metal Coat: Gold)',
        type: 'blade',
        series: 'CX-00',
        color: 'Gold',
        image: '/images/parts/blades/Volt.png',
        stats: { attack: 50, defense: 25, stamina: 25, weight: 31.0, burstResistance: 0 }
    },


    // Collaboration Blades
    {
        name: 'Captain America (Dran Sword)',
        type: 'blade',
        series: 'COLLAB - MARVEL',
        image: '/images/parts/blades/CaptainAmerica.jpg',
        stats: { attack: 55, defense: 28, stamina: 17, weight: 32.3, burstResistance: 0 }
    },
    {
        name: 'Darth Vader (Knight Lance)',
        type: 'blade',
        series: 'COLLAB - STAR WARS',
        image: '/images/parts/blades/DarthVader.jpg',
        stats: { attack: 28, defense: 60, stamina: 12, weight: 30.7, burstResistance: 0 }
    },
    {
        name: 'General Grievous (Rhino Horn)',
        type: 'blade',
        series: 'COLLAB - STAR WARS',
        image: '/images/parts/blades/GeneralGrievous.jpg',
        stats: { attack: 23, defense: 60, stamina: 17, weight: 31.0, burstResistance: 0 }
    },
    {
        name: 'Iron Man (Knight Shield)',
        type: 'blade',
        series: 'COLLAB - MARVEL',
        image: '/images/parts/blades/IronMan.jpg',
        stats: { attack: 17, defense: 55, stamina: 28, weight: 33.6, burstResistance: 0 }
    },
    {
        name: 'Luke Skywalker (Knight Shield)',
        type: 'blade',
        series: 'COLLAB - STAR WARS',
        image: '/images/parts/blades/LukeSkywalker.jpg',
        stats: { attack: 23, defense: 55, stamina: 22, weight: 31.5, burstResistance: 0 }
    },
    {
        name: 'Megatron (Hells Scythe)',
        type: 'blade',
        series: 'COLLAB - TRANSFORMERS',
        image: '/images/parts/blades/Megatron.jpg',
        stats: { attack: 27, defense: 35, stamina: 38, weight: 31.1, burstResistance: 0 }
    },
    {
        name: 'Moff Gideon (Hells Scythe)',
        type: 'blade',
        series: 'COLLAB - STAR WARS',
        image: '/images/parts/blades/MoffGideon.jpg',
        stats: { attack: 32, defense: 35, stamina: 33, weight: 30.5, burstResistance: 0 }
    },
    {
        name: 'Obi-Wan Kenobi (Knight Lance)',
        type: 'blade',
        series: 'COLLAB - STAR WARS',
        image: '/images/parts/blades/ObiWanKenobi.jpg',
        stats: { attack: 23, defense: 60, stamina: 17, weight: 30.6, burstResistance: 0 }
    },
    {
        name: 'Optimus Primal (Shark Edge)',
        type: 'blade',
        series: 'COLLAB - TRANSFORMERS',
        image: '/images/parts/blades/OptimusPrimal.jpg',
        stats: { attack: 60, defense: 27, stamina: 13, weight: 35.7, burstResistance: 0 }
    },
    {
        name: 'Optimus Prime (Knight Shield)',
        type: 'blade',
        series: 'COLLAB - TRANSFORMERS',
        image: '/images/parts/blades/OptimusPrime.jpg',
        stats: { attack: 22, defense: 55, stamina: 23, weight: 33.3, burstResistance: 0 }
    },
    {
        name: 'Red Hulk (Tyranno Beat)',
        type: 'blade',
        series: 'COLLAB - MARVEL',
        image: '/images/parts/blades/RedHulk.jpg',
        stats: { attack: 65, defense: 27, stamina: 8, weight: 36.5, burstResistance: 0 }
    },
    {
        name: 'Spider-Man (Viper Tail)',
        type: 'blade',
        series: 'COLLAB - MARVEL',
        image: '/images/parts/blades/SpiderMan.jpg',
        stats: { attack: 33, defense: 17, stamina: 50, weight: 33.2, burstResistance: 0 }
    },
    {
        name: 'Starscream (Wizard Arrow)',
        type: 'blade',
        series: 'COLLAB - TRANSFORMERS',
        image: '/images/parts/blades/Starscream.jpg',
        stats: { attack: 18, defense: 27, stamina: 55, weight: 29.5, burstResistance: 0 }
    },
    {
        name: 'Thanos (Knight Lance)',
        type: 'blade',
        series: 'COLLAB - MARVEL',
        image: '/images/parts/blades/Thanos.jpg',
        stats: { attack: 22, defense: 60, stamina: 18, weight: 29.5, burstResistance: 0 }
    },
    {
        name: 'The Mandalorian (Leon Claw)',
        type: 'blade',
        series: 'COLLAB - STAR WARS',
        image: '/images/parts/blades/TheMandalorian.jpg',
        stats: { attack: 40, defense: 43, stamina: 17, weight: 30.3, burstResistance: 0 }
    },
    {
        name: 'Mosasaurus (Cowl Sphinx)',
        type: 'blade',
        series: 'COLLAB - JURASSIC WORLD',
        image: '/images/parts/blades/Mosasaurus.png',
        stats: { attack: 32, defense: 55, stamina: 13, weight: 29.9, burstResistance: 0 }
    },
    {
        name: 'Venom (Sword Dran)',
        type: 'blade',
        series: 'COLLAB - MARVEL',
        image: '/images/parts/blades/Venom.jpg',
        stats: { attack: 55, defense: 22, stamina: 23, weight: 34.3, burstResistance: 0 }
    },
    {
        name: 'T. Rex (Tyranno Beat)',
        type: 'blade',
        series: 'COLLAB - JURASSIC WORLD',
        image: '/images/parts/blades/TRex.png',
        stats: { attack: 65, defense: 30, stamina: 5, weight: 37.0, burstResistance: 0 }
    },
    {
        name: 'Quetzalcoatlus (Talon Ptera)',
        type: 'blade',
        series: 'COLLAB - JURASSIC WORLD',
        image: '/images/parts/blades/Quetzalcoatlus.png',
        stats: { attack: 27, defense: 23, stamina: 50, weight: 34.3, burstResistance: 0 }
    },
    {
        name: 'Spinosaurus (Roar Tyranno)',
        type: 'blade',
        series: 'COLLAB - JURASSIC WORLD',
        image: '/images/parts/blades/Spinosaurus.png',
        stats: { attack: 60, defense: 28, stamina: 12, weight: 36.0, burstResistance: 0 }
    },


    // X-Over Project Blades
    {
        name: 'Draciel Shield',
        type: 'blade',
        series: 'X-OVER',
        image: '/images/parts/blades/DracielShield.png',
        stats: { attack: 30, defense: 50, stamina: 20, weight: 28.0, burstResistance: 0 }
    },
    {
        name: 'Dragoon Storm',
        type: 'blade',
        series: 'X-OVER',
        image: '/images/parts/blades/DragoonStorm.jpg',
        stats: { attack: 55, defense: 30, stamina: 15, weight: 25.1, burstResistance: 0 }
    },
    {
        name: 'Dranzer Spiral',
        type: 'blade',
        series: 'X-OVER',
        image: '/images/parts/blades/DranzerSpiral.png',
        stats: { attack: 35, defense: 30, stamina: 35, weight: 27.7, burstResistance: 0 }
    },
    {
        name: 'Driger Slash',
        type: 'blade',
        series: 'X-OVER',
        image: '/images/parts/blades/DrigerSlash.png',
        stats: { attack: 40, defense: 35, stamina: 25, weight: 28.6, burstResistance: 0 }
    },
    {
        name: 'Lightning L-Drago (Rapid-Hit Type)',
        type: 'blade',
        series: 'X-OVER',
        image: '/images/parts/blades/LightningLDragoRH.png',
        stats: { attack: 50, defense: 30, stamina: 20, weight: 33.5, burstResistance: 0 }
    },
    {
        name: 'Lightning L-Drago (Upper Type)',
        type: 'blade',
        series: 'X-OVER',
        image: '/images/parts/blades/LightningLDragoUT.png',
        stats: { attack: 55, defense: 25, stamina: 20, weight: 34.0, burstResistance: 0 }
    },
    {
        name: 'Rock Leone',
        type: 'blade',
        series: 'X-OVER',
        image: '/images/parts/blades/RockLeone.png',
        stats: { attack: 30, defense: 55, stamina: 15, weight: 29.8, burstResistance: 0 }
    },
    {
        name: 'Storm Pegasis',
        type: 'blade',
        series: 'X-OVER',
        image: '/images/parts/blades/StormPegasis.jpg',
        stats: { attack: 55, defense: 15, stamina: 30, weight: 31.0, burstResistance: 0 }
    },
    {
        name: 'Victory Valkyrie',
        type: 'blade',
        series: 'X-OVER',
        image: '/images/parts/blades/VictoryValkyrie.png',
        stats: { attack: 55, defense: 20, stamina: 25, weight: 33.2, burstResistance: 0 }
    },
    {
        name: 'Xeno Xcalibur',
        type: 'blade',
        series: 'X-OVER',
        image: '/images/parts/blades/XenoXcalibur.png',
        stats: { attack: 65, defense: 25, stamina: 10, weight: 31.0, burstResistance: 0 }
    },

    // Rare Bey Get Battle Blades
    {
        name: 'Aero Pegasus',
        type: 'blade',
        series: 'RARE BEY GET BATTLE',
        image: '/images/parts/blades/AeroPegasus.jpg',
        stats: { attack: 70, defense: 30, stamina: 35, weight: 38.3, burstResistance: 0 }
    },

    // Assist Blades (fewer, as they're optional)
    {
        name: 'Slash',
        type: 'assist_blade',
        series: 'CX-01',
        image: '/images/parts/assist_blades/Slash.png',
        stats: { attack: 10, defense: 20, stamina: 10, weight: 4.7, burstResistance: 0 }
    },
    {
        name: 'Round',
        type: 'assist_blade',
        series: 'CX-02',
        image: '/images/parts/assist_blades/Round.png',
        stats: { attack: 10, defense: 10, stamina: 20, weight: 4.7, burstResistance: 0 }
    },
    {
        name: 'Bumper',
        type: 'assist_blade',
        series: 'CX-03',
        image: '/images/parts/assist_blades/Bumper.png',
        stats: { attack: 10, defense: 40, stamina: 10, weight: 5.3, burstResistance: 0 }
    },
    {
        name: 'Turn',
        type: 'assist_blade',
        series: 'CX-05',
        image: '/images/parts/assist_blades/Turn.png',
        stats: { attack: 10, defense: 10, stamina: 20, weight: 5.8, burstResistance: 0 }
    },
    {
        name: 'Charge',
        type: 'assist_blade',
        series: 'CX-05',
        image: '/images/parts/assist_blades/Charge.png',
        stats: { attack: 15, defense: 20, stamina: 5, weight: 5.0, burstResistance: 0 }
    },
    {
        name: 'Jaggy',
        type: 'assist_blade',
        series: 'CX-06',
        image: '/images/parts/assist_blades/Jaggy.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 4.9, burstResistance: 0 }
    },
    {
        name: 'Assault',
        type: 'assist_blade',
        series: 'CX-07',
        image: '/images/parts/assist_blades/Assault.png',
        stats: { attack: 15, defense: 10, stamina: 5, weight: 5.2, burstResistance: 0 }
    },
    {
        name: 'Wheel',
        type: 'assist_blade',
        series: 'CX-08',
        image: '/images/parts/assist_blades/Wheel.png',
        stats: { attack: 5, defense: 15, stamina: 15, weight: 5.5, burstResistance: 0 }
    },
    {
        name: 'Massive',
        type: 'assist_blade',
        series: 'CX-08',
        image: '/images/parts/assist_blades/Massive.png',
        stats: { attack: 5, defense: 25, stamina: 10, weight: 6.0, burstResistance: 0 }
    },


    // Ratchets
    {
        name: '0-70',
        type: 'ratchet',
        image: '/images/parts/ratchets/0-70.png',
        stats: { attack: 3, defense: 0, stamina: 14, weight: 7.0, burstResistance: 0 }
    },
    {
        name: '0-80',
        type: 'ratchet',
        image: '/images/parts/ratchets/0-80.png',
        stats: { attack: 3, defense: 12, stamina: 15, weight: 7.6, burstResistance: 0 }
    },
    {
        name: '1-60',
        type: 'ratchet',
        image: '/images/parts/ratchets/1-60.png',
        stats: { attack: 17, defense: 9, stamina: 4, weight: 6.0, burstResistance: 0 }
    },
    {
        name: '1-70',
        type: 'ratchet',
        image: '/images/parts/ratchets/1-70.png',
        stats: { attack: 17, defense: 6, stamina: 7, weight: 7.3, burstResistance: 0 }
    },
    {
        name: '1-80',
        type: 'ratchet',
        image: '/images/parts/ratchets/1-80.png',
        stats: { attack: 17, defense: 4, stamina: 9, weight: 6.7, burstResistance: 0 }
    },
    {
        name: '2-60',
        type: 'ratchet',
        image: '/images/parts/ratchets/2-60.png',
        stats: { attack: 16, defense: 8, stamina: 6, weight: 6.2, burstResistance: 0 }
    },
    {
        name: '2-70',
        type: 'ratchet',
        image: '/images/parts/ratchets/2-70.png',
        stats: { attack: 10, defense: 12, stamina: 8, weight: 6.4, burstResistance: 0 }
    },
    {
        name: '2-80',
        type: 'ratchet',
        image: '/images/parts/ratchets/2-80.png',
        stats: { attack: 10, defense: 11, stamina: 9, weight: 6.9, burstResistance: 0 }
    },
    {
        name: '3-60',
        type: 'ratchet',
        image: '/images/parts/ratchets/3-60.png',
        stats: { attack: 15, defense: 9, stamina: 6, weight: 6.4, burstResistance: 0 }
    },
    {
        name: '3-70',
        type: 'ratchet',
        image: '/images/parts/ratchets/3-70.png',
        stats: { attack: 15, defense: 8, stamina: 7, weight: 6.4, burstResistance: 0 }
    },
    {
        name: '3-80',
        type: 'ratchet',
        image: '/images/parts/ratchets/3-80.png',
        stats: { attack: 15, defense: 7, stamina: 8, weight: 7.1, burstResistance: 0 }
    },
    {
        name: '3-85',
        type: 'ratchet',
        image: '/images/parts/ratchets/3-85.png',
        stats: { attack: 5, defense: 15, stamina: 10, weight: 4.7, burstResistance: 0 }
    },
    {
        name: '4-50',
        type: 'ratchet',
        image: '/images/parts/ratchets/4-50.png',
        stats: { attack: 12, defense: 13, stamina: 5, weight: 0.0, burstResistance: 0 }
    },
    {
        name: '4-55',
        type: 'ratchet',
        image: '/images/parts/ratchets/4-55.png',
        stats: { attack: 7, defense: 11, stamina: 12, weight: 4.8, burstResistance: 0 }
    },
    {
        name: '4-60',
        type: 'ratchet',
        image: '/images/parts/ratchets/4-60.png',
        stats: { attack: 11, defense: 13, stamina: 6, weight: 6.3, burstResistance: 0 }
    },
    {
        name: '4-70',
        type: 'ratchet',
        image: '/images/parts/ratchets/4-70.png',
        stats: { attack: 11, defense: 12, stamina: 7, weight: 6.4, burstResistance: 0 }
    },
    {
        name: '4-80',
        type: 'ratchet',
        image: '/images/parts/ratchets/4-80.png',
        stats: { attack: 11, defense: 11, stamina: 8, weight: 7.0, burstResistance: 0 }
    },
    {
        name: '5-60',
        type: 'ratchet',
        image: '/images/parts/ratchets/5-60.png',
        stats: { attack: 12, defense: 9, stamina: 9, weight: 6.6, burstResistance: 0 }
    },
    {
        name: '5-70',
        type: 'ratchet',
        image: '/images/parts/ratchets/5-70.png',
        stats: { attack: 12, defense: 8, stamina: 10, weight: 6.7, burstResistance: 0 }
    },
    {
        name: '5-80',
        type: 'ratchet',
        image: '/images/parts/ratchets/5-80.png',
        stats: { attack: 12, defense: 8, stamina: 10, weight: 7.3, burstResistance: 0 }
    },
    {
        name: '6-60',
        type: 'ratchet',
        image: '/images/parts/ratchets/6-60.png',
        stats: { attack: 14, defense: 8, stamina: 8, weight: 6.1, burstResistance: 0 }
    },
    {
        name: '6-70',
        type: 'ratchet',
        image: '/images/parts/ratchets/6-70.png',
        stats: { attack: 14, defense: 7, stamina: 9, weight: 7.3, burstResistance: 0 }
    },
    {
        name: '6-80',
        type: 'ratchet',
        image: '/images/parts/ratchets/6-80.png',
        stats: { attack: 14, defense: 6, stamina: 10, weight: 6.9, burstResistance: 0 }
    },
    {
        name: '7-60',
        type: 'ratchet',
        image: '/images/parts/ratchets/7-60.png',
        stats: { attack: 8, defense: 14, stamina: 8, weight: 7.1, burstResistance: 0 }
    },
    {
        name: '7-70',
        type: 'ratchet',
        image: '/images/parts/ratchets/7-70.png',
        stats: { attack: 8, defense: 12, stamina: 10, weight: 7.3, burstResistance: 0 }
    },
    {
        name: '7-80',
        type: 'ratchet',
        image: '/images/parts/ratchets/7-80.png',
        stats: { attack: 7, defense: 14, stamina: 9, weight: 7.8, burstResistance: 0 }
    },
    {
        name: '9-60',
        type: 'ratchet',
        image: '/images/parts/ratchets/9-60.png',
        stats: { attack: 13, defense: 10, stamina: 7, weight: 6.2, burstResistance: 0 }
    },
    {
        name: '9-70',
        type: 'ratchet',
        image: '/images/parts/ratchets/9-70.png',
        stats: { attack: 13, defense: 10, stamina: 7, weight: 6.3, burstResistance: 0 }
    },
    {
        name: '9-80',
        type: 'ratchet',
        image: '/images/parts/ratchets/9-80.png',
        stats: { attack: 13, defense: 10, stamina: 7, weight: 6.9, burstResistance: 0 }
    },
    {
        name: 'M-85',
        type: 'ratchet',
        image: '/images/parts/ratchets/M-85.png',
        stats: { attack: 8, defense: 19, stamina: 13, weight: 10.6, burstResistance: 0 }
    },


    // Bits
    {
        name: 'Accel',
        type: 'bit',
        image: '/images/parts/bits/Accel.png',
        stats: { attack: 40, defense: 10, stamina: 10, weight: 2.6, burstResistance: 80 }
    },
    {
        name: 'Ball',
        type: 'bit',
        image: '/images/parts/bits/Ball.png',
        stats: { attack: 15, defense: 25, stamina: 50, weight: 2.1, burstResistance: 30 }
    },
    {
        name: 'Bound Spike',
        type: 'bit',
        image: '/images/parts/bits/BoundSpike.png',
        stats: { attack: 5, defense: 60, stamina: 30, weight: 2.0, burstResistance: 30 }
    },
    {
        name: 'Cyclone',
        type: 'bit',
        image: '/images/parts/bits/Cyclone.png',
        stats: { attack: 40, defense: 5, stamina: 10, weight: 2.1, burstResistance: 80 }
    },
    {
        name: 'Disk Ball',
        type: 'bit',
        image: '/images/parts/bits/DiskBall.png',
        stats: { attack: 15, defense: 20, stamina: 55, weight: 3.2, burstResistance: 30 }
    },
    {
        name: 'Dot',
        type: 'bit',
        image: '/images/parts/bits/Dot.png',
        stats: { attack: 10, defense: 55, stamina: 25, weight: 2.0, burstResistance: 30 }
    },
    {
        name: 'Elevate',
        type: 'bit',
        image: '/images/parts/bits/Elevate.png',
        stats: { attack: 30, defense: 15, stamina: 20, weight: 3.2, burstResistance: 30 }
    },
    {
        name: 'Flat',
        type: 'bit',
        image: '/images/parts/bits/Flat.png',
        stats: { attack: 40, defense: 15, stamina: 10, weight: 2.2, burstResistance: 80 }
    },
    {
        name: 'Free Ball',
        type: 'bit',
        image: '/images/parts/bits/FreeBall.png',
        stats: { attack: 10, defense: 25, stamina: 60, weight: 1.9, burstResistance: 30 }
    },
    {
        name: 'Gear Ball',
        type: 'bit',
        image: '/images/parts/bits/GearBall.png',
        stats: { attack: 10, defense: 15, stamina: 45, weight: 2.0, burstResistance: 30 }
    },
    {
        name: 'Gear Flat',
        type: 'bit',
        image: '/images/parts/bits/GearFlat.png',
        stats: { attack: 50, defense: 5, stamina: 5, weight: 2.3, burstResistance: 80 }
    },
    {
        name: 'Gear Needle',
        type: 'bit',
        image: '/images/parts/bits/GearNeedle.png',
        stats: { attack: 20, defense: 40, stamina: 10, weight: 2.0, burstResistance: 30 }
    },
    {
        name: 'Gear Point',
        type: 'bit',
        image: '/images/parts/bits/GearPoint.png',
        stats: { attack: 30, defense: 25, stamina: 15, weight: 2.3, burstResistance: 80 }
    },
    {
        name: 'Gear Rush',
        type: 'bit',
        image: '/images/parts/bits/GearRush.png',
        stats: { attack: 45, defense: 10, stamina: 10, weight: 2.1, burstResistance: 80 }
    },
    {
        name: 'Glide',
        type: 'bit',
        image: '/images/parts/bits/Glide.png',
        stats: { attack: 20, defense: 10, stamina: 55, weight: 2.5, burstResistance: 30 }
    },
    {
        name: 'Hexa',
        type: 'bit',
        image: '/images/parts/bits/Hexa.png',
        stats: { attack: 30, defense: 35, stamina: 20, weight: 2.6, burstResistance: 80 }
    },
    {
        name: 'High Needle',
        type: 'bit',
        image: '/images/parts/bits/HighNeedle.png',
        stats: { attack: 15, defense: 55, stamina: 20, weight: 2.2, burstResistance: 30 }
    },
    {
        name: 'High Taper',
        type: 'bit',
        image: '/images/parts/bits/HighTaper.png',
        stats: { attack: 30, defense: 25, stamina: 20, weight: 2.2, burstResistance: 80 }
    },
    {
        name: 'Kick',
        type: 'bit',
        image: '/images/parts/bits/Kick.png',
        stats: { attack: 35, defense: 25, stamina: 15, weight: 2.2, burstResistance: 80 }
    },
    {
        name: 'Level',
        type: 'bit',
        image: '/images/parts/bits/Level.png',
        stats: { attack: 40, defense: 5, stamina: 15, weight: 2.7, burstResistance: 80 }
    },
    {
        name: 'Low Flat',
        type: 'bit',
        image: '/images/parts/bits/LowFlat.png',
        stats: { attack: 45, defense: 5, stamina: 10, weight: 2.1, burstResistance: 80 }
    },
    {
        name: 'Low Orb',
        type: 'bit',
        image: '/images/parts/bits/LowOrb.png',
        stats: { attack: 5, defense: 25, stamina: 55, weight: 0.0, burstResistance: 30 }
    },
    {
        name: 'Low Rush',
        type: 'bit',
        image: '/images/parts/bits/LowRush.png',
        stats: { attack: 45, defense: 5, stamina: 15, weight: 1.9, burstResistance: 80 }
    },
    {
        name: 'Merge',
        type: 'bit',
        image: '/images/parts/bits/Merge.png',
        stats: { attack: 50, defense: 20, stamina: 10, weight: 0.0, burstResistance: 80 }
    },
    {
        name: 'Metal Needle',
        type: 'bit',
        image: '/images/parts/bits/MetalNeedle.png',
        stats: { attack: 8, defense: 57, stamina: 30, weight: 2.8, burstResistance: 30 }
    },
    {
        name: 'Needle',
        type: 'bit',
        image: '/images/parts/bits/Needle.png',
        stats: { attack: 10, defense: 50, stamina: 30, weight: 2.0, burstResistance: 30 }
    },
    {
        name: 'Orb',
        type: 'bit',
        image: '/images/parts/bits/Orb.png',
        stats: { attack: 10, defense: 30, stamina: 50, weight: 2.0, burstResistance: 30 }
    },
    {
        name: 'Point',
        type: 'bit',
        image: '/images/parts/bits/Point.png',
        stats: { attack: 25, defense: 25, stamina: 25, weight: 2.2, burstResistance: 80 }
    },
    {
        name: 'Quake',
        type: 'bit',
        image: '/images/parts/bits/Quake.png',
        stats: { attack: 55, defense: 15, stamina: 5, weight: 2.2, burstResistance: 80 }
    },
    {
        name: 'Rubber Accel',
        type: 'bit',
        image: '/images/parts/bits/RubberAccel.png',
        stats: { attack: 50, defense: 17, stamina: 3, weight: 3.1, burstResistance: 80 }
    },
    {
        name: 'Rush',
        type: 'bit',
        image: '/images/parts/bits/Rush.png',
        stats: { attack: 40, defense: 10, stamina: 20, weight: 2.1, burstResistance: 80 }
    },
    {
        name: 'Spike',
        type: 'bit',
        image: '/images/parts/bits/Spike.png',
        stats: { attack: 10, defense: 45, stamina: 35, weight: 2.0, burstResistance: 30 }
    },
    {
        name: 'Taper',
        type: 'bit',
        image: '/images/parts/bits/Taper.png',
        stats: { attack: 35, defense: 20, stamina: 20, weight: 2.2, burstResistance: 80 }
    },
    {
        name: 'Trans Point',
        type: 'bit',
        image: '/images/parts/bits/TransPoint.png',
        stats: { attack: 35, defense: 25, stamina: 25, weight: 0.0, burstResistance: 80 }
    },
    {
        name: 'Under Flat',
        type: 'bit',
        image: '/images/parts/bits/UnderFlat.png',
        stats: { attack: 55, defense: 5, stamina: 5, weight: 0.0, burstResistance: 80 }
    },
    {
        name: 'Under Needle',
        type: 'bit',
        image: '/images/parts/bits/UnderNeedle.png',
        stats: { attack: 10, defense: 60, stamina: 20, weight: 1.9, burstResistance: 30 }
    },
    {
        name: 'Unite',
        type: 'bit',
        image: '/images/parts/bits/Unite.png',
        stats: { attack: 25, defense: 25, stamina: 30, weight: 2.1, burstResistance: 80 }
    },
    {
        name: 'Vortex',
        type: 'bit',
        image: '/images/parts/bits/Vortex.png',
        stats: { attack: 45, defense: 10, stamina: 5, weight: 2.2, burstResistance: 80 }
    },
    {
        name: 'Wedge',
        type: 'bit',
        image: '/images/parts/bits/Wedge.png',
        stats: { attack: 5, defense: 55, stamina: 30, weight: 0.0, burstResistance: 30 }
    },
    {
        name: 'Zap',
        type: 'bit',
        image: '/images/parts/bits/Zap.png',
        stats: { attack: 30, defense: 20, stamina: 15, weight: 2.5, burstResistance: 80 }
    },


    // Lock Chips (for CX Series Beyblades)
    {
        name: 'Dran',
        type: 'lock_chip',
        series: 'CX-01',
        color: 'White',
        image: '/images/parts/lock_chips/Dran.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Dran (Special Ver.)',
        type: 'lock_chip',
        series: 'CX-04',
        color: 'Orange',
        image: '/images/parts/lock_chips/DranSpecial.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Dran (Clear Black Ver.)',
        type: 'lock_chip',
        series: 'CX-00',
        color: 'Black',
        image: '/images/parts/lock_chips/DranClearBlack.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Dran (SP Cross Holo Ver.)',
        type: 'lock_chip',
        series: 'CX-00',
        color: 'Holo',
        notes: 'CoroCoro Exclusive',
        image: '/images/parts/lock_chips/DranSPCrossHolo.jpg',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Wizard',
        type: 'lock_chip',
        series: 'CX-02',
        color: 'Yellow',
        image: '/images/parts/lock_chips/Wizard.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Wizard (Pink Ver.)',
        type: 'lock_chip',
        series: 'CX-02',
        color: 'Pink',
        image: '/images/parts/lock_chips/WizardPink.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Perseus',
        type: 'lock_chip',
        series: 'CX-03',
        color: 'Purple',
        image: '/images/parts/lock_chips/Perseus.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Perseus (Special Ver.)',
        type: 'lock_chip',
        series: 'CX-04',
        color: 'Blue',
        image: '/images/parts/lock_chips/PerseusSpecial.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Fox',
        type: 'lock_chip',
        series: 'CX-06 01',
        color: 'White',
        image: '/images/parts/lock_chips/Fox.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Fox (Black Ver.)',
        type: 'lock_chip',
        series: 'CX-06 02',
        color: 'Black',
        image: '/images/parts/lock_chips/FoxBlack.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Fox (Gold Ver.)',
        type: 'lock_chip',
        series: 'CX-06 03',
        color: 'Gold',
        image: '/images/parts/lock_chips/FoxGold.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Hells',
        type: 'lock_chip',
        series: 'CX-05 01',
        color: 'Black',
        image: '/images/parts/lock_chips/Hells.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Hells (Blue Ver.)',
        type: 'lock_chip',
        series: 'CX-05 03',
        color: 'Blue',
        image: '/images/parts/lock_chips/HellsBlue.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Hells (Yellow Ver.)',
        type: 'lock_chip',
        series: 'UX-15',
        color: 'Yellow',
        image: '/images/parts/lock_chips/HellsYellow.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Rhino',
        type: 'lock_chip',
        series: 'CX-05 02',
        color: 'Black',
        image: '/images/parts/lock_chips/Rhino.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 1.7, burstResistance: 0 }
    },
    {
        name: 'Valkyrie',
        type: 'lock_chip',
        series: 'CX-00',
        color: 'Gold',
        image: '/images/parts/lock_chips/Valkyrie.png',
        stats: { attack: 0, defense: 0, stamina: 0, weight: 5.6, burstResistance: 0 }
    }

]

// Function to search master parts by name and type
export function searchMasterParts(query: string, type?: PartType): MasterPart[] {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return []

    const results = MASTER_PARTS
        .filter(part => {
            const matchesType = !type || part.type === type
            const partName = part.name.toLowerCase()

            // Multiple search strategies for better matching
            const containsSearch = partName.includes(searchTerm)
            const wordStartSearch = partName.split(/[\s\-\(\)]/).some(word => word.startsWith(searchTerm))
            const simplifiedSearch = partName.replace(/[\-\(\)\.]/g, ' ').includes(searchTerm)
            const matchesName = containsSearch || wordStartSearch || simplifiedSearch

            return matchesType && matchesName
        })
        .sort((a, b) => {
            // Prioritize exact matches and starts-with matches
            const aName = a.name.toLowerCase()
            const bName = b.name.toLowerCase()
            const aStartsWith = aName.startsWith(searchTerm)
            const bStartsWith = bName.startsWith(searchTerm)
            const aContains = aName.includes(searchTerm)
            const bContains = bName.includes(searchTerm)

            if (aStartsWith && !bStartsWith) return -1
            if (!aStartsWith && bStartsWith) return 1
            if (aContains && !bContains) return -1
            if (!aContains && bContains) return 1

            // Then alphabetical
            return aName.localeCompare(bName)
        })
        .slice(0, 20) // Increased limit to 20 suggestions

    // Debug logging removed - functionality working correctly
    // if (query.toLowerCase().includes('dran') || query.toLowerCase().includes('quetz')) { ... }

    return results
}

// Combined search function for both individual parts and complete products
export function searchPartsAndProducts(query: string, type?: PartType): {
    parts: MasterPart[]
    products: MasterProduct[]
} {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return { parts: [], products: [] }

    // Search individual parts
    const parts = searchMasterParts(query, type)

    // Search products (only if not filtering by specific part type, or if looking for blades)
    const products = (!type || type === 'blade') ? searchMasterProducts(query) : []

    return { parts, products }
}

// Calculate combined stats for a beyblade combo
export function calculateComboStats(combo: {
    blade?: string;
    assistBlade?: string;
    ratchet?: string;
    bit?: string;
    lockChip?: string;
}) {
    const bladePart = combo.blade ? MASTER_PARTS.find(p => p.name === combo.blade && p.type === 'blade') : null;
    const assistBladePart = combo.assistBlade ? MASTER_PARTS.find(p => p.name === combo.assistBlade && p.type === 'assist_blade') : null;
    const ratchetPart = combo.ratchet ? MASTER_PARTS.find(p => p.name === combo.ratchet && p.type === 'ratchet') : null;
    const bitPart = combo.bit ? MASTER_PARTS.find(p => p.name === combo.bit && p.type === 'bit') : null;
    const lockChipPart = combo.lockChip ? MASTER_PARTS.find(p => p.name === combo.lockChip && p.type === 'lock_chip') : null;

    // Check if assist blade can be used (only with CX blades)
    const canUseAssistBlade = bladePart?.series?.startsWith('CX') || false;
    const effectiveAssistBlade = canUseAssistBlade ? assistBladePart : null;

    // Check if lock chip can be used (only with CX blades)
    const canUseLockChip = bladePart?.series?.startsWith('CX') || false;
    const effectiveLockChip = canUseLockChip ? lockChipPart : null;

    // Calculate combined stats
    const stats = {
        attack: 0,
        defense: 0,
        stamina: 0,
        weight: 0,
        burstResistance: 0
    };

    const parts = [bladePart, effectiveAssistBlade, ratchetPart, bitPart, effectiveLockChip].filter(Boolean);

    if (parts.length === 0) return null;

    parts.forEach(part => {
        if (part?.stats) {
            stats.attack += part.stats.attack || 0;
            stats.defense += part.stats.defense || 0;
            stats.stamina += part.stats.stamina || 0;
            stats.weight += part.stats.weight || 0;
            stats.burstResistance += part.stats.burstResistance || 0;
        }
    });

    // Round weight to 1 decimal place to fix floating-point precision issues
    stats.weight = Math.round(stats.weight * 10) / 10;

    return {
        ...stats,
        canUseAssistBlade,
        assistBladeUsed: !!effectiveAssistBlade,
        canUseLockChip,
        lockChipUsed: !!effectiveLockChip
    };
}
