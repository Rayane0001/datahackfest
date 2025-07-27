// @file src/lib/ai/combat-ai.ts

import type { Fighter } from '$lib/ml/algorithms';
import type { Move } from '$lib/data/moves';
import { getMovesByAlgorithm } from '$lib/data/moves';
import { getTypeMultiplier, ALGORITHM_TYPES } from '$lib/data/type-advantages';

export type AILevel = 'easy' | 'normal' | 'hard';

export interface AIDecision {
    move: Move;
    reasoning: string;
    confidence: number;
}

export interface CombatState {
    playerFighter: Fighter;
    aiFighter: Fighter;
    playerMoves: Move[];
    aiMoves: Move[];
    playerPP: Record<string, number>;
    aiPP: Record<string, number>;
    turn: number;
    lastPlayerMove?: string;
    moveHistory: string[];
}

export class CombatAI {
    private level: AILevel;
    private personality: string;
    private decisionHistory: string[] = [];

    constructor(level: AILevel = 'normal') {
        this.level = level;
        this.personality = this.generatePersonality();
        this.decisionHistory = [];
    }

    private generatePersonality(): string {
        const personalities = {
            easy: "A rookie data scientist learning the fundamentals of ML algorithms",
            normal: "An experienced practitioner with solid understanding of algorithmic trade-offs",
            hard: "A legendary ML expert who calculates optimal strategies with mathematical precision"
        };
        return personalities[this.level];
    }

    getPersonality(): string {
        return this.personality;
    }

    selectMove(state: CombatState): AIDecision {
        // Safety check - ensure we have valid state
        if (!state.aiFighter || !state.playerFighter) {
            console.warn('Invalid combat state - missing fighters');
            return this.getDefaultMove(state);
        }

        const availableMoves = this.getAvailableMoves(state);

        if (availableMoves.length === 0) {
            console.warn('No available moves - using fallback');
            return this.getDefaultMove(state);
        }

        // Record decision attempt
        this.decisionHistory.push(`Turn ${state.turn}: Analyzing ${availableMoves.length} available moves`);

        try {
            switch (this.level) {
                case 'easy':
                    return this.selectEasyMove(state, availableMoves);
                case 'normal':
                    return this.selectNormalMove(state, availableMoves);
                case 'hard':
                    return this.selectHardMove(state, availableMoves);
                default:
                    return this.selectNormalMove(state, availableMoves);
            }
        } catch (error) {
            console.error('Error in AI move selection:', error);
            return this.getDefaultMove(state, availableMoves);
        }
    }

    private getAvailableMoves(state: CombatState): Move[] {
        return state.aiMoves.filter(move => {
            const pp = state.aiPP[move.name] || 0;
            return pp > 0;
        });
    }

    private getDefaultMove(state: CombatState, availableMoves?: Move[]): AIDecision {
        const moves = availableMoves || state.aiMoves;
        const fallbackMove = moves.length > 0 ? moves[0] : {
            name: 'Basic Attack',
            power: 40,
            accuracy: 100,
            pp: 10,
            type: 'neural',
            category: 'physical',
            description: 'A simple attack',
            educationalNote: 'Basic algorithmic operation'
        } as Move;

        return {
            move: fallbackMove,
            reasoning: "Using safe fallback strategy due to system constraints",
            confidence: 0.3
        };
    }

    private selectEasyMove(state: CombatState, availableMoves: Move[]): AIDecision {
        // Easy AI: Mostly random with slight preferences for higher power
        const weightedMoves = availableMoves.map(move => ({
            move,
            weight: Math.random() + (move.power ? move.power / 200 : 0)
        }));

        weightedMoves.sort((a, b) => b.weight - a.weight);
        const selectedMove = weightedMoves[0].move;

        const reasonings = [
            "This move looks promising!",
            "Let me try this algorithm approach!",
            "Going with intuition on this one!",
            "This seems like a good choice!",
            "Experimenting with different strategies!"
        ];

        return {
            move: selectedMove,
            reasoning: reasonings[Math.floor(Math.random() * reasonings.length)],
            confidence: Math.random() * 0.4 + 0.1 // 10-50% confidence
        };
    }

    private selectNormalMove(state: CombatState, availableMoves: Move[]): AIDecision {
        // Normal AI: Strategic thinking with type advantages and health management
        let bestMove = availableMoves[0];
        let bestScore = -1;
        let reasoning = "";

        for (const move of availableMoves) {
            let score = 0;
            let moveReasoning = "";

            // Base power consideration
            const movePower = move.power || 0;
            score += movePower * 0.4;

            // Type advantage calculation
            const aiType = ALGORITHM_TYPES[state.aiFighter.name];
            const playerType = ALGORITHM_TYPES[state.playerFighter.name];
            const typeMultiplier = getTypeMultiplier(aiType, playerType);

            if (typeMultiplier > 1.0) {
                score += 35;
                moveReasoning = `${move.name} exploits type advantage against ${playerType} algorithms!`;
            } else if (typeMultiplier < 1.0) {
                score -= 10;
                moveReasoning = `${move.name} might not be optimal against ${playerType}...`;
            } else {
                moveReasoning = `${move.name} should provide reliable performance.`;
            }

            // Health-based strategy
            const aiHealthPercent = state.aiFighter.health / state.aiFighter.maxHealth;
            const playerHealthPercent = state.playerFighter.health / state.playerFighter.maxHealth;

            // If AI is low on health, prioritize powerful moves
            if (aiHealthPercent < 0.4 && movePower > 70) {
                score += 25;
                moveReasoning = `Desperate situation - going for high impact with ${move.name}!`;
            }

            // If player is low, try to finish them
            if (playerHealthPercent < 0.3 && movePower > 60) {
                score += 30;
                moveReasoning = `Opportunity to finish with ${move.name}!`;
            }

            // PP management - don't waste powerful moves too early
            const pp = state.aiPP[move.name] || 0;
            const maxPP = move.pp;
            const ppRatio = pp / maxPP;

            if (state.turn < 4 && ppRatio < 0.4 && movePower > 80) {
                score -= 15; // Save powerful moves for later
            }

            // Accuracy consideration
            score += (move.accuracy - 85) * 0.2;

            // Avoid repetition
            const recentMoves = this.decisionHistory.slice(-3);
            if (recentMoves.some(h => h.includes(move.name))) {
                score -= 8;
                moveReasoning = `Maybe I should vary my strategy from ${move.name}...`;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
                reasoning = moveReasoning;
            }
        }

        return {
            move: bestMove,
            reasoning: reasoning || `${bestMove.name} appears to be the most strategic choice.`,
            confidence: Math.min(0.85, Math.max(0.4, bestScore / 100 + 0.4))
        };
    }

    private selectHardMove(state: CombatState, availableMoves: Move[]): AIDecision {
        // Hard AI: Advanced strategy with prediction and optimization
        let bestMove = availableMoves[0];
        let bestScore = -1;
        let reasoning = "";

        for (const move of availableMoves) {
            let score = 0;
            let moveReasoning = "";

            // Advanced damage calculation with accuracy
            const expectedDamage = (move.power || 0) * (move.accuracy / 100);
            score += expectedDamage * 0.5;

            // Advanced type effectiveness
            const aiType = ALGORITHM_TYPES[state.aiFighter.name];
            const playerType = ALGORITHM_TYPES[state.playerFighter.name];
            const typeMultiplier = getTypeMultiplier(aiType, playerType);

            score += (typeMultiplier - 1) * 60;

            // Predictive analysis
            const playerPattern = this.analyzePlayerPattern(state);
            if (playerPattern.predictedMove) {
                if (this.countersMove(move, playerPattern.predictedMove)) {
                    score += 20;
                    moveReasoning = `Pattern analysis suggests ${move.name} counters expected ${playerPattern.predictedMove.name}!`;
                }
            }

            // Advanced health management
            const aiHealthPercent = state.aiFighter.health / state.aiFighter.maxHealth;
            const playerHealthPercent = state.playerFighter.health / state.playerFighter.maxHealth;
            const healthDifference = aiHealthPercent - playerHealthPercent;

            // Risk assessment
            if (healthDifference > 0.25) {
                // Ahead - play conservatively
                if (move.category === 'status') {
                    score += 15;
                    moveReasoning = `Maintaining advantage with strategic ${move.name}!`;
                }
            } else if (healthDifference < -0.25) {
                // Behind - aggressive play
                if (move.power && move.power > 80) {
                    score += 35;
                    moveReasoning = `Aggressive comeback strategy with ${move.name}!`;
                }
            }

            // Resource optimization
            const ppEfficiency = this.calculatePPEfficiency(move, state.aiPP[move.name] || 0, move.pp, state.turn);
            score += ppEfficiency;

            // Combo potential
            const lastAIMove = this.getLastAIMove(state.moveHistory);
            if (lastAIMove && this.hasMoveSynergy(lastAIMove, move.name)) {
                score += 18;
                moveReasoning = `${move.name} creates powerful synergy with previous strategy!`;
            }

            // Endgame optimization
            if (state.turn > 6) {
                score += this.calculateEndgameValue(move, state);
            }

            // Mathematical optimization
            const expectedUtility = this.calculateMoveUtility(move, state);
            score += expectedUtility;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
                reasoning = moveReasoning;
            }
        }

        // Add mathematical reasoning for hard AI
        if (!reasoning) {
            const expectedValue = bestScore.toFixed(2);
            const confidence = Math.min(95, bestScore + 60);
            reasoning = `Optimal choice: ${bestMove.name} (EV: ${expectedValue}, Confidence: ${confidence}%). Analysis includes type effectiveness, resource management, and strategic positioning.`;
        }

        return {
            move: bestMove,
            reasoning: reasoning,
            confidence: Math.min(0.95, Math.max(0.6, bestScore / 120 + 0.6))
        };
    }

    private analyzePlayerPattern(state: CombatState): { predictedMove?: Move; confidence: number } {
        const playerMoves = state.moveHistory.filter((_, index) => index % 2 === 0);

        if (playerMoves.length < 2) {
            return { confidence: 0 };
        }

        // Simple pattern recognition
        const lastMove = playerMoves[playerMoves.length - 1];
        const secondLastMove = playerMoves[playerMoves.length - 2];

        // Check for alternating pattern
        if (playerMoves.length >= 4) {
            const fourthLastMove = playerMoves[playerMoves.length - 4];
            const thirdLastMove = playerMoves[playerMoves.length - 3];

            if (lastMove === thirdLastMove && secondLastMove === fourthLastMove) {
                const predictedMoveName = secondLastMove;
                const predictedMove = state.playerMoves.find(m => m.name === predictedMoveName);
                return { predictedMove, confidence: 0.75 };
            }
        }

        // Check for repetition pattern
        if (lastMove === secondLastMove) {
            const predictedMove = state.playerMoves.find(m => m.name === lastMove);
            return { predictedMove, confidence: 0.6 };
        }

        return { confidence: 0.25 };
    }

    private countersMove(myMove: Move, theirMove: Move): boolean {
        // Define counter relationships
        const counters: Record<string, string[]> = {
            'Dropout Defense': ['Overfitting', 'High Variance'],
            'Bootstrap Assault': ['Underfitting', 'Bias'],
            'Kernel Trick': ['Linear Models', 'Simple Patterns'],
            'Ensemble Attack': ['Single Model', 'Low Accuracy']
        };

        return counters[myMove.name]?.some(counter =>
            theirMove.name.includes(counter) || theirMove.description.includes(counter)
        ) || false;
    }

    private calculatePPEfficiency(move: Move, currentPP: number, maxPP: number, turn: number): number {
        const ppRatio = currentPP / maxPP;
        const powerToPPRatio = (move.power || 0) / maxPP;

        // Early game: conserve high-power, low-PP moves
        if (turn < 4 && ppRatio < 0.4 && move.power && move.power > 85) {
            return -8;
        }

        // Late game: use remaining PP efficiently
        if (turn > 8) {
            return ppRatio * 12;
        }

        return powerToPPRatio * 0.5;
    }

    private getLastAIMove(moveHistory: string[]): string | null {
        // AI moves are at odd indices (1, 3, 5, ...)
        for (let i = moveHistory.length - 1; i >= 0; i--) {
            if (i % 2 === 1) { // Odd index = AI move
                return moveHistory[i];
            }
        }
        return null;
    }

    private hasMoveSynergy(lastMove: string, currentMove: string): boolean {
        const synergies: Record<string, string[]> = {
            'Dropout Defense': ['Backpropagation Blast', 'Gradient Descent'],
            'Out-of-Bag Counter': ['Bootstrap Assault', 'Tree Vote'],
            'Centroid Shift': ['Cluster Bomb', 'Convergence Lock'],
            'Prior Strike': ['Likelihood Blast', 'Posterior Slam'],
            'Weak Learner Swarm': ['Residual Correction', 'AdaBoost Combo'],
            'Feature Bagging': ['Bootstrap Assault', 'Tree Vote'],
            'Gradient Descent': ['Backpropagation Blast', 'Activation Storm']
        };

        return synergies[lastMove]?.includes(currentMove) || false;
    }

    private calculateEndgameValue(move: Move, state: CombatState): number {
        const aiHealthPercent = state.aiFighter.health / state.aiFighter.maxHealth;
        const playerHealthPercent = state.playerFighter.health / state.playerFighter.maxHealth;

        // If player is very low on health, prioritize finishing moves
        if (playerHealthPercent < 0.25 && move.power && move.power > 70) {
            return 30; // High priority for finish
        }

        // If AI is low on health, avoid status moves
        if (aiHealthPercent < 0.3 && move.category === 'status') {
            return -15; // Don't waste time on status when critical
        }

        // If both are low, prioritize accuracy
        if (aiHealthPercent < 0.4 && playerHealthPercent < 0.4) {
            return (move.accuracy - 85) * 0.3;
        }

        return 0;
    }

    private calculateMoveUtility(move: Move, state: CombatState): number {
        let utility = 0;

        // Base utility from power and accuracy
        const expectedDamage = (move.power || 0) * (move.accuracy / 100);
        utility += expectedDamage * 0.1;

        // Utility from type effectiveness
        const aiType = ALGORITHM_TYPES[state.aiFighter.name];
        const playerType = ALGORITHM_TYPES[state.playerFighter.name];
        const typeMultiplier = getTypeMultiplier(aiType, playerType);
        utility += (typeMultiplier - 1) * 15;

        // PP efficiency utility
        const pp = state.aiPP[move.name] || 0;
        const ppEfficiency = pp / move.pp;
        utility += ppEfficiency * 5;

        // Category utility based on situation
        const aiHealthPercent = state.aiFighter.health / state.aiFighter.maxHealth;

        if (move.category === 'physical' && aiHealthPercent > 0.6) {
            utility += 3; // Good when healthy
        } else if (move.category === 'special' && aiHealthPercent < 0.4) {
            utility += 5; // Special moves when desperate
        } else if (move.category === 'status' && aiHealthPercent > 0.7) {
            utility += 4; // Status moves when ahead
        }

        return utility;
    }

    // Get AI commentary for educational purposes
    getCommentary(decision: AIDecision, state: CombatState): string {
        const commentaries = {
            easy: [
                "I'm still learning the ropes of ML combat!",
                "Let's see what this algorithm can do!",
                "Trial and error is how we learn!"
            ],
            normal: [
                `My analysis indicates ${decision.move.name} has strong potential here.`,
                `Based on the data patterns, this should be effective.`,
                `Considering the algorithmic matchup, this seems strategic.`
            ],
            hard: [
                `After comprehensive analysis of ${state.turn} turns of data, ${decision.move.name} maximizes expected utility.`,
                `This decision optimizes for type effectiveness, resource allocation, and strategic positioning.`,
                `My neural network predicts ${(decision.confidence * 100).toFixed(1)}% success probability for this strategy.`
            ]
        };

        const options = commentaries[this.level];
        return options[Math.floor(Math.random() * options.length)];
    }

    // Get decision history for debugging
    getDecisionHistory(): string[] {
        return [...this.decisionHistory];
    }

    // Reset for new battle
    reset(): void {
        this.decisionHistory = [];
    }
}