'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getAllCombos, addTestBattle, getComboTestStats, getAllTestBattles, updateTestBattle, deleteTestBattle } from '@/services/database'
import type { ComboWithParts, FinishType, ComboTestStats, TestBattleCreate, TestBattleWithCombos } from '@/types/beyblade'

// Types for battle details
interface BattleRoundHistory {
    round: number
    winner: number | null
    score1: number
    score2: number
    combo1Finishes?: Array<{ type: FinishType, count: number }>
    combo2Finishes?: Array<{ type: FinishType, count: number }>
}

interface BattleDetails {
    mode: 'standard' | 'timed' | 'rounds'
    legacy?: boolean
    maxRounds?: number
    targetScore?: number
    finalScore1?: number
    finalScore2?: number
    roundHistory?: BattleRoundHistory[]
    combo1Finishes?: Array<{ type: FinishType, points: number }>
    combo2Finishes?: Array<{ type: FinishType, points: number }>
}

export default function Testing() {
    const [combos, setCombos] = useState<ComboWithParts[]>([])
    const [loading, setLoading] = useState(true)
    const [leaderboard, setLeaderboard] = useState<ComboTestStats[]>([])
    const [showLeaderboard, setShowLeaderboard] = useState(false)

    // Battle History state
    const [battleHistory, setBattleHistory] = useState<TestBattleWithCombos[]>([])
    const [showHistory, setShowHistory] = useState(false)
    const [expandedBattles, setExpandedBattles] = useState<Set<number>>(new Set())
    const [historyFilter, setHistoryFilter] = useState({
        combo: 'all',
        outcome: 'all', // 'all', 'wins', 'losses', 'ties'
        dateFrom: '',
        dateTo: ''
    })

    // Edit/Delete Battle state
    const [editingBattle, setEditingBattle] = useState<TestBattleWithCombos | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editBattleData, setEditBattleData] = useState({
        combo1Score: 0,
        combo2Score: 0,
        battleDate: '',
        notes: ''
    })

    // Battle setup state
    const [selectedCombo1, setSelectedCombo1] = useState<ComboWithParts | null>(null)
    const [selectedCombo2, setSelectedCombo2] = useState<ComboWithParts | null>(null)
    const [battleStarted, setBattleStarted] = useState(false)

    // Score tracking state
    const [combo1Score, setCombo1Score] = useState(0)
    const [combo2Score, setCombo2Score] = useState(0)
    const [saving, setSaving] = useState(false)

    // Finish tracking for standard mode
    const [combo1Finishes, setCombo1Finishes] = useState<Array<{ type: FinishType, points: number }>>([])
    const [combo2Finishes, setCombo2Finishes] = useState<Array<{ type: FinishType, points: number }>>([])

    // Advanced Battle Features state
    const [battleMode, setBattleMode] = useState<'standard' | 'timed' | 'rounds'>('standard')
    const [targetScore, setTargetScore] = useState(5) // For timed battles
    const [currentRound, setCurrentRound] = useState(1)
    const [maxRounds, setMaxRounds] = useState(3) // Best of 3
    const [combo1Rounds, setCombo1Rounds] = useState(0)
    const [combo2Rounds, setCombo2Rounds] = useState(0)
    const [roundHistory, setRoundHistory] = useState<Array<{
        round: number,
        winner: number | null,
        score1: number,
        score2: number,
        combo1Finishes: Array<{ type: FinishType, points: number }>,
        combo2Finishes: Array<{ type: FinishType, points: number }>
    }>>([])
    const [battleComplete, setBattleComplete] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [combosData, leaderboardData, historyData] = await Promise.all([
                getAllCombos(),
                getComboTestStats(),
                getAllTestBattles()
            ])
            setCombos(combosData)
            setLeaderboard(leaderboardData)
            setBattleHistory(historyData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Commented out - not currently used but kept for future features
    // const loadCombos = async () => {
    //     try {
    //         setLoading(true)
    //         const combosData = await getAllCombos()
    //         setCombos(combosData)
    //     } catch (error) {
    //         console.error('Error loading combos:', error)
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    const getFilteredBattleHistory = () => {
        return battleHistory.filter(battle => {
            // Filter by combo
            if (historyFilter.combo !== 'all') {
                const comboId = parseInt(historyFilter.combo)
                if (battle.combo1_id !== comboId && battle.combo2_id !== comboId) {
                    return false
                }
            }

            // Filter by outcome
            if (historyFilter.outcome !== 'all') {
                const comboId = historyFilter.combo !== 'all' ? parseInt(historyFilter.combo) : null

                if (historyFilter.outcome === 'wins') {
                    if (comboId) {
                        if (battle.winner_combo_id !== comboId) return false
                    } else {
                        if (!battle.winner_combo_id) return false
                    }
                } else if (historyFilter.outcome === 'losses') {
                    if (comboId) {
                        if (battle.winner_combo_id === comboId || !battle.winner_combo_id) return false
                    } else {
                        if (!battle.winner_combo_id) return false
                    }
                } else if (historyFilter.outcome === 'ties') {
                    if (battle.winner_combo_id !== null) return false
                }
            }

            // Filter by date range
            if (historyFilter.dateFrom && battle.battle_date < historyFilter.dateFrom) {
                return false
            }
            if (historyFilter.dateTo && battle.battle_date > historyFilter.dateTo) {
                return false
            }

            return true
        })
    }

    //  Edit Battle Functions
    const openEditBattle = (battle: TestBattleWithCombos) => {
        setEditingBattle(battle)
        setEditBattleData({
            combo1Score: battle.combo1_score,
            combo2Score: battle.combo2_score,
            battleDate: battle.battle_date,
            notes: battle.notes || ''
        })
        setShowEditModal(true)
    }

    const saveEditBattle = async () => {
        if (!editingBattle) return

        try {
            setSaving(true)

            // Calculate new winner based on updated scores
            let newWinnerId = null
            if (editBattleData.combo1Score > editBattleData.combo2Score) {
                newWinnerId = editingBattle.combo1_id
            } else if (editBattleData.combo2Score > editBattleData.combo1Score) {
                newWinnerId = editingBattle.combo2_id
            }

            await updateTestBattle(editingBattle.id, {
                combo1_score: editBattleData.combo1Score,
                combo2_score: editBattleData.combo2Score,
                winner_combo_id: newWinnerId,
                battle_date: editBattleData.battleDate,
                notes: editBattleData.notes
            })

            // Refresh data
            await loadData()
            setShowEditModal(false)
            setEditingBattle(null)
        } catch (error) {
            console.error('Error updating battle:', error)
            alert('Failed to update battle')
        } finally {
            setSaving(false)
        }
    }

    const deleteBattle = async (battleId: number) => {
        if (!confirm('Are you sure you want to delete this battle? This action cannot be undone.')) {
            return
        }

        try {
            setSaving(true)
            await deleteTestBattle(battleId)
            await loadData() // Refresh data
        } catch (error) {
            console.error('Error deleting battle:', error)
            alert('Failed to delete battle. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const formatComboDisplay = (combo: ComboWithParts) => {
        const parts = []
        if (combo.blade?.name) parts.push(combo.blade.name)
        if (combo.assist_blade?.name) parts.push(combo.assist_blade.name)
        if (combo.ratchet?.name) parts.push(combo.ratchet.name)
        if (combo.bit?.name) parts.push(combo.bit.name)
        return parts.length > 0 ? parts.join(' + ') : combo.name
    }

    // Helper function to estimate finish types from total score (used for legacy battles)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getFinishTypesFromScore = (totalScore: number): Array<{ type: FinishType, count: number }> => {
        const finishes: Array<{ type: FinishType, count: number }> = []
        let remainingScore = totalScore

        if (remainingScore === 0) {
            return []
        }

        // This is a simplified estimation since we don't track individual finish types during battle
        // We'll distribute points in a reasonable way: prioritize common finishes

        // For efficiency, assume burst finishes are most common for 2+ point scores
        if (remainingScore >= 2) {
            const burstCount = Math.floor(remainingScore / 2)
            if (burstCount > 0) {
                finishes.push({ type: 'burst', count: burstCount })
                remainingScore -= burstCount * 2
            }
        }

        // Any remaining single points are spin finishes
        if (remainingScore >= 1) {
            finishes.push({ type: 'spin', count: remainingScore })
        }

        return finishes
    }

    // Helper function to parse battle details from notes
    const parseBattleDetails = (battle: TestBattleWithCombos): BattleDetails => {
        try {
            if (battle.notes && battle.notes.startsWith('{')) {
                return JSON.parse(battle.notes) as BattleDetails
            }
        } catch (error) {
            console.warn('Failed to parse battle notes:', error)
        }

        // Fallback for legacy battles
        if (battle.notes?.includes('Best of')) {
            return {
                mode: 'rounds',
                legacy: true,
                maxRounds: battle.notes.includes('Best of 3') ? 3 :
                    battle.notes.includes('Best of 5') ? 5 :
                        battle.notes.includes('Best of 7') ? 7 : 3
            }
        }

        return {
            mode: 'standard',
            legacy: true
        }
    }

    // Helper function to convert tracked finishes to count format for display
    const convertFinishesToCounts = (finishes: Array<{ type: FinishType, points: number }>): Array<{ type: FinishType, count: number }> => {
        const counts: { [key in FinishType]?: number } = {}

        finishes.forEach(finish => {
            counts[finish.type] = (counts[finish.type] || 0) + 1
        })

        return Object.entries(counts).map(([type, count]) => ({
            type: type as FinishType,
            count: count as number
        }))
    }

    // Helper function to calculate best and worst matchups for a combo
    const getMatchupStats = (comboId: number) => {
        const opponents: { [oppId: number]: { wins: number, losses: number, combo: ComboWithParts } } = {}

        // Get all battles for this combo
        battleHistory.forEach(battle => {
            const isCombo1 = battle.combo1_id === comboId
            const isCombo2 = battle.combo2_id === comboId

            if (isCombo1 || isCombo2) {
                const oppId = isCombo1 ? battle.combo2_id : battle.combo1_id
                const oppCombo = combos.find(c => c.id === oppId)

                if (oppCombo) {
                    if (!opponents[oppId]) {
                        opponents[oppId] = { wins: 0, losses: 0, combo: oppCombo }
                    }

                    if (battle.winner_combo_id === comboId) {
                        opponents[oppId].wins++
                    } else if (battle.winner_combo_id === oppId) {
                        opponents[oppId].losses++
                    }
                    // Ties don't count toward either
                }
            }
        })

        // Calculate win rates for opponents with at least 2 battles
        const validOpponents = Object.values(opponents)
            .filter(opp => opp.wins + opp.losses >= 2)
            .map(opp => ({
                combo: opp.combo,
                winRate: opp.wins / (opp.wins + opp.losses),
                battles: opp.wins + opp.losses
            }))

        const bestMatchup = validOpponents.length > 0
            ? validOpponents.reduce((best, current) =>
                current.winRate > best.winRate ? current : best
            )
            : null

        const worstMatchup = validOpponents.length > 0
            ? validOpponents.reduce((worst, current) =>
                current.winRate < worst.winRate ? current : worst
            )
            : null

        return { bestMatchup, worstMatchup }
    }

    // Helper function to toggle battle expansion
    const toggleBattleExpansion = (battleId: number) => {
        setExpandedBattles(prev => {
            const newSet = new Set(prev)
            if (newSet.has(battleId)) {
                newSet.delete(battleId)
            } else {
                newSet.add(battleId)
            }
            return newSet
        })
    }

    const startBattle = () => {
        if (selectedCombo1 && selectedCombo2 && selectedCombo1.id !== selectedCombo2.id) {
            setBattleStarted(true)
            setCombo1Score(0)
            setCombo2Score(0)
            setCurrentRound(1)
            setCombo1Rounds(0)
            setCombo2Rounds(0)
            setRoundHistory([])
            setBattleComplete(false)
            setCombo1Finishes([])
            setCombo2Finishes([])
        }
    }

    const resetBattle = () => {
        setBattleStarted(false)
        setSelectedCombo1(null)
        setSelectedCombo2(null)
        setCombo1Score(0)
        setCombo2Score(0)
        setCurrentRound(1)
        setCombo1Rounds(0)
        setCombo2Rounds(0)
        setRoundHistory([])
        setBattleComplete(false)
        setCombo1Finishes([])
        setCombo2Finishes([])
    }

    const addPoints = (comboNumber: 1 | 2, finishType: FinishType) => {
        if (battleComplete) return

        const points = {
            spin: 1,
            over: 2,
            burst: 2,
            xtreme: 3
        }[finishType]

        let newScore1 = combo1Score
        let newScore2 = combo2Score
        const newFinish = { type: finishType, points }

        if (comboNumber === 1) {
            newScore1 = combo1Score + points
            setCombo1Score(newScore1)
            // Track finish for all battle modes
            setCombo1Finishes(prev => [...prev, newFinish])
        } else {
            newScore2 = combo2Score + points
            setCombo2Score(newScore2)
            // Track finish for all battle modes
            setCombo2Finishes(prev => [...prev, newFinish])
        }

        // Check for battle completion based on mode
        checkBattleCompletion(newScore1, newScore2, comboNumber, newFinish)
    }

    const checkBattleCompletion = (score1: number, score2: number, comboNumber: 1 | 2, newFinish: { type: FinishType, points: number }) => {
        if (battleMode === 'timed') {
            // First to target score wins
            if (score1 >= targetScore || score2 >= targetScore) {
                // Use setTimeout to ensure state updates are processed first
                setTimeout(() => finishRound(score1, score2, comboNumber, newFinish), 0)
            }
        } else if (battleMode === 'rounds') {
            // First to 4 points wins a round
            if (score1 >= 4 || score2 >= 4) {
                // Use setTimeout to ensure state updates are processed first
                setTimeout(() => finishRound(score1, score2, comboNumber, newFinish), 0)
            }
        }
        // Standard mode doesn't auto-complete
    }

    const finishRound = (score1: number, score2: number, comboNumber?: 1 | 2, newFinish?: { type: FinishType, points: number }) => {
        const roundWinner = score1 > score2 ? 1 : score2 > score1 ? 2 : null

        // Capture current finishes before any state changes
        let capturedCombo1Finishes = [...combo1Finishes]
        let capturedCombo2Finishes = [...combo2Finishes]

        // If this is an auto-completion (comboNumber and newFinish provided), add the triggering finish
        if (comboNumber && newFinish) {
            if (comboNumber === 1) {
                capturedCombo1Finishes.push(newFinish)
            } else {
                capturedCombo2Finishes.push(newFinish)
            }
        }

        // Debug logging
        console.log('finishRound called:', {
            round: currentRound,
            score1,
            score2,
            capturedCombo1Finishes: capturedCombo1Finishes.length,
            capturedCombo2Finishes: capturedCombo2Finishes.length,
            autoComplete: !!comboNumber,
            triggeringCombo: comboNumber,
            triggeringFinish: newFinish?.type
        })

        // Add to round history with captured finish data
        setRoundHistory(prev => [...prev, {
            round: currentRound,
            winner: roundWinner,
            score1,
            score2,
            combo1Finishes: capturedCombo1Finishes,
            combo2Finishes: capturedCombo2Finishes
        }])

        if (battleMode === 'rounds') {
            // Update round wins
            if (roundWinner === 1) {
                setCombo1Rounds(prev => prev + 1)
            } else if (roundWinner === 2) {
                setCombo2Rounds(prev => prev + 1)
            }

            // Check if we have a series winner
            const newCombo1Rounds = combo1Rounds + (roundWinner === 1 ? 1 : 0)
            const newCombo2Rounds = combo2Rounds + (roundWinner === 2 ? 1 : 0)
            const roundsToWin = Math.ceil(maxRounds / 2)

            if (newCombo1Rounds >= roundsToWin || newCombo2Rounds >= roundsToWin || currentRound >= maxRounds) {
                setBattleComplete(true)
            } else {
                // Start next round - reset scores and finishes
                setCurrentRound(prev => prev + 1)
                setCombo1Score(0)
                setCombo2Score(0)
                setCombo1Finishes([]) // Reset finishes for new round
                setCombo2Finishes([]) // Reset finishes for new round
            }
        } else if (battleMode === 'timed') {
            setBattleComplete(true)
        }
    }

    const saveBattle = async () => {
        if (!selectedCombo1 || !selectedCombo2) return

        try {
            setSaving(true)

            // For rounds mode (Best of X), use series wins instead of current round scores
            let finalScore1, finalScore2
            if (battleMode === 'rounds') {
                finalScore1 = combo1Rounds
                finalScore2 = combo2Rounds
            } else {
                finalScore1 = combo1Score
                finalScore2 = combo2Score
            }

            // Determine winner (null if tie)
            let winnerId: number | null = null
            if (finalScore1 > finalScore2) {
                winnerId = selectedCombo1.id
            } else if (finalScore2 > finalScore1) {
                winnerId = selectedCombo2.id
            }

            // For rounds mode, accumulate all finishes from all rounds
            let allCombo1Finishes = combo1Finishes
            let allCombo2Finishes = combo2Finishes

            if (battleMode === 'rounds') {
                allCombo1Finishes = []
                allCombo2Finishes = []

                // Accumulate finishes from all completed rounds
                roundHistory.forEach(round => {
                    allCombo1Finishes.push(...round.combo1Finishes)
                    allCombo2Finishes.push(...round.combo2Finishes)
                })

                // Only add current round finishes if battle is NOT complete
                // (if battle is complete, all finishes should already be in roundHistory)
                if (!battleComplete && (combo1Finishes.length > 0 || combo2Finishes.length > 0)) {
                    allCombo1Finishes.push(...combo1Finishes)
                    allCombo2Finishes.push(...combo2Finishes)
                }

                // Debug logging to help troubleshoot
                console.log('Rounds mode save debug:', {
                    currentRound,
                    roundHistoryLength: roundHistory.length,
                    currentCombo1Finishes: combo1Finishes.length,
                    currentCombo2Finishes: combo2Finishes.length,
                    totalCombo1Finishes: allCombo1Finishes.length,
                    totalCombo2Finishes: allCombo2Finishes.length,
                    battleComplete,
                    roundHistory: roundHistory.map(r => ({ round: r.round, c1: r.combo1Finishes.length, c2: r.combo2Finishes.length }))
                })
            }

            const battleData: TestBattleCreate = {
                combo1_id: selectedCombo1.id,
                combo2_id: selectedCombo2.id,
                combo1_score: finalScore1,
                combo2_score: finalScore2,
                winner_combo_id: winnerId,
                battle_date: new Date().toISOString().split('T')[0],
                notes: battleMode === 'rounds'
                    ? JSON.stringify({
                        mode: 'rounds',
                        maxRounds,
                        roundHistory: roundHistory.map(round => ({
                            round: round.round,
                            winner: round.winner,
                            score1: round.score1,
                            score2: round.score2,
                            // Use actual tracked finishes converted to count format
                            combo1Finishes: convertFinishesToCounts(round.combo1Finishes),
                            combo2Finishes: convertFinishesToCounts(round.combo2Finishes)
                        })),
                        // Add total finishes across all rounds for summary display
                        combo1Finishes: allCombo1Finishes,
                        combo2Finishes: allCombo2Finishes
                    })
                    : battleMode === 'timed'
                        ? JSON.stringify({
                            mode: 'timed',
                            targetScore,
                            finalScore1: combo1Score,
                            finalScore2: combo2Score,
                            combo1Finishes: combo1Finishes,
                            combo2Finishes: combo2Finishes
                        })
                        : JSON.stringify({
                            mode: 'standard',
                            finalScore1: combo1Score,
                            finalScore2: combo2Score,
                            combo1Finishes: combo1Finishes,
                            combo2Finishes: combo2Finishes
                        })
            }

            await addTestBattle(battleData)

            // Reload data to update leaderboard
            await loadData()

            // Reset battle
            resetBattle()

            alert('Battle saved successfully!')
        } catch (error) {
            console.error('Error saving battle:', error)
            alert('Failed to save battle. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navigation currentPage="testing" />
                <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center flex-1">
                    <div className="text-xl text-gray-600 dark:text-gray-300">Loading testing arena...</div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
                <Navigation currentPage="testing" />
                <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex-1">
                    <div className="container mx-auto px-4 py-16">
                        <header className="text-center mb-16">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                ⚔️ Testing Arena
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                Practice battles to test your combos and find the perfect setup for tournaments.
                            </p>
                        </header>

                        <div className="max-w-6xl mx-auto">
                            {!battleStarted ? (
                                /* Combo Selection Phase */
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                                            Select Two Combos to Battle
                                        </h2>
                                    </div>

                                    {/* Battle Mode Selector */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                                            🎯 Battle Mode
                                        </h3>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            {/* Standard Mode */}
                                            <div
                                                onClick={() => setBattleMode('standard')}
                                                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${battleMode === 'standard'
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-2xl mb-2">🛡️</div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">Standard Battle</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        Free-form scoring until you decide to stop
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Timed Mode */}
                                            <div
                                                onClick={() => setBattleMode('timed')}
                                                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${battleMode === 'timed'
                                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-2xl mb-2">⏱️</div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">First to X Points</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        First combo to reach target score wins
                                                    </p>
                                                    {battleMode === 'timed' && (
                                                        <div className="mt-2">
                                                            <input
                                                                type="number"
                                                                min="3"
                                                                max="10"
                                                                value={targetScore}
                                                                onChange={(e) => setTargetScore(parseInt(e.target.value))}
                                                                className="w-16 px-2 py-1 text-center border rounded dark:bg-gray-700 dark:border-gray-600"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <span className="text-xs text-gray-500 ml-1">points</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Rounds Mode */}
                                            <div
                                                onClick={() => setBattleMode('rounds')}
                                                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${battleMode === 'rounds'
                                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-2xl mb-2">🏆</div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">Best of X Rounds</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        First to 4 points wins each round
                                                    </p>
                                                    {battleMode === 'rounds' && (
                                                        <div className="mt-2">
                                                            <select
                                                                value={maxRounds}
                                                                onChange={(e) => setMaxRounds(parseInt(e.target.value))}
                                                                className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <option value={3}>Best of 3</option>
                                                                <option value={5}>Best of 5</option>
                                                                <option value={7}>Best of 7</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {combos.length < 2 ? (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                                            <p className="text-yellow-800 dark:text-yellow-300">
                                                ⚠️ You need at least 2 combos to start testing battles.
                                                <br />
                                                <a href="/combos" className="text-yellow-600 hover:text-yellow-500 underline">
                                                    Create some combos first!
                                                </a>
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid md:grid-cols-2 gap-8">
                                                {/* Combo 1 Selection */}
                                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                                                        🔵 Combo 1
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {combos.map((combo) => (
                                                            <button
                                                                key={combo.id}
                                                                onClick={() => setSelectedCombo1(combo)}
                                                                className={`w-full p-4 rounded-lg text-left transition-colors ${selectedCombo1?.id === combo.id
                                                                    ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                                                                    : selectedCombo2?.id === combo.id
                                                                        ? 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-400 opacity-50 cursor-not-allowed'
                                                                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                                                                    }`}
                                                                disabled={selectedCombo2?.id === combo.id}
                                                            >
                                                                <p className="font-medium text-gray-900 dark:text-white">
                                                                    {combo.name}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                    {formatComboDisplay(combo)}
                                                                </p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Combo 2 Selection */}
                                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                                                        🔴 Combo 2
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {combos.map((combo) => (
                                                            <button
                                                                key={combo.id}
                                                                onClick={() => setSelectedCombo2(combo)}
                                                                className={`w-full p-4 rounded-lg text-left transition-colors ${selectedCombo2?.id === combo.id
                                                                    ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500'
                                                                    : selectedCombo1?.id === combo.id
                                                                        ? 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-400 opacity-50 cursor-not-allowed'
                                                                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                                                                    }`}
                                                                disabled={selectedCombo1?.id === combo.id}
                                                            >
                                                                <p className="font-medium text-gray-900 dark:text-white">
                                                                    {combo.name}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                    {formatComboDisplay(combo)}
                                                                </p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Start Battle Button */}
                                            <div className="text-center">
                                                <button
                                                    onClick={startBattle}
                                                    disabled={!selectedCombo1 || !selectedCombo2 || selectedCombo1.id === selectedCombo2.id}
                                                    className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg"
                                                >
                                                    ⚔️ Start Battle!
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                /* Battle Phase - Score Keeper */
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                                            {battleComplete ? '🏁 Battle Complete!' : 'Battle in Progress'}
                                        </h2>
                                        <div className="flex justify-center items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                {battleMode === 'standard' && '🛡️ Standard Mode'}
                                                {battleMode === 'timed' && `⏱️ First to ${targetScore} Points`}
                                                {battleMode === 'rounds' && `🏆 Best of ${maxRounds} - Round ${currentRound}`}
                                            </span>
                                            {battleMode === 'rounds' && (
                                                <span className="text-purple-600 dark:text-purple-400 font-medium">
                                                    Series: {combo1Rounds}-{combo2Rounds}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Score Display */}
                                    <div className="grid md:grid-cols-3 gap-6 items-center">
                                        {/* Combo 1 */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
                                            <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                                🔵 {selectedCombo1?.name}
                                            </h3>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                                                {formatComboDisplay(selectedCombo1!)}
                                            </p>
                                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                                {combo1Score}
                                            </div>
                                        </div>

                                        {/* VS Divider */}
                                        <div className="text-center">
                                            <div className="text-4xl font-bold text-gray-400 dark:text-gray-500">
                                                VS
                                            </div>
                                        </div>

                                        {/* Combo 2 */}
                                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
                                            <h3 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
                                                🔴 {selectedCombo2?.name}
                                            </h3>
                                            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                                                {formatComboDisplay(selectedCombo2!)}
                                            </p>
                                            <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                                                {combo2Score}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scoring Buttons */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                                            Add Points
                                        </h3>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Combo 1 Scoring */}
                                            <div>
                                                <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-4 text-center">
                                                    🔵 {selectedCombo1?.name}
                                                </h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => addPoints(1, 'spin')}
                                                        className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                                    >
                                                        Spin Finish<br />
                                                        <span className="text-sm">+1 point</span>
                                                    </button>
                                                    <button
                                                        onClick={() => addPoints(1, 'over')}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                                    >
                                                        Over Finish<br />
                                                        <span className="text-sm">+2 points</span>
                                                    </button>
                                                    <button
                                                        onClick={() => addPoints(1, 'burst')}
                                                        className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                                    >
                                                        Burst Finish<br />
                                                        <span className="text-sm">+2 points</span>
                                                    </button>
                                                    <button
                                                        onClick={() => addPoints(1, 'xtreme')}
                                                        className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                                    >
                                                        Xtreme Finish<br />
                                                        <span className="text-sm">+3 points</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Combo 2 Scoring */}
                                            <div>
                                                <h4 className="text-lg font-medium text-red-800 dark:text-red-300 mb-4 text-center">
                                                    🔴 {selectedCombo2?.name}
                                                </h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => addPoints(2, 'spin')}
                                                        className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                                    >
                                                        Spin Finish<br />
                                                        <span className="text-sm">+1 point</span>
                                                    </button>
                                                    <button
                                                        onClick={() => addPoints(2, 'over')}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                                    >
                                                        Over Finish<br />
                                                        <span className="text-sm">+2 points</span>
                                                    </button>
                                                    <button
                                                        onClick={() => addPoints(2, 'burst')}
                                                        className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                                    >
                                                        Burst Finish<br />
                                                        <span className="text-sm">+2 points</span>
                                                    </button>
                                                    <button
                                                        onClick={() => addPoints(2, 'xtreme')}
                                                        className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                                    >
                                                        Xtreme Finish<br />
                                                        <span className="text-sm">+3 points</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Round History for Rounds Mode */}
                                        {battleMode === 'rounds' && roundHistory.length > 0 && (
                                            <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 text-center">
                                                    📋 Round History
                                                </h4>
                                                <div className="space-y-2">
                                                    {roundHistory.map((round, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-600 rounded p-3">
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                Round {round.round}
                                                            </span>
                                                            <div className="flex items-center gap-4">
                                                                <span className={`px-2 py-1 rounded text-sm ${round.winner === 1 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                                    }`}>
                                                                    {round.score1}
                                                                </span>
                                                                <span className="text-gray-400">-</span>
                                                                <span className={`px-2 py-1 rounded text-sm ${round.winner === 2 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                                    }`}>
                                                                    {round.score2}
                                                                </span>
                                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                    {round.winner === null ? 'Tie' : `${round.winner === 1 ? selectedCombo1?.name : selectedCombo2?.name} Wins`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Battle Controls */}
                                        <div className="flex justify-center gap-4 mt-8">
                                            {battleComplete ? (
                                                <>
                                                    <button
                                                        onClick={saveBattle}
                                                        disabled={saving}
                                                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
                                                    >
                                                        {saving ? '💾 Saving...' : '💾 Save Battle'}
                                                    </button>
                                                    <button
                                                        onClick={resetBattle}
                                                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                                                    >
                                                        🔄 New Battle
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    {battleMode === 'standard' && (
                                                        <button
                                                            onClick={saveBattle}
                                                            disabled={saving || (combo1Score === 0 && combo2Score === 0)}
                                                            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
                                                        >
                                                            {saving ? '💾 Saving...' : '💾 Save Battle'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={resetBattle}
                                                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                                                    >
                                                        🔄 New Battle
                                                    </button>
                                                    {battleMode === 'standard' && (
                                                        <button
                                                            onClick={() => {
                                                                setCombo1Score(0)
                                                                setCombo2Score(0)
                                                            }}
                                                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                                                        >
                                                            ↺ Reset Scores
                                                        </button>
                                                    )}
                                                    {battleMode === 'rounds' && (
                                                        <button
                                                            onClick={() => {
                                                                setCombo1Score(0)
                                                                setCombo2Score(0)
                                                            }}
                                                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                                                        >
                                                            ↺ Reset Round
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Battle History Section */}
                            <div className="mt-16">
                                <div className="text-center mb-8">
                                    <button
                                        onClick={() => setShowHistory(!showHistory)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mr-4"
                                    >
                                        {showHistory ? '📜 Hide Battle History' : '📜 Show Battle History'}
                                    </button>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {battleHistory.length} battles recorded
                                    </span>
                                </div>

                                {showHistory && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
                                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                                            📜 Battle History
                                        </h3>

                                        {/* Filters */}
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filters</h4>
                                            <div className="grid md:grid-cols-4 gap-4">
                                                {/* Combo Filter */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Combo
                                                    </label>
                                                    <select
                                                        value={historyFilter.combo}
                                                        onChange={(e) => setHistoryFilter({ ...historyFilter, combo: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                                    >
                                                        <option value="all">All Combos</option>
                                                        {combos.map(combo => (
                                                            <option key={combo.id} value={combo.id}>
                                                                {combo.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Outcome Filter */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Outcome
                                                    </label>
                                                    <select
                                                        value={historyFilter.outcome}
                                                        onChange={(e) => setHistoryFilter({ ...historyFilter, outcome: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                                    >
                                                        <option value="all">All Outcomes</option>
                                                        <option value="wins">Wins Only</option>
                                                        <option value="losses">Losses Only</option>
                                                        <option value="ties">Ties Only</option>
                                                    </select>
                                                </div>

                                                {/* Date From */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        From Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={historyFilter.dateFrom}
                                                        onChange={(e) => setHistoryFilter({ ...historyFilter, dateFrom: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                                    />
                                                </div>

                                                {/* Date To */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        To Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={historyFilter.dateTo}
                                                        onChange={(e) => setHistoryFilter({ ...historyFilter, dateTo: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            {/* Clear Filters */}
                                            <div className="mt-4 text-center">
                                                <button
                                                    onClick={() => setHistoryFilter({ combo: 'all', outcome: 'all', dateFrom: '', dateTo: '' })}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                                                >
                                                    Clear All Filters
                                                </button>
                                            </div>
                                        </div>

                                        {/* Battle History List */}
                                        {getFilteredBattleHistory().length === 0 ? (
                                            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                                                {battleHistory.length === 0
                                                    ? "No battles recorded yet. Start testing some combos!"
                                                    : "No battles match your current filters."
                                                }
                                            </p>
                                        ) : (
                                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                                {getFilteredBattleHistory().map((battle) => {
                                                    const battleDetails = parseBattleDetails(battle)
                                                    const isExpanded = expandedBattles.has(battle.id)

                                                    return (
                                                        <div key={battle.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            {/* Main Battle Info */}
                                                            <div className="p-4">
                                                                <div className="flex flex-col md:flex-row md:items-center justify-between">
                                                                    {/* Battle Info */}
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-4 mb-2">
                                                                            {/* Combo 1 */}
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                                                                    {battle.combo1.name}
                                                                                </span>
                                                                                <span className={`px-2 py-1 rounded text-sm font-bold ${battle.winner_combo_id === battle.combo1_id
                                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                                    : battle.winner_combo_id === null
                                                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                                    }`}>
                                                                                    {battle.combo1_score}
                                                                                </span>
                                                                            </div>

                                                                            <span className="text-gray-400 font-bold">VS</span>

                                                                            {/* Combo 2 */}
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-red-600 dark:text-red-400 font-medium">
                                                                                    {battle.combo2.name}
                                                                                </span>
                                                                                <span className={`px-2 py-1 rounded text-sm font-bold ${battle.winner_combo_id === battle.combo2_id
                                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                                    : battle.winner_combo_id === null
                                                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                                    }`}>
                                                                                    {battle.combo2_score}
                                                                                </span>
                                                                            </div>

                                                                            {/* Battle Mode Badge */}
                                                                            <div className={`px-2 py-1 rounded text-xs font-medium ${battleDetails.mode === 'rounds' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                                                                battleDetails.mode === 'timed' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                                                }`}>
                                                                                {battleDetails.mode === 'rounds' ? '🏆 Rounds' :
                                                                                    battleDetails.mode === 'timed' ? '⏱️ Timed' :
                                                                                        '🛡️ Standard'}
                                                                            </div>
                                                                        </div>

                                                                        {/* Winner and Mode Info */}
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                                            {battle.winner_combo_id === null
                                                                                ? "🤝 Tie Game"
                                                                                : `🏆 Winner: ${battle.winner_combo_id === battle.combo1_id ? battle.combo1.name : battle.combo2.name}`
                                                                            }
                                                                            {battleDetails.mode === 'rounds' && !battleDetails.legacy && (
                                                                                <span className="ml-4 text-purple-600 dark:text-purple-400">
                                                                                    Best of {battleDetails.maxRounds}
                                                                                </span>
                                                                            )}
                                                                            {battleDetails.mode === 'timed' && (
                                                                                <span className="ml-4 text-orange-600 dark:text-orange-400">
                                                                                    First to {battleDetails.targetScore} points
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {/* Expand/Collapse Button */}
                                                                        {!battleDetails.legacy && (
                                                                            <button
                                                                                onClick={() => toggleBattleExpansion(battle.id)}
                                                                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                                                            >
                                                                                {isExpanded ? '🔽 Hide Details' :
                                                                                    battleDetails.mode === 'rounds' ? '▶️ Show Battle Details' :
                                                                                        battleDetails.mode === 'standard' ? '▶️ Show Finish Details' :
                                                                                            '▶️ Show Battle Details'}
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    {/* Date and Actions */}
                                                                    <div className="flex items-center gap-4 mt-2 md:mt-0">
                                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                            {new Date(battle.battle_date).toLocaleDateString()}
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.preventDefault()
                                                                                    e.stopPropagation()
                                                                                    openEditBattle(battle)
                                                                                }}
                                                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
                                                                                title="Edit Battle"
                                                                            >
                                                                                ✏️
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.preventDefault()
                                                                                    e.stopPropagation()
                                                                                    deleteBattle(battle.id)
                                                                                }}
                                                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
                                                                                title="Delete Battle"
                                                                                disabled={saving}
                                                                            >
                                                                                🗑️
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Expanded Rounds Mode Details */}
                                                            {isExpanded && battleDetails.mode === 'rounds' && (
                                                                <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-100 dark:bg-gray-800">
                                                                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                                                                        🏆 Battle Breakdown - Rounds Mode
                                                                    </h5>
                                                                    <div className="text-center mb-4">
                                                                        <div className="inline-block bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-lg border border-purple-200 dark:border-purple-800">
                                                                            <span className="text-purple-800 dark:text-purple-300 font-medium">
                                                                                🎯 Best of {battleDetails.maxRounds || 'Unknown'} • Series: {battle.combo1.name} {battle.combo1_score} - {battle.combo2_score} {battle.combo2.name}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-6">
                                                                        {/* Combo 1 Finishes */}
                                                                        <div className="space-y-3">
                                                                            <div className="font-medium text-blue-600 dark:text-blue-400 text-center">
                                                                                🔵 {battle.combo1.name}
                                                                            </div>
                                                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center">
                                                                                {battle.combo1_score} Rounds Won
                                                                            </div>
                                                                            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                                                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                                                    Total Finish Breakdown:
                                                                                </div>
                                                                                {battleDetails.combo1Finishes && battleDetails.combo1Finishes.length > 0 ? (
                                                                                    <div className="space-y-1">
                                                                                        {battleDetails.combo1Finishes.map((finish, index) => (
                                                                                            <div key={index} className="flex justify-between items-center text-sm">
                                                                                                <span className="flex items-center gap-1">
                                                                                                    {finish.type === 'spin' && '🟢 Spin Finish'}
                                                                                                    {finish.type === 'over' && '🔵 Over Finish'}
                                                                                                    {finish.type === 'burst' && '🟠 Burst Finish'}
                                                                                                    {finish.type === 'xtreme' && '🟣 Xtreme Finish'}
                                                                                                </span>
                                                                                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                                                                                    +{finish.points} pts
                                                                                                </span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                                        No finishes recorded
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Combo 2 Finishes */}
                                                                        <div className="space-y-3">
                                                                            <div className="font-medium text-red-600 dark:text-red-400 text-center">
                                                                                🔴 {battle.combo2.name}
                                                                            </div>
                                                                            <div className="text-2xl font-bold text-red-600 dark:text-red-400 text-center">
                                                                                {battle.combo2_score} Rounds Won
                                                                            </div>
                                                                            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                                                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                                                    Total Finish Breakdown:
                                                                                </div>
                                                                                {battleDetails.combo2Finishes && battleDetails.combo2Finishes.length > 0 ? (
                                                                                    <div className="space-y-1">
                                                                                        {battleDetails.combo2Finishes.map((finish, index) => (
                                                                                            <div key={index} className="flex justify-between items-center text-sm">
                                                                                                <span className="flex items-center gap-1">
                                                                                                    {finish.type === 'spin' && '🟢 Spin Finish'}
                                                                                                    {finish.type === 'over' && '🔵 Over Finish'}
                                                                                                    {finish.type === 'burst' && '🟠 Burst Finish'}
                                                                                                    {finish.type === 'xtreme' && '🟣 Xtreme Finish'}
                                                                                                </span>
                                                                                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                                                                                    +{finish.points} pts
                                                                                                </span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                                        No finishes recorded
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Expanded Standard Mode Details */}
                                                            {isExpanded && battleDetails.mode === 'standard' && (
                                                                <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-100 dark:bg-gray-800">
                                                                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                                                                        🎯 Battle Breakdown - Standard Mode
                                                                    </h5>
                                                                    <div className="grid grid-cols-2 gap-6">
                                                                        {/* Combo 1 Finishes */}
                                                                        <div className="space-y-3">
                                                                            <div className="font-medium text-blue-600 dark:text-blue-400 text-center">
                                                                                🔵 {battle.combo1.name}
                                                                            </div>
                                                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center">
                                                                                {battle.combo1_score} Points
                                                                            </div>
                                                                            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                                                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                                                    Finish Breakdown:
                                                                                </div>
                                                                                {battleDetails.combo1Finishes && battleDetails.combo1Finishes.length > 0 ? (
                                                                                    <div className="space-y-1">
                                                                                        {battleDetails.combo1Finishes.map((finish, index) => (
                                                                                            <div key={index} className="flex justify-between items-center text-sm">
                                                                                                <span className="flex items-center gap-1">
                                                                                                    {finish.type === 'spin' && '🟢 Spin Finish'}
                                                                                                    {finish.type === 'over' && '🔵 Over Finish'}
                                                                                                    {finish.type === 'burst' && '🟠 Burst Finish'}
                                                                                                    {finish.type === 'xtreme' && '🟣 Xtreme Finish'}
                                                                                                </span>
                                                                                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                                                                                    +{finish.points} pts
                                                                                                </span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                                        No finishes recorded
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Combo 2 Finishes */}
                                                                        <div className="space-y-3">
                                                                            <div className="font-medium text-red-600 dark:text-red-400 text-center">
                                                                                🔴 {battle.combo2.name}
                                                                            </div>
                                                                            <div className="text-2xl font-bold text-red-600 dark:text-red-400 text-center">
                                                                                {battle.combo2_score} Points
                                                                            </div>
                                                                            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                                                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                                                    Finish Breakdown:
                                                                                </div>
                                                                                {battleDetails.combo2Finishes && battleDetails.combo2Finishes.length > 0 ? (
                                                                                    <div className="space-y-1">
                                                                                        {battleDetails.combo2Finishes.map((finish, index) => (
                                                                                            <div key={index} className="flex justify-between items-center text-sm">
                                                                                                <span className="flex items-center gap-1">
                                                                                                    {finish.type === 'spin' && '🟢 Spin Finish'}
                                                                                                    {finish.type === 'over' && '🔵 Over Finish'}
                                                                                                    {finish.type === 'burst' && '🟠 Burst Finish'}
                                                                                                    {finish.type === 'xtreme' && '🟣 Xtreme Finish'}
                                                                                                </span>
                                                                                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                                                                                    +{finish.points} pts
                                                                                                </span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                                        No finishes recorded
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Expanded Timed Mode Details */}
                                                            {isExpanded && battleDetails.mode === 'timed' && (
                                                                <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-100 dark:bg-gray-800">
                                                                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                                                                        ⏱️ Battle Breakdown - Timed Mode
                                                                    </h5>
                                                                    <div className="text-center mb-4">
                                                                        <div className="inline-block bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-lg border border-orange-200 dark:border-orange-800">
                                                                            <span className="text-orange-800 dark:text-orange-300 font-medium">
                                                                                🎯 Target: {battleDetails.targetScore || 'Unknown'} points
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-6">
                                                                        {/* Combo 1 Finishes */}
                                                                        <div className="space-y-3">
                                                                            <div className="font-medium text-blue-600 dark:text-blue-400 text-center">
                                                                                🔵 {battle.combo1.name}
                                                                            </div>
                                                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center">
                                                                                {battle.combo1_score} Points
                                                                            </div>
                                                                            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                                                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                                                    Finish Breakdown:
                                                                                </div>
                                                                                {battleDetails.combo1Finishes && battleDetails.combo1Finishes.length > 0 ? (
                                                                                    <div className="space-y-1">
                                                                                        {battleDetails.combo1Finishes.map((finish, index) => (
                                                                                            <div key={index} className="flex justify-between items-center text-sm">
                                                                                                <span className="flex items-center gap-1">
                                                                                                    {finish.type === 'spin' && '🟢 Spin Finish'}
                                                                                                    {finish.type === 'over' && '🔵 Over Finish'}
                                                                                                    {finish.type === 'burst' && '🟠 Burst Finish'}
                                                                                                    {finish.type === 'xtreme' && '🟣 Xtreme Finish'}
                                                                                                </span>
                                                                                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                                                                                    +{finish.points} pts
                                                                                                </span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                                        No detailed finish data available
                                                                                    </div>
                                                                                )}
                                                                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                        {battleDetails.targetScore && battle.combo1_score >= battleDetails.targetScore ? '🏆 Reached target first!' :
                                                                                            battleDetails.targetScore ? `${battleDetails.targetScore - battle.combo1_score} points to target` :
                                                                                                'Target information not available'}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Combo 2 Finishes */}
                                                                        <div className="space-y-3">
                                                                            <div className="font-medium text-red-600 dark:text-red-400 text-center">
                                                                                🔴 {battle.combo2.name}
                                                                            </div>
                                                                            <div className="text-2xl font-bold text-red-600 dark:text-red-400 text-center">
                                                                                {battle.combo2_score} Points
                                                                            </div>
                                                                            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                                                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                                                    Finish Breakdown:
                                                                                </div>
                                                                                {battleDetails.combo2Finishes && battleDetails.combo2Finishes.length > 0 ? (
                                                                                    <div className="space-y-1">
                                                                                        {battleDetails.combo2Finishes.map((finish, index) => (
                                                                                            <div key={index} className="flex justify-between items-center text-sm">
                                                                                                <span className="flex items-center gap-1">
                                                                                                    {finish.type === 'spin' && '🟢 Spin Finish'}
                                                                                                    {finish.type === 'over' && '🔵 Over Finish'}
                                                                                                    {finish.type === 'burst' && '🟠 Burst Finish'}
                                                                                                    {finish.type === 'xtreme' && '🟣 Xtreme Finish'}
                                                                                                </span>
                                                                                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                                                                                    +{finish.points} pts
                                                                                                </span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                                        No detailed finish data available
                                                                                    </div>
                                                                                )}
                                                                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                        {battleDetails.targetScore && battle.combo2_score >= battleDetails.targetScore ? '🏆 Reached target first!' :
                                                                                            battleDetails.targetScore ? `${battleDetails.targetScore - battle.combo2_score} points to target` :
                                                                                                'Target information not available'}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* � Edit Battle Modal */}
                            {showEditModal && editingBattle && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                            ✏️ Edit Battle
                                        </h3>

                                        {/* Battle Info */}
                                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="text-center mb-4">
                                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                                    {editingBattle.combo1.name}
                                                </span>
                                                <span className="mx-4 text-gray-400">VS</span>
                                                <span className="text-red-600 dark:text-red-400 font-medium">
                                                    {editingBattle.combo2.name}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Score Inputs */}
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {editingBattle.combo1.name} Score
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editBattleData.combo1Score}
                                                    onChange={(e) => setEditBattleData(prev => ({
                                                        ...prev,
                                                        combo1Score: parseInt(e.target.value) || 0
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {editingBattle.combo2.name} Score
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editBattleData.combo2Score}
                                                    onChange={(e) => setEditBattleData(prev => ({
                                                        ...prev,
                                                        combo2Score: parseInt(e.target.value) || 0
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Date Input */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Battle Date
                                            </label>
                                            <input
                                                type="date"
                                                value={editBattleData.battleDate}
                                                onChange={(e) => setEditBattleData(prev => ({
                                                    ...prev,
                                                    battleDate: e.target.value
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        {/* Notes Input */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Notes (Optional)
                                            </label>
                                            <textarea
                                                value={editBattleData.notes}
                                                onChange={(e) => setEditBattleData(prev => ({
                                                    ...prev,
                                                    notes: e.target.value
                                                }))}
                                                placeholder="Add any notes about this battle..."
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setShowEditModal(false)}
                                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={saveEditBattle}
                                                disabled={saving}
                                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                                            >
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Leaderboard Section */}
                            <div className="mt-16">
                                <div className="text-center mb-8">
                                    <button
                                        onClick={() => setShowLeaderboard(!showLeaderboard)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                    >
                                        {showLeaderboard ? '📊 Hide Leaderboard' : '📊 Show Leaderboard'}
                                    </button>
                                </div>

                                {showLeaderboard && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                                            🏆 Combo Performance Leaderboard
                                        </h3>

                                        {leaderboard.length === 0 ? (
                                            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                                                No battle data yet. Start testing some combos!
                                            </p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Rank</th>
                                                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Combo</th>
                                                            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Win Rate</th>
                                                            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Battles</th>
                                                            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Best Matchup</th>
                                                            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Worst Matchup</th>
                                                            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Avg Points</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {leaderboard.map((stat, index) => {
                                                            const matchups = getMatchupStats(stat.combo_id)
                                                            return (
                                                                <tr key={stat.combo_id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                    <td className="py-4 px-4">
                                                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                                                            index === 1 ? 'bg-gray-400' :
                                                                                index === 2 ? 'bg-orange-500' :
                                                                                    'bg-gray-300 text-gray-700'
                                                                            }`}>
                                                                            {index + 1}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-4 px-4">
                                                                        <div>
                                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                                {stat.combo.name}
                                                                            </p>
                                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                {formatComboDisplay(stat.combo)}
                                                                            </p>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-4 text-center">
                                                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${stat.win_rate >= 75 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                                            stat.win_rate >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                            }`}>
                                                                            {stat.win_rate.toFixed(1)}%
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-4 px-4 text-center text-gray-900 dark:text-white">
                                                                        {stat.total_battles}
                                                                    </td>
                                                                    <td className="py-4 px-4 text-center">
                                                                        {matchups.bestMatchup ? (
                                                                            <div className="text-sm">
                                                                                <div className="font-medium text-green-600 dark:text-green-400">
                                                                                    {matchups.bestMatchup.combo.name}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">
                                                                                    {(matchups.bestMatchup.winRate * 100).toFixed(0)}% ({matchups.bestMatchup.battles} games)
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-gray-400 text-sm">Not enough data</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-4 px-4 text-center">
                                                                        {matchups.worstMatchup ? (
                                                                            <div className="text-sm">
                                                                                <div className="font-medium text-red-600 dark:text-red-400">
                                                                                    {matchups.worstMatchup.combo.name}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">
                                                                                    {(matchups.worstMatchup.winRate * 100).toFixed(0)}% ({matchups.worstMatchup.battles} games)
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-gray-400 text-sm">Not enough data</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-4 px-4 text-center">
                                                                        <div className="text-sm">
                                                                            <div className="text-green-600 dark:text-green-400">
                                                                                +{stat.average_points_scored.toFixed(1)}
                                                                            </div>
                                                                            <div className="text-red-600 dark:text-red-400">
                                                                                -{stat.average_points_against.toFixed(1)}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
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
