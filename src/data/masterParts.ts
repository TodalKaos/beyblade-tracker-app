// Master database of known Beyblade X parts for autocomplete suggestions
import type { PartType } from '@/types/beyblade'

export interface MasterPart {
    name: string
    type: PartType
    series?: string
    image?: string // Path to the part image
}

export const MASTER_PARTS: MasterPart[] = [
    // BX Series Blades
    { name: 'Dran Sword', type: 'blade', series: 'BX-01', image: '/images/parts/blades/DranSword.png' },
    { name: 'Hells Scythe', type: 'blade', series: 'BX-02', image: '/images/parts/blades/HellsScythe.png' },
    { name: 'Wizard Arrow', type: 'blade', series: 'BX-03', image: '/images/parts/blades/WizardArrow.jpg' },
    { name: 'Knight Shield', type: 'blade', series: 'BX-04', image: '/images/parts/blades/KnightShield.jpg' },
    { name: 'Knight Lance', type: 'blade', series: 'BX-13', image: '/images/parts/blades/KnightLance.jpg' },
    { name: 'Shark Edge', type: 'blade', series: 'BX-14', image: '/images/parts/blades/SharkEdge.png' },
    { name: 'Leon Claw', type: 'blade', series: 'BX-15', image: '/images/parts/blades/LeonClaw.jpg' },
    { name: 'Viper Tail', type: 'blade', series: 'BX-16', image: '/images/parts/blades/ViperTail.jpg' },
    { name: 'Rhino Horn', type: 'blade', series: 'BX-19', image: '/images/parts/blades/RhinoHorn.jpg' },
    { name: 'Dran Dagger', type: 'blade', series: 'BX-20', image: '/images/parts/blades/DranDagger.jpg' },
    { name: 'Hells Chain', type: 'blade', series: 'BX-21', image: '/images/parts/blades/HellsChain.jpg' },
    { name: 'Phoenix Wing', type: 'blade', series: 'BX-23', image: '/images/parts/blades/PhoenixWing.jpg' },
    { name: 'Wyvern Gale', type: 'blade', series: 'BX-24', image: '/images/parts/blades/WyvernGale.jpg' },
    { name: 'Unicorn Sting', type: 'blade', series: 'BX-26', image: '/images/parts/blades/UnicornSting.jpg' },
    { name: 'Sphinx Cowl', type: 'blade', series: 'BX-27', image: '/images/parts/blades/SphinxCowl.jpg' },
    { name: 'Tyranno Beat', type: 'blade', series: 'BX-31', image: '/images/parts/blades/TyrannoBeat.jpg' },
    { name: 'Weiss Tiger', type: 'blade', series: 'BX-33', image: '/images/parts/blades/WeissTiger.jpg' },
    { name: 'Cobalt Dragoon', type: 'blade', series: 'BX-34', image: '/images/parts/blades/CobaltDragoon.jpg' },
    { name: 'Black Shell', type: 'blade', series: 'BX-35', image: '/images/parts/blades/BlackShell.jpg' },
    { name: 'Whale Wave', type: 'blade', series: 'BX-36', image: '/images/parts/blades/WhaleWave.png' },
    { name: 'Bear Scratch', type: 'blade', series: 'BX-37', image: '/images/parts/blades/BearScratch.png' },
    { name: 'Crimson Garuda', type: 'blade', series: 'BX-38', image: '/images/parts/blades/CrimsonGaruda.png' },
    { name: 'Shelter Drake', type: 'blade', series: 'BX-39', image: '/images/parts/blades/ShelterDrake.png' },
    { name: 'Tricera Press', type: 'blade', series: 'BX-44', image: '/images/parts/blades/TriceraPress.jpg' },
    { name: 'Samurai Calibur', type: 'blade', series: 'BX-45', image: '/images/parts/blades/SamuraiCalibur.jpg' },
    { name: 'Talon Ptera', type: 'blade', series: 'BX-ORG02', image: '/images/parts/blades/TalonPtera.jpg' },
    { name: 'Croc Crunch', type: 'blade', series: 'BX-00', image: '/images/parts/blades/CrocCrunch.jpg' },
    { name: 'Cobalt Drake', type: 'blade', series: 'BX-00', image: '/images/parts/blades/CobaltDrake.png' },
    { name: 'Gill Shark', type: 'blade', series: 'BX-HASBRO', image: '/images/parts/blades/GillShark.jpg' },
    { name: 'Shinobi Knife', type: 'blade', series: 'BX-00', image: '/images/parts/blades/ShinobiKnife.png' },
    { name: 'Phoenix Feather', type: 'blade', series: 'BX-00', image: '/images/parts/blades/PhoenixFeather.png' },
    { name: 'Samurai Steel', type: 'blade', series: 'BX-00', image: '/images/parts/blades/SamuraiSteel.jpg' },
    { name: 'Tackle Goat', type: 'blade', series: 'BX-HASBRO', image: '/images/parts/blades/TackleGoat.jpg' },
    { name: 'Tusk Mammoth', type: 'blade', series: 'BX-HASBRO', image: '/images/parts/blades/TuskMammoth.jpg' },
    { name: 'Yell Kong', type: 'blade', series: 'BX-HASBRO', image: '/images/parts/blades/YellKong.jpg' },


    // UX Series Blades
    { name: 'Aero Pegasus', type: 'blade', series: 'UX-00', image: '/images/parts/blades/AeroPegasus.jpg' },
    { name: 'Dran Buster', type: 'blade', series: 'UX-01', image: '/images/parts/blades/DranBuster.jpg' },
    { name: 'Hells Hammer', type: 'blade', series: 'UX-02', image: '/images/parts/blades/HellsHammer.jpg' },
    { name: 'Wizard Rod', type: 'blade', series: 'UX-03', image: '/images/parts/blades/WizardRod.jpg' },
    { name: 'Shinobi Shadow', type: 'blade', series: 'UX-05', image: '/images/parts/blades/ShinobiShadow.jpg' },
    { name: 'Leon Crest', type: 'blade', series: 'UX-06', image: '/images/parts/blades/LeonCrest.jpg' },
    { name: 'Phoenix Rudder', type: 'blade', series: 'UX-07', image: '/images/parts/blades/PhoenixRudder.jpg' },
    { name: 'Silver Wolf', type: 'blade', series: 'UX-08', image: '/images/parts/blades/SilverWolf.png' },
    { name: 'Samurai Saber', type: 'blade', series: 'UX-09', image: '/images/parts/blades/SamuraiSaber.png' },
    { name: 'Knight Mail', type: 'blade', series: 'UX-10', image: '/images/parts/blades/KnightMail.png' },
    { name: 'Impact Drake', type: 'blade', series: 'UX-11', image: '/images/parts/blades/ImpactDrake.jpg' },
    { name: 'Ghost Circle', type: 'blade', series: 'UX-12', image: '/images/parts/blades/GhostCircle.png' },
    { name: 'Golem Rock', type: 'blade', series: 'UX-13', image: '/images/parts/blades/GolemRock.jpg' },
    { name: 'Scorpio Spear', type: 'blade', series: 'UX-14', image: '/images/parts/blades/ScorpioSpear.png' },
    { name: 'Shark Scale', type: 'blade', series: 'UX-15', image: '/images/parts/blades/SharkScale.png' },
    { name: 'Hover Wyvern', type: 'blade', series: 'UX-HASBRO', image: '/images/parts/blades/HoverWyvern.jpg' },


    // CX Series Blades
    { name: 'Dran Brave', type: 'blade', series: 'CX-01', image: '/images/parts/blades/DranBrave.png' },
    { name: 'Wizard Arc', type: 'blade', series: 'CX-02', image: '/images/parts/blades/WizardArc.png' },
    { name: 'Perseus Dark', type: 'blade', series: 'CX-03', image: '/images/parts/blades/PerseusDark.jpg' },
    { name: 'Hells Reaper', type: 'blade', series: 'CX-05', image: '/images/parts/blades/HellsReaper.png' },
    { name: 'Rhino Reaper', type: 'blade', series: 'CX-05', image: '/images/parts/blades/RhinoReaper.png' },
    { name: 'Hells Arc', type: 'blade', series: 'CX-05', image: '/images/parts/blades/HellsArc.png' },
    { name: 'Fox Brush', type: 'blade', series: 'CX-06', image: '/images/parts/blades/FoxBrush.png' },
    { name: 'Pegasus Blast', type: 'blade', series: 'CX-07', image: '/images/parts/blades/PegasusBlast.png' },
    { name: 'Cerberus Flame', type: 'blade', series: 'CX-08', image: '/images/parts/blades/CerberusFlame.png' },
    { name: 'Whale Flame', type: 'blade', series: 'CX-08', image: '/images/parts/blades/WhaleFlame.png' },
    { name: 'Cerberus Dark', type: 'blade', series: 'CX-08', image: '/images/parts/blades/CerberusDark.png' },


    // Collaboration Blades
    { name: 'Captain America', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/CaptainAmerica.jpg' },
    { name: 'Darth Vader', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/DarthVader.jpg' },
    { name: 'General Grievous', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/GeneralGrievous.jpg' },
    { name: 'Iron Man', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/IronMan.jpg' },
    { name: 'Luke Skywalker', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/LukeSkywalker.jpg' },
    { name: 'Megatron', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/Megatron.jpg' },
    { name: 'Moff Gideon', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/MoffGideon.jpg' },
    { name: 'Obi-Wan Kenobi', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/ObiWanKenobi.jpg' },
    { name: 'Optimus Primal', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/OptimusPrimal.jpg' },
    { name: 'Optimus Prime', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/OptimusPrime.jpg' },
    { name: 'Red Hulk', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/RedHulk.jpg' },
    { name: 'Spider-Man', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/SpiderMan.jpg' },
    { name: 'Starscream', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/Starscream.jpg' },
    { name: 'Thanos', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/Thanos.jpg' },
    { name: 'The Mandalorian', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/TheMandalorian.jpg' },
    { name: 'Mosasaurus', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/Mosasaurus.png' },
    { name: 'Venom', type: 'blade', series: 'COLLAB', image: '/images/parts/blades/Venom.jpg' },


    // X-Over Project Blades
    { name: 'Draciel Shield', type: 'blade', series: 'X-OVER', image: '/images/parts/blades/DracielShield.png' },
    { name: 'Dragoon Storm', type: 'blade', series: 'X-OVER', image: '/images/parts/blades/DragoonStorm.jpg' },
    { name: 'Dranzer Spiral', type: 'blade', series: 'X-OVER', image: '/images/parts/blades/DranzerSpiral.png' },
    { name: 'Driger Slash', type: 'blade', series: 'X-OVER', image: '/images/parts/blades/DrigerSlash.png' },
    { name: 'Lightning L-Drago (Rapid-Hit Type)', type: 'blade', series: 'X-OVER', image: '/images/parts/blades/LightningLDragoRH.png' },
    { name: 'Lightning L-Drago (Upper Type)', type: 'blade', series: 'X-OVER', image: '/images/parts/blades/LightningLDragoUT.png' },
    { name: 'Rock Leone', type: 'blade', series: 'X-OVER', image: '/images/parts/blades/RockLeone.png' },
    { name: 'Storm Pegasis', type: 'blade', series: 'X-OVER', image: '/images/parts/blades/StormPegasis.jpg' },
    { name: 'Victory Valkyrie', type: 'blade', series: 'X-OVER', image: '/images/parts/blades/VictoryValkyrie.png' },
    { name: 'Xeno Xcalibur', type: 'blade', series: 'X-OVER', image: '/images/parts/blades/XenoXcalibur.png' },


    // Assist Blades (fewer, as they're optional)
    { name: 'Slash', type: 'assist_blade', series: 'CX-01', image: '/images/parts/assist_blades/Slash.png' },
    { name: 'Round', type: 'assist_blade', series: 'CX-02', image: '/images/parts/assist_blades/Round.png' },
    { name: 'Bumper', type: 'assist_blade', series: 'CX-03', image: '/images/parts/assist_blades/Bumper.png' },
    { name: 'Turn', type: 'assist_blade', series: 'CX-05', image: '/images/parts/assist_blades/Turn.png' },
    { name: 'Charge', type: 'assist_blade', series: 'CX-05', image: '/images/parts/assist_blades/Charge.png' },
    { name: 'Jaggy', type: 'assist_blade', series: 'CX-06', image: '/images/parts/assist_blades/Jaggy.png' },
    { name: 'Assault', type: 'assist_blade', series: 'CX-07', image: '/images/parts/assist_blades/Assault.png' },
    { name: 'Wheel', type: 'assist_blade', series: 'CX-08', image: '/images/parts/assist_blades/Wheel.png' },
    { name: 'Massive', type: 'assist_blade', series: 'CX-08', image: '/images/parts/assist_blades/Massive.png' },


    // Ratchets
    { name: '0-70', type: 'ratchet', image: '/images/parts/ratchets/0-70.png' },
    { name: '0-80', type: 'ratchet', image: '/images/parts/ratchets/0-80.png' },
    { name: '1-60', type: 'ratchet', image: '/images/parts/ratchets/1-60.png' },
    { name: '1-80', type: 'ratchet', image: '/images/parts/ratchets/1-80.png' },
    { name: '2-60', type: 'ratchet', image: '/images/parts/ratchets/2-60.png' },
    { name: '2-70', type: 'ratchet', image: '/images/parts/ratchets/2-70.png' },
    { name: '2-80', type: 'ratchet', image: '/images/parts/ratchets/2-80.png' },
    { name: '3-60', type: 'ratchet', image: '/images/parts/ratchets/3-60.png' },
    { name: '3-70', type: 'ratchet', image: '/images/parts/ratchets/3-70.png' },
    { name: '3-80', type: 'ratchet', image: '/images/parts/ratchets/3-80.png' },
    { name: '3-85', type: 'ratchet', image: '/images/parts/ratchets/3-85.png' },
    { name: '4-50', type: 'ratchet', image: '/images/parts/ratchets/4-50.png' },
    { name: '4-55', type: 'ratchet', image: '/images/parts/ratchets/4-55.png' },
    { name: '4-60', type: 'ratchet', image: '/images/parts/ratchets/4-60.png' },
    { name: '4-70', type: 'ratchet', image: '/images/parts/ratchets/4-70.png' },
    { name: '4-80', type: 'ratchet', image: '/images/parts/ratchets/4-80.png' },
    { name: '5-60', type: 'ratchet', image: '/images/parts/ratchets/5-60.png' },
    { name: '5-70', type: 'ratchet', image: '/images/parts/ratchets/5-70.png' },
    { name: '5-80', type: 'ratchet', image: '/images/parts/ratchets/5-80.png' },
    { name: '6-60', type: 'ratchet', image: '/images/parts/ratchets/6-60.png' },
    { name: '6-80', type: 'ratchet', image: '/images/parts/ratchets/6-80.png' },
    { name: '7-60', type: 'ratchet', image: '/images/parts/ratchets/7-60.png' },
    { name: '7-70', type: 'ratchet', image: '/images/parts/ratchets/7-70.png' },
    { name: '7-80', type: 'ratchet', image: '/images/parts/ratchets/7-80.png' },
    { name: '9-60', type: 'ratchet', image: '/images/parts/ratchets/9-60.png' },
    { name: '9-70', type: 'ratchet', image: '/images/parts/ratchets/9-70.png' },
    { name: '9-80', type: 'ratchet', image: '/images/parts/ratchets/9-80.png' },
    { name: 'M-85', type: 'ratchet', image: '/images/parts/ratchets/M-85.png' },


    // Bits
    { name: 'Accel', type: 'bit', image: '/images/parts/bits/Accel.png' },
    { name: 'Ball', type: 'bit', image: '/images/parts/bits/Ball.png' },
    { name: 'Bound Spike', type: 'bit', image: '/images/parts/bits/BoundSpike.png' },
    { name: 'Cyclone', type: 'bit', image: '/images/parts/bits/Cyclone.png' },
    { name: 'Disk Ball', type: 'bit', image: '/images/parts/bits/DiskBall.png' },
    { name: 'Dot', type: 'bit', image: '/images/parts/bits/Dot.png' },
    { name: 'Elevate', type: 'bit', image: '/images/parts/bits/Elevate.png' },
    { name: 'Flat', type: 'bit', image: '/images/parts/bits/Flat.png' },
    { name: 'Free Ball', type: 'bit', image: '/images/parts/bits/FreeBall.png' },
    { name: 'Gear Ball', type: 'bit', image: '/images/parts/bits/GearBall.png' },
    { name: 'Gear Flat', type: 'bit', image: '/images/parts/bits/GearFlat.png' },
    { name: 'Gear Needle', type: 'bit', image: '/images/parts/bits/GearNeedle.png' },
    { name: 'Gear Point', type: 'bit', image: '/images/parts/bits/GearPoint.png' },
    { name: 'Gear Rush', type: 'bit', image: '/images/parts/bits/GearRush.png' },
    { name: 'Glide', type: 'bit', image: '/images/parts/bits/Glide.png' },
    { name: 'Hexa', type: 'bit', image: '/images/parts/bits/Hexa.png' },
    { name: 'High Needle', type: 'bit', image: '/images/parts/bits/HighNeedle.png' },
    { name: 'High Taper', type: 'bit', image: '/images/parts/bits/HighTaper.png' },
    { name: 'Kick', type: 'bit', image: '/images/parts/bits/Kick.png' },
    { name: 'Level', type: 'bit', image: '/images/parts/bits/Level.png' },
    { name: 'Low Flat', type: 'bit', image: '/images/parts/bits/LowFlat.png' },
    { name: 'Low Orb', type: 'bit', image: '/images/parts/bits/LowOrb.png' },
    { name: 'Low Rush', type: 'bit', image: '/images/parts/bits/LowRush.png' },
    { name: 'Merge', type: 'bit', image: '/images/parts/bits/Merge.png' },
    { name: 'Metal Needle', type: 'bit', image: '/images/parts/bits/MetalNeedle.png' },
    { name: 'Needle', type: 'bit', image: '/images/parts/bits/Needle.png' },
    { name: 'Orb', type: 'bit', image: '/images/parts/bits/Orb.png' },
    { name: 'Point', type: 'bit', image: '/images/parts/bits/Point.png' },
    { name: 'Quake', type: 'bit', image: '/images/parts/bits/Quake.png' },
    { name: 'Rubber Accel', type: 'bit', image: '/images/parts/bits/RubberAccel.png' },
    { name: 'Rush', type: 'bit', image: '/images/parts/bits/Rush.png' },
    { name: 'Spike', type: 'bit', image: '/images/parts/bits/Spike.png' },
    { name: 'Taper', type: 'bit', image: '/images/parts/bits/Taper.png' },
    { name: 'Trans Point', type: 'bit', image: '/images/parts/bits/TransPoint.png' },
    { name: 'Under Flat', type: 'bit', image: '/images/parts/bits/UnderFlat.png' },
    { name: 'Under Needle', type: 'bit', image: '/images/parts/bits/UnderNeedle.png' },
    { name: 'Unite', type: 'bit', image: '/images/parts/bits/Unite.png' },
    { name: 'Vortex', type: 'bit', image: '/images/parts/bits/Vortex.png' },
    { name: 'Wedge', type: 'bit', image: '/images/parts/bits/Wedge.png' },
    { name: 'Zap', type: 'bit', image: '/images/parts/bits/Zap.png' },

]

// Function to search master parts by name and type
export function searchMasterParts(query: string, type?: PartType): MasterPart[] {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return []

    return MASTER_PARTS
        .filter(part => {
            const matchesType = !type || part.type === type
            const matchesName = part.name.toLowerCase().includes(searchTerm)
            return matchesType && matchesName
        })
        .slice(0, 10) // Limit to 10 suggestions
}
