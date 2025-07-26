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

    constructor(level: AILevel = 'normal') {
        this.level = level;
        this.personality = this.generatePersonality();
    }

    private generatePersonality(): string {
        const personalities = {
            easy: "A rookie trainer still learning the basics of ML combat",
            normal: "An experienced data scientist with solid tactical knowledge",
            hard: "A legendary ML expert who anticipates every move with mathematical precision"
        };
        return personalities[this.level];
    }

    getPersonality(): string {
        return this.personality;
    }

    selectMove(state: CombatState): AIDecision {
        const availableMoves = this.getAvailableMoves(state);

        if (availableMoves.length === 0) {
            // Should not happen, but fallback
            return {
                move: state.aiMoves[0],
                reasoning: "No moves available - using default move",
                confidence: 0
            };
        }

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
    }

    private getAvailableMoves(state: CombatState): Move[] {
        return state.aiMoves.filter(move => {
            const pp = state.aiPP[move.name] || 0;
            return pp > 0;
        });
    }

    private selectEasyMove(state: CombatState, availableMoves: Move[]): AIDecision {
        // Easy AI: Random move selection with basic preferences
        const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];

        const reasonings = [
            "I'll try this move - it looks interesting!",
            "Random strategy is sometimes the best strategy!",
            "Let's see what this algorithm can do!",
            "Going with my gut feeling on this one!",
            "Time to experiment with different approaches!"
        ];

        return {
            move: randomMove,
            reasoning: reasonings[Math.floor(Math.random() * reasonings.length)],
            confidence: Math.random() * 0.4 + 0.1 // 10-50% confidence
        };
    }

    private selectNormalMove(state: CombatState, availableMoves: Move[]): AIDecision {
        // Normal AI: Consider type advantages, move power, and basic strategy
        let bestMove = availableMoves[0];
        let bestScore = 0;
        let reasoning = "";

        for (const move of availableMoves) {
            let score = 0;
            let moveReasoning = "";

            // Base power consideration
            score += (move.power || 0) * 0.3;

            // Type advantage
            const aiType = ALGORITHM_TYPES[state.aiFighter.name];
            const playerType = ALGORITHM_TYPES[state.playerFighter.name];
            const typeMultiplier = getTypeMultiplier(aiType, playerType);

            if (typeMultiplier > 1.0) {
                score += 30;
                moveReasoning = `${move.name} is super effective against ${playerType} algorithms!`;
            } else if (typeMultiplier < 1.0) {
                score -= 15;
                moveReasoning = `${move.name} might not be very effective...`;
            } else {
                moveReasoning = `${move.name} should deal solid damage.`;
            }

            // Health consideration
            const aiHealthPercent = state.aiFighter.health / state.aiFighter.maxHealth;
            const playerHealthPercent = state.playerFighter.health / state.playerFighter.maxHealth;

            if (aiHealthPercent < 0.3 && move.category === 'status') {
                score += 20;
                moveReasoning = `I need to use ${move.name} for strategic advantage!`;
            }

            if (playerHealthPercent < 0.3 && move.power && move.power > 80) {
                score += 25;
                moveReasoning = `Time to finish with ${move.name}!`;
            }

            // PP efficiency - don't waste high PP moves early
            const pp = state.aiPP[move.name] || 0;
            const maxPP = move.pp;
            const ppRatio = pp / maxPP;

            if (ppRatio < 0.3 && move.power && move.power > 90) {
                score -= 10; // Save powerful moves
            }

            // Avoid repetition
            if (state.moveHistory.slice(-2).includes(move.name)) {
                score -= 10;
                moveReasoning = `Maybe I should try something different than ${move.name}...`;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
                reasoning = moveReasoning;
            }
        }

        return {
            move: bestMove,
            reasoning: reasoning || `${bestMove.name} seems like a solid tactical choice.`,
            confidence: Math.min(0.9, bestScore / 100 + 0.4) // 40-90% confidence
        };
    }

    private selectHardMove(state: CombatState, availableMoves: Move[]): AIDecision {
        // Hard AI: Advanced strategy with prediction and optimization
        let bestMove = availableMoves[0];
        let bestScore = 0;
        let reasoning = "";

        for (const move of availableMoves) {
            let score = 0;
            let moveReasoning = "";

            // Advanced power calculation with accuracy
            const expectedDamage = (move.power || 0) * (move.accuracy / 100);
            score += expectedDamage * 0.4;

            // Advanced type effectiveness
            const aiType = ALGORITHM_TYPES[state.aiFighter.name];
            const playerType = ALGORITHM_TYPES[state.playerFighter.name];
            const typeMultiplier = getTypeMultiplier(aiType, playerType);

            score += (typeMultiplier - 1) * 50;

            // Predict player patterns
            const playerMovePattern = this.analyzePlayerPattern(state);
            if (playerMovePattern.predictedMove) {
                // Counter-strategy
                if (move.category === 'status' && playerMovePattern.predictedMove.category === 'physical') {
                    score += 15;
                    moveReasoning = `Predicting physical attack - using ${move.name} for counter-strategy!`;
                }
            }

            // Advanced health management
            const aiHealthPercent = state.aiFighter.health / state.aiFighter.maxHealth;
            const playerHealthPercent = state.playerFighter.health / state.playerFighter.maxHealth;
            const healthDifference = aiHealthPercent - playerHealthPercent;

            // If ahead, play conservatively
            if (healthDifference > 0.2 && move.category === 'status') {
                score += 20;
                moveReasoning = `I'm ahead - using ${move.name} for strategic control!`;
            }

            // If behind, go aggressive
            if (healthDifference < -0.2 && move.power && move.power > 85) {
                score += 30;
                moveReasoning = `I need to turn this around with ${move.name}!`;
            }

            // PP optimization - resource management
            const pp = state.aiPP[move.name] || 0;
            const maxPP = move.pp;
            const ppEfficiency = this.calculatePPEfficiency(move, pp, maxPP, state.turn);
            score += ppEfficiency;

            // Move synergy - combo potential
            const lastAIMove = state.moveHistory.slice(-2)[1]; // AI's last move
            if (lastAIMove && this.hasMoveSynergy(lastAIMove, move.name)) {
                score += 15;
                moveReasoning = `${move.name} synergizes perfectly with my previous strategy!`;
            }

            // Endgame calculation
            if (state.turn > 8) {
                score += this.calculateEndgameValue(move, state);
            }

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
                reasoning = moveReasoning;
            }
        }

        // Add mathematical reasoning for hard AI
        if (!reasoning) {
            const expectedValue = bestScore.toFixed(1);
            reasoning = `Optimal decision: ${bestMove.name} (EV: ${expectedValue}). Calculated based on type effectiveness, resource management, and strategic positioning.`;
        }

        return {
            move: bestMove,
            reasoning: reasoning,
            confidence: Math.min(0.95, bestScore / 100 + 0.6) // 60-95% confidence
        };
    }

    private analyzePlayerPattern(state: CombatState): { predictedMove?: Move; confidence: number } {
        const playerMoves = state.moveHistory.filter((_, index) => index % 2 === 0); // Player moves are even indices

        if (playerMoves.length < 2) {
            return { confidence: 0 };
        }

        // Simple pattern recognition - more sophisticated algorithms could be implemented
        const lastMove = playerMoves[playerMoves.length - 1];
        const secondLastMove = playerMoves[playerMoves.length - 2];

        // Check for alternating pattern
        if (playerMoves.length >= 4) {
            const fourthLastMove = playerMoves[playerMoves.length - 4];
            const thirdLastMove = playerMoves[playerMoves.length - 3];

            if (lastMove === thirdLastMove && secondLastMove === fourthLastMove) {
                // Alternating pattern detected
                const predictedMoveName = secondLastMove;
                const predictedMove = state.playerMoves.find(m => m.name === predictedMoveName);
                return { predictedMove, confidence: 0.7 };
            }
        }

        // Check for repetition pattern
        if (lastMove === secondLastMove) {
            const predictedMove = state.playerMoves.find(m => m.name === lastMove);
            return { predictedMove, confidence: 0.5 };
        }

        return { confidence: 0.2 };
    }

    private calculatePPEfficiency(move: Move, currentPP: number, maxPP: number, turn: number): number {
        const ppRatio = currentPP / maxPP;
        const powerToPPRatio = (move.power || 0) / maxPP;

        // Early game: conserve high-power, low-PP moves
        if (turn < 5 && ppRatio < 0.5 && move.power && move.power > 90) {
            return -5;
        }

        // Late game: use remaining PP efficiently
        if (turn > 10) {
            return ppRatio * 10;
        }

        return powerToPPRatio;
    }

    private hasMoveSynergy(lastMove: string, currentMove: string): boolean {
        const synergies: Record<string, string[]> = {
            'Dropout Defense': ['Backpropagation Blast', 'Gradient Descent'],
            'Out-of-Bag Counter': ['Bootstrap Assault', 'Tree Vote'],
            'Centroid Shift': ['Cluster Bomb', 'Convergence Lock'],
            'Prior Strike': ['Likelihood Blast', 'Posterior Slam'],
            'Weak Learner Swarm': ['Residual Correction', 'AdaBoost Combo']
        };

        return synergies[lastMove]?.includes(currentMove) || false;
    }

    private calculateEndgameValue(move: Move, state: CombatState): number {
        const aiHealthPercent = state.aiFighter.health / state.aiFighter.maxHealth;
        const playerHealthPercent = state.playerFighter.health / state.playerFighter.maxHealth;

        // If either player is low on health, prioritize finishing moves
        if (playerHealthPercent < 0.3 && move.power && move.power > 80) {
            return 25; // Go for the finish
        }

        if (aiHealthPercent < 0.3 && move.category === 'status') {
            return -10; // Don't waste turns on status when low
        }

        return 0;
    }

    // Get AI commentary for educational purposes
    getCommentary(decision: AIDecision, state: CombatState): string {
        const commentaries = {
            easy: [
                "I'm still learning, but I think this might work!",
                "Let's see what happens with this approach!",
                "Trial and error is part of the learning process!"
            ],
            normal: [
                `Based on the data, ${decision.move.name} should be effective here.`,
                `My analysis suggests this is the optimal choice.`,
                `Considering the type matchup, this seems strategic.`
            ],
            hard: [
                `After calculating expected values and analyzing patterns, ${decision.move.name} maximizes our win probability.`,
                `This decision factors in resource management, type effectiveness, and strategic positioning.`,
                `My neural network predicts this move has the highest success rate given current game state.`
            ]
        };

        const options = commentaries[this.level];
        return options[Math.floor(Math.random() * options.length)];
    }
}