'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getAllCombos, addTestBattle, getComboTestStats, getAllTestBattles, updateTestBattle, deleteTestBattle } from '@/services/database'
import type { ComboWithParts, FinishType, ComboTestStats, TestBattleCreate, TestBattleWithCombos } from '@/types/beyblade'

export default function Testing() {
    const [combos, setCombos] = useState<ComboWithParts[]>([])
    const [loading, setLoading] = useState(true)
    const [leaderboard, setLeaderboard] = useState<ComboTestStats[]>([])
    const [showLeaderboard, setShowLeaderboard] = useState(false)

    // Battle History state
    const [battleHistory, setBattleHistory] = useState<TestBattleWithCombos[]>([])
    const [showHistory, setShowHistory] = useState(false)
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

    // Analytics state
    const [showAnalytics, setShowAnalytics] = useState(false)

    // 🚀 PHASE 3C: Smart Recommendations & Tournament Integration state
    const [showRecommendations, setShowRecommendations] = useState(false)
    // const [practiceGoals, setPracticeGoals] = useState<Array<{
    //     id: string
    //     type: 'winStreak' | 'winRate' | 'beatSpecific' | 'tournament'
    //     target: number | string
    //     current: number
    //     completed: boolean
    //     combo?: ComboWithParts
    // }>>([])
    // Battle setup state
    const [selectedCombo1, setSelectedCombo1] = useState<ComboWithParts | null>(null)
    const [selectedCombo2, setSelectedCombo2] = useState<ComboWithParts | null>(null)
    const [battleStarted, setBattleStarted] = useState(false)

    // Score tracking state
    const [combo1Score, setCombo1Score] = useState(0)
    const [combo2Score, setCombo2Score] = useState(0)
    const [saving, setSaving] = useState(false)

    // Advanced Battle Features state
    const [battleMode, setBattleMode] = useState<'standard' | 'timed' | 'rounds'>('standard')
    const [targetScore, setTargetScore] = useState(5) // For timed battles
    const [currentRound, setCurrentRound] = useState(1)
    const [maxRounds, setMaxRounds] = useState(3) // Best of 3
    const [combo1Rounds, setCombo1Rounds] = useState(0)
    const [combo2Rounds, setCombo2Rounds] = useState(0)
    const [roundHistory, setRoundHistory] = useState<Array<{ round: number, winner: number | null, score1: number, score2: number }>>([])
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

    // 🔥 PHASE 3B: ADVANCED ANALYTICS FUNCTIONS 🔥

    // Win Streak Tracking
    const getWinStreaks = () => {
        const streaks: { [comboId: number]: { current: number, longest: number, combo: ComboWithParts } } = {}

        // Sort battles by date to track chronological streaks
        const sortedBattles = [...battleHistory].sort((a, b) =>
            new Date(a.battle_date).getTime() - new Date(b.battle_date).getTime()
        )

        combos.forEach(combo => {
            streaks[combo.id] = { current: 0, longest: 0, combo }
        })

        sortedBattles.forEach(battle => {
            if (battle.winner_combo_id) {
                // Winner gets streak extended
                streaks[battle.winner_combo_id].current++
                streaks[battle.winner_combo_id].longest = Math.max(
                    streaks[battle.winner_combo_id].longest,
                    streaks[battle.winner_combo_id].current
                )

                // Loser gets streak reset
                const loserId = battle.combo1_id === battle.winner_combo_id ? battle.combo2_id : battle.combo1_id
                streaks[loserId].current = 0
            } else {
                // Tie resets both streaks
                streaks[battle.combo1_id].current = 0
                streaks[battle.combo2_id].current = 0
            }
        })

        return Object.values(streaks).sort((a, b) => b.current - a.current)
    }

    // Performance Trends (last 10 battles)
    const getPerformanceTrends = () => {
        const trends: { [comboId: number]: { wins: number[], winRate: number, trend: string, combo: ComboWithParts } } = {}

        combos.forEach(combo => {
            const comboHistory = battleHistory
                .filter(battle => battle.combo1_id === combo.id || battle.combo2_id === combo.id)
                .sort((a, b) => new Date(b.battle_date).getTime() - new Date(a.battle_date).getTime())
                .slice(0, 10) // Last 10 battles

            const wins = comboHistory.map(battle => battle.winner_combo_id === combo.id ? 1 : 0)
            const winRate = wins.length > 0 ? (wins.reduce((a: number, b: number) => a + b, 0) / wins.length) * 100 : 0

            let trend = 'stable'
            if (wins.length >= 5) {
                const recent = wins.slice(0, 5).reduce((a: number, b: number) => a + b, 0) / 5
                const older = wins.slice(5).reduce((a: number, b: number) => a + b, 0) / (wins.length - 5)
                if (recent > older + 0.2) trend = 'improving'
                else if (recent < older - 0.2) trend = 'declining'
            }

            trends[combo.id] = { wins, winRate, trend, combo }
        })

        return Object.values(trends).sort((a, b) => b.winRate - a.winRate)
    }

    // Head-to-head Analysis
    const getHeadToHeadStats = () => {
        const h2h: { [key: string]: { combo1: ComboWithParts, combo2: ComboWithParts, battles: number, combo1Wins: number, combo2Wins: number, ties: number } } = {}

        battleHistory.forEach(battle => {
            const key = `${Math.min(battle.combo1_id, battle.combo2_id)}-${Math.max(battle.combo1_id, battle.combo2_id)}`

            if (!h2h[key]) {
                const combo1 = combos.find(c => c.id === Math.min(battle.combo1_id, battle.combo2_id))!
                const combo2 = combos.find(c => c.id === Math.max(battle.combo1_id, battle.combo2_id))!
                h2h[key] = { combo1, combo2, battles: 0, combo1Wins: 0, combo2Wins: 0, ties: 0 }
            }

            h2h[key].battles++

            if (battle.winner_combo_id === null) {
                h2h[key].ties++
            } else if (battle.winner_combo_id === Math.min(battle.combo1_id, battle.combo2_id)) {
                h2h[key].combo1Wins++
            } else {
                h2h[key].combo2Wins++
            }
        })

        return Object.values(h2h).filter(stat => stat.battles >= 2).sort((a, b) => b.battles - a.battles)
    }

    // Weakness/Strength Matrix
    const getStrengthWeaknessMatrix = () => {
        const matrix: { [comboId: number]: { combo: ComboWithParts, strengths: ComboWithParts[], weaknesses: ComboWithParts[], dominance: number } } = {}

        combos.forEach(combo => {
            const opponents: { [oppId: number]: { wins: number, losses: number, combo: ComboWithParts } } = {}

            battleHistory.forEach(battle => {
                const isCombo1 = battle.combo1_id === combo.id
                const isCombo2 = battle.combo2_id === combo.id

                if (isCombo1 || isCombo2) {
                    const oppId = isCombo1 ? battle.combo2_id : battle.combo1_id
                    const oppCombo = combos.find(c => c.id === oppId)!

                    if (!opponents[oppId]) {
                        opponents[oppId] = { wins: 0, losses: 0, combo: oppCombo }
                    }

                    if (battle.winner_combo_id === combo.id) {
                        opponents[oppId].wins++
                    } else if (battle.winner_combo_id === oppId) {
                        opponents[oppId].losses++
                    }
                }
            })

            const strengths = Object.values(opponents)
                .filter(opp => opp.wins + opp.losses >= 2 && opp.wins > opp.losses)
                .map(opp => opp.combo)

            const weaknesses = Object.values(opponents)
                .filter(opp => opp.wins + opp.losses >= 2 && opp.losses > opp.wins)
                .map(opp => opp.combo)

            const totalWins = Object.values(opponents).reduce((sum, opp) => sum + opp.wins, 0)
            const totalLosses = Object.values(opponents).reduce((sum, opp) => sum + opp.losses, 0)
            const dominance = totalWins + totalLosses > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 0

            matrix[combo.id] = { combo, strengths, weaknesses, dominance }
        })

        return Object.values(matrix).sort((a, b) => b.dominance - a.dominance)
    }

    // 🚀 PHASE 3C: SMART RECOMMENDATIONS & TOURNAMENT INTEGRATION FUNCTIONS 🚀

    // AI-Powered Combo Recommendations
    const getSmartRecommendations = () => {
        const recommendations: Array<{
            type: 'topPerformer' | 'underrated' | 'counter' | 'experimental' | 'balanced'
            combo: ComboWithParts
            reason: string
            confidence: number
            stats?: { wins: number[], winRate: number, trend: string, combo: ComboWithParts }
        }> = []

        const trends = getPerformanceTrends()
        // const streaks = getWinStreaks() // Currently unused in recommendations logic
        const matrix = getStrengthWeaknessMatrix()

        // Top Performer Recommendations
        const topPerformers = trends.filter(t => t.winRate >= 70).slice(0, 2)
        topPerformers.forEach(performer => {
            recommendations.push({
                type: 'topPerformer',
                combo: performer.combo,
                reason: `Dominating with ${performer.winRate.toFixed(1)}% win rate and ${performer.trend} trend`,
                confidence: Math.min(95, performer.winRate + 10),
                stats: performer
            })
        })

        // Underrated Gems (good performance but low usage)
        const underratedCombos = combos.filter(combo => {
            const comboTrend = trends.find(t => t.combo.id === combo.id)
            const comboBattles = battleHistory.filter(b => b.combo1_id === combo.id || b.combo2_id === combo.id).length
            return comboTrend && comboTrend.winRate >= 60 && comboBattles < 5
        }).slice(0, 2)

        underratedCombos.forEach(combo => {
            const trend = trends.find(t => t.combo.id === combo.id)!
            recommendations.push({
                type: 'underrated',
                combo,
                reason: `Hidden gem with ${trend.winRate.toFixed(1)}% win rate but only ${battleHistory.filter(b => b.combo1_id === combo.id || b.combo2_id === combo.id).length} battles tested`,
                confidence: trend.winRate,
                stats: trend
            })
        })

        // Counter Recommendations (based on recent losses)
        const recentLosers = battleHistory
            .sort((a, b) => new Date(b.battle_date).getTime() - new Date(a.battle_date).getTime())
            .slice(0, 10)
            .filter(battle => battle.winner_combo_id !== null)

        if (recentLosers.length > 0) {
            const lostToCombos = recentLosers.map(battle => battle.winner_combo_id!).filter(Boolean)
            const mostTroublesome = lostToCombos.reduce((acc, comboId) => {
                acc[comboId] = (acc[comboId] || 0) + 1
                return acc
            }, {} as { [key: number]: number })

            const biggestThreat = Object.entries(mostTroublesome)
                .sort(([, a], [, b]) => b - a)[0]

            if (biggestThreat) {
                const threatCombo = combos.find(c => c.id === parseInt(biggestThreat[0]))
                const counters = matrix.find(m => m.combo.id === parseInt(biggestThreat[0]))?.weaknesses || []

                if (threatCombo && counters.length > 0) {
                    recommendations.push({
                        type: 'counter',
                        combo: counters[0],
                        reason: `Perfect counter to ${threatCombo.name} which has been dominating recent battles`,
                        confidence: 85
                    })
                }
            }
        }

        // Experimental Recommendations (least tested combos with potential)
        const experimentalCombos = combos.filter(combo => {
            const battles = battleHistory.filter(b => b.combo1_id === combo.id || b.combo2_id === combo.id).length
            return battles < 3
        }).slice(0, 2)

        experimentalCombos.forEach(combo => {
            recommendations.push({
                type: 'experimental',
                combo,
                reason: 'Untested combo with high potential - perfect for experimentation',
                confidence: 50
            })
        })

        // Balanced Team Recommendations (for tournament decks)
        const balanced = trends.filter(t => t.winRate >= 50 && t.winRate <= 75).slice(0, 2)
        balanced.forEach(performer => {
            recommendations.push({
                type: 'balanced',
                combo: performer.combo,
                reason: `Solid and reliable with ${performer.winRate.toFixed(1)}% win rate - great for tournament decks`,
                confidence: performer.winRate,
                stats: performer
            })
        })

        return recommendations.slice(0, 6) // Top 6 recommendations
    }

    // Tournament Deck Builder with Part Uniqueness Validation
    // This section has been moved to the dedicated tournaments page with enhanced features.
    // Generate practice goals for improving performance
    const generatePracticeGoals = () => {
        const streaks = getWinStreaks()
        const trends = getPerformanceTrends()
        const goals: Array<{
            id: string
            type: 'winStreak' | 'winRate' | 'beatSpecific' | 'tournament'
            target: number | string
            current: number
            completed: boolean
            combo?: ComboWithParts
            description: string
        }> = []

        // Win Streak Goals
        const topStreaker = streaks[0]
        if (topStreaker && topStreaker.current < 5) {
            goals.push({
                id: `streak-${topStreaker.combo.id}`,
                type: 'winStreak',
                target: topStreaker.current + 3,
                current: topStreaker.current,
                completed: false,
                combo: topStreaker.combo,
                description: `Achieve a ${topStreaker.current + 3} win streak with ${topStreaker.combo.name}`
            })
        }

        // Win Rate Goals
        const improvableCombos = trends.filter(t => t.winRate < 70 && t.winRate > 30)
        if (improvableCombos.length > 0) {
            const target = improvableCombos[0]
            goals.push({
                id: `winrate-${target.combo.id}`,
                type: 'winRate',
                target: Math.ceil(target.winRate / 10) * 10 + 10, // Round up to next 10%
                current: Math.round(target.winRate),
                completed: false,
                combo: target.combo,
                description: `Improve ${target.combo.name}'s win rate to ${Math.ceil(target.winRate / 10) * 10 + 10}%`
            })
        }

        // Beat Specific Opponent Goals
        const matrix = getStrengthWeaknessMatrix()
        const comboWithWeaknesses = matrix.find(m => m.weaknesses.length > 0)
        if (comboWithWeaknesses && comboWithWeaknesses.weaknesses.length > 0) {
            goals.push({
                id: `beat-${comboWithWeaknesses.combo.id}-${comboWithWeaknesses.weaknesses[0].id}`,
                type: 'beatSpecific',
                target: comboWithWeaknesses.weaknesses[0].name,
                current: 0,
                completed: false,
                combo: comboWithWeaknesses.combo,
                description: `Train ${comboWithWeaknesses.combo.name} to beat ${comboWithWeaknesses.weaknesses[0].name}`
            })
        }

        // Tournament Preparation Goal
        goals.push({
            id: 'tournament-prep',
            type: 'tournament',
            target: 'Ready for tournament',
            current: Math.min(trends.filter(t => t.winRate >= 60).length, 3),
            completed: trends.filter(t => t.winRate >= 60).length >= 3,
            description: 'Have 3 combos with 60%+ win rate ready for tournament'
        })

        return goals
    }

    // Promote Battle to Tournament
    // const promoteBattleToTournament = (battle: TestBattleWithCombos) => {
    //     // This would integrate with the tournament system
    //     console.log('Promoting battle to tournament:', battle)
    //     // Implementation would depend on tournament system structure
    // }

    // 🔧 Edit Battle Functions
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

        if (comboNumber === 1) {
            newScore1 = combo1Score + points
            setCombo1Score(newScore1)
        } else {
            newScore2 = combo2Score + points
            setCombo2Score(newScore2)
        }

        // Check for battle completion based on mode
        setTimeout(() => {
            checkBattleCompletion(newScore1, newScore2)
        }, 100)
    }

    const checkBattleCompletion = (score1: number, score2: number) => {
        if (battleMode === 'timed') {
            // First to target score wins
            if (score1 >= targetScore || score2 >= targetScore) {
                finishRound(score1, score2)
            }
        } else if (battleMode === 'rounds') {
            // First to 4 points wins a round
            if (score1 >= 4 || score2 >= 4) {
                finishRound(score1, score2)
            }
        }
        // Standard mode doesn't auto-complete
    }

    const finishRound = (score1: number, score2: number) => {
        const roundWinner = score1 > score2 ? 1 : score2 > score1 ? 2 : null

        // Add to round history
        setRoundHistory(prev => [...prev, {
            round: currentRound,
            winner: roundWinner,
            score1,
            score2
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
                // Start next round
                setCurrentRound(prev => prev + 1)
                setCombo1Score(0)
                setCombo2Score(0)
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

            const battleData: TestBattleCreate = {
                combo1_id: selectedCombo1.id,
                combo2_id: selectedCombo2.id,
                combo1_score: finalScore1,
                combo2_score: finalScore2,
                winner_combo_id: winnerId,
                battle_date: new Date().toISOString().split('T')[0],
                notes: battleMode === 'rounds' ? `Best of ${maxRounds} series` : ''
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
                                                        First to 3 points wins each round
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
                                                {getFilteredBattleHistory().map((battle) => (
                                                    <div key={battle.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
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
                                                                </div>

                                                                {/* Winner */}
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {battle.winner_combo_id === null
                                                                        ? "🤝 Tie Game"
                                                                        : `🏆 Winner: ${battle.winner_combo_id === battle.combo1_id ? battle.combo1.name : battle.combo2.name}`
                                                                    }
                                                                </div>
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
                                                ))}
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

                            {/* �🔥 PHASE 3B: ADVANCED ANALYTICS SECTION 🔥 */}
                            <div className="mt-16">
                                <div className="text-center mb-8">
                                    <button
                                        onClick={() => setShowAnalytics(!showAnalytics)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mr-4"
                                    >
                                        {showAnalytics ? '📈 Hide Analytics Dashboard' : '📈 Show Analytics Dashboard'}
                                    </button>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Advanced performance insights
                                    </span>
                                </div>

                                {showAnalytics && (
                                    <div className="space-y-8">
                                        {/* Win Streaks Section */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                                                🔥 Win Streak Tracker
                                            </h3>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Current Streaks */}
                                                <div>
                                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Current Streaks</h4>
                                                    <div className="space-y-3">
                                                        {getWinStreaks().slice(0, 5).map((streak, index) => (
                                                            <div key={streak.combo.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                                <div>
                                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                                        {index === 0 && streak.current > 0 && "🏆 "}
                                                                        {streak.combo.name}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {formatComboDisplay(streak.combo)}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`text-2xl font-bold ${streak.current > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                                                        {streak.current}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {streak.current === 1 ? 'win' : 'wins'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Longest Streaks */}
                                                <div>
                                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Longest Streaks (All Time)</h4>
                                                    <div className="space-y-3">
                                                        {getWinStreaks().sort((a, b) => b.longest - a.longest).slice(0, 5).map((streak, index) => (
                                                            <div key={`longest-${streak.combo.id}`} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                                <div>
                                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                                        {index === 0 && streak.longest > 0 && "👑 "}
                                                                        {streak.combo.name}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {formatComboDisplay(streak.combo)}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`text-2xl font-bold ${streak.longest > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                                                                        {streak.longest}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">record</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Performance Trends Section */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                                                📈 Performance Trends (Last 10 Battles)
                                            </h3>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {getPerformanceTrends().map((trend) => (
                                                    <div key={trend.combo.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                                {trend.combo.name}
                                                            </h4>
                                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${trend.trend === 'improving' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                                trend.trend === 'declining' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                                    'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                                                                }`}>
                                                                {trend.trend === 'improving' ? '📈' : trend.trend === 'declining' ? '📉' : '➡️'} {trend.trend}
                                                            </div>
                                                        </div>

                                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                            {formatComboDisplay(trend.combo)}
                                                        </div>

                                                        <div className="mb-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">Win Rate</span>
                                                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                                    {trend.winRate.toFixed(1)}%
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${trend.winRate}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>

                                                        {/* Recent Battle Results */}
                                                        <div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recent Results</div>
                                                            <div className="flex gap-1">
                                                                {trend.wins.map((win, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className={`w-6 h-6 rounded text-xs flex items-center justify-center font-medium ${win ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                                                            }`}
                                                                    >
                                                                        {win ? 'W' : 'L'}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Head-to-Head Analysis Section */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                                                ⚔️ Head-to-Head Analysis
                                            </h3>
                                            <div className="space-y-4">
                                                {getHeadToHeadStats().map((h2h) => (
                                                    <div key={`${h2h.combo1.id}-${h2h.combo2.id}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            {/* Combo 1 */}
                                                            <div className="text-center">
                                                                <div className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                                                                    {h2h.combo1.name}
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                                    {formatComboDisplay(h2h.combo1)}
                                                                </div>
                                                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                                    {h2h.combo1Wins}
                                                                </div>
                                                                <div className="text-sm text-gray-500">wins</div>
                                                            </div>

                                                            {/* VS and Stats */}
                                                            <div className="text-center md:border-l border-gray-200 dark:border-gray-600">
                                                                <div className="font-medium text-red-600 dark:text-red-400 mb-2">
                                                                    {h2h.combo2.name}
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                                    {formatComboDisplay(h2h.combo2)}
                                                                </div>
                                                                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                                                    {h2h.combo2Wins}
                                                                </div>
                                                                <div className="text-sm text-gray-500">wins</div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600 text-center">
                                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                                <div>
                                                                    <div className="font-medium text-gray-900 dark:text-white">{h2h.battles}</div>
                                                                    <div className="text-gray-500">Total Battles</div>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900 dark:text-white">{h2h.ties}</div>
                                                                    <div className="text-gray-500">Ties</div>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                                        {h2h.battles > 0 ? ((Math.max(h2h.combo1Wins, h2h.combo2Wins) / h2h.battles) * 100).toFixed(1) : 0}%
                                                                    </div>
                                                                    <div className="text-gray-500">Dominance</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {getHeadToHeadStats().length === 0 && (
                                                    <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                                                        No head-to-head data yet. Need at least 2 battles between combos to show analysis.
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Strength/Weakness Matrix Section */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                                                🎯 Strength & Weakness Matrix
                                            </h3>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {getStrengthWeaknessMatrix().map((matrix) => (
                                                    <div key={matrix.combo.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                                                        <div className="text-center mb-4">
                                                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                                {matrix.combo.name}
                                                            </h4>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                                {formatComboDisplay(matrix.combo)}
                                                            </div>
                                                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                                {matrix.dominance.toFixed(1)}%
                                                            </div>
                                                            <div className="text-sm text-gray-500">Overall Dominance</div>
                                                        </div>

                                                        {/* Strengths */}
                                                        <div className="mb-4">
                                                            <div className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                                                                💪 Strengths ({matrix.strengths.length})
                                                            </div>
                                                            {matrix.strengths.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {matrix.strengths.slice(0, 3).map((strength) => (
                                                                        <div key={strength.id} className="text-xs text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 rounded px-2 py-1">
                                                                            {strength.name}
                                                                        </div>
                                                                    ))}
                                                                    {matrix.strengths.length > 3 && (
                                                                        <div className="text-xs text-gray-500">
                                                                            +{matrix.strengths.length - 3} more
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-gray-500">No clear strengths yet</div>
                                                            )}
                                                        </div>

                                                        {/* Weaknesses */}
                                                        <div>
                                                            <div className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                                                                🎯 Weaknesses ({matrix.weaknesses.length})
                                                            </div>
                                                            {matrix.weaknesses.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {matrix.weaknesses.slice(0, 3).map((weakness) => (
                                                                        <div key={weakness.id} className="text-xs text-gray-600 dark:text-gray-400 bg-red-50 dark:bg-red-900/20 rounded px-2 py-1">
                                                                            {weakness.name}
                                                                        </div>
                                                                    ))}
                                                                    {matrix.weaknesses.length > 3 && (
                                                                        <div className="text-xs text-gray-500">
                                                                            +{matrix.weaknesses.length - 3} more
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-gray-500">No clear weaknesses yet</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 🚀 PHASE 3C: SMART RECOMMENDATIONS & TOURNAMENT INTEGRATION 🚀 */}
                            <div className="mt-16">
                                <div className="text-center mb-8">
                                    <button
                                        onClick={() => setShowRecommendations(!showRecommendations)}
                                        className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 mr-4"
                                    >
                                        {showRecommendations ? '🤖 Hide AI Recommendations' : '🤖 Show AI Recommendations'}
                                    </button>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        AI-powered insights & tournament tools
                                    </span>
                                </div>

                                {showRecommendations && (
                                    <div className="space-y-8">
                                        {/* Smart Combo Recommendations */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                                                🧠 AI-Powered Combo Recommendations
                                            </h3>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {getSmartRecommendations().map((rec, index) => (
                                                    <div key={`${rec.type}-${rec.combo.id}-${index}`} className={`rounded-lg p-6 border-l-4 ${rec.type === 'topPerformer' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                                                        rec.type === 'underrated' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                                                            rec.type === 'counter' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                                                                rec.type === 'experimental' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
                                                                    'bg-purple-50 dark:bg-purple-900/20 border-purple-500'
                                                        }`}>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${rec.type === 'topPerformer' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                                                                rec.type === 'underrated' ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' :
                                                                    rec.type === 'counter' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
                                                                        rec.type === 'experimental' ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200' :
                                                                            'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200'
                                                                }`}>
                                                                {rec.type === 'topPerformer' && '🏆 Top Performer'}
                                                                {rec.type === 'underrated' && '💎 Hidden Gem'}
                                                                {rec.type === 'counter' && '⚔️ Counter Pick'}
                                                                {rec.type === 'experimental' && '🧪 Experimental'}
                                                                {rec.type === 'balanced' && '⚖️ Balanced'}
                                                            </div>
                                                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                {rec.confidence.toFixed(0)}% confidence
                                                            </div>
                                                        </div>

                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                            {rec.combo.name}
                                                        </h4>

                                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                            {formatComboDisplay(rec.combo)}
                                                        </div>

                                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                                            {rec.reason}
                                                        </p>

                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setSelectedCombo1(rec.combo)}
                                                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition-colors"
                                                            >
                                                                Test as Player 1
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedCombo2(rec.combo)}
                                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded transition-colors"
                                                            >
                                                                Test as Player 2
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {getSmartRecommendations().length === 0 && (
                                                    <div className="col-span-full text-center py-8 text-gray-600 dark:text-gray-300">
                                                        Need more battle data to generate AI recommendations. Start testing combos!
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Practice Goals */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                                                🎯 Practice Goals & Training Objectives
                                            </h3>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                {generatePracticeGoals().map((goal) => (
                                                    <div key={goal.id} className={`rounded-lg p-6 border-l-4 ${goal.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'}`}>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${goal.completed ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'}`}>
                                                                {goal.type === 'winStreak' && '🔥 Win Streak'}
                                                                {goal.type === 'winRate' && '📈 Win Rate'}
                                                                {goal.type === 'beatSpecific' && '⚔️ Counter Training'}
                                                                {goal.type === 'tournament' && '🏆 Tournament Prep'}
                                                            </div>
                                                            <div className={`text-sm font-medium ${goal.completed ? 'text-green-600' : 'text-blue-600'}`}>
                                                                {goal.completed ? '✅ Complete!' : 'In Progress'}
                                                            </div>
                                                        </div>

                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                            {goal.description}
                                                        </h4>

                                                        {goal.combo && (
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                                Combo: {formatComboDisplay(goal.combo)}
                                                            </div>
                                                        )}

                                                        {goal.type !== 'tournament' && (
                                                            <div className="mb-4">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {goal.current} / {goal.target}
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                                    <div
                                                                        className={`h-2 rounded-full transition-all duration-300 ${goal.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                                                                        style={{ width: `${Math.min(100, (goal.current / (typeof goal.target === 'number' ? goal.target : 1)) * 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {goal.combo && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => setSelectedCombo1(goal.combo!)}
                                                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition-colors"
                                                                >
                                                                    Practice Now
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

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
                                                            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">W/L</th>
                                                            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Avg Points</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {leaderboard.map((stat, index) => (
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
                                                                <td className="py-4 px-4 text-center text-gray-900 dark:text-white">
                                                                    <span className="text-green-600 dark:text-green-400">{stat.wins}</span>
                                                                    /
                                                                    <span className="text-red-600 dark:text-red-400">{stat.losses}</span>
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
                                                        ))}
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
