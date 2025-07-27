// @file src/lib/data/combat-messages.ts

export interface CombatMessage {
    message: string;
    educational?: string;
    type: 'attack' | 'miss' | 'critical' | 'super_effective' | 'not_effective' | 'status' | 'info';
}

export function generateAttackMessage(
    attackerName: string,
    moveName: string,
    damage: number,
    effectiveness: number,
    isCritical: boolean,
    missed: boolean
): CombatMessage {
    if (missed) {
        return {
            message: `💨 ${attackerName}'s ${moveName} missed!`,
            educational: "High bias: model too simple, underfits data patterns",
            type: 'miss'
        };
    }

    let message = `⚔️ ${attackerName} uses ${moveName}`;
    let educational = getDetailedEducationalNote(moveName);
    let type: CombatMessage['type'] = 'attack';

    if (isCritical) {
        message += ` - CRITICAL HIT`;
        educational = "Perfect hyperparameter tuning: learning rate, regularization optimal!";
        type = 'critical';
    }

    if (effectiveness > 1.2) {
        message += ` - SUPER EFFECTIVE`;
        educational = "Algorithm-data match: CNN for images, RNN for sequences, SVM for small datasets";
        type = 'super_effective';
    } else if (effectiveness < 0.9) {
        message += ` - not very effective`;
        educational = "Algorithm mismatch: linear model on non-linear data, deep learning on small dataset";
        type = 'not_effective';
    }

    message += `! ${damage} damage!`;
    return { message, educational, type };
}

export function generateStatusMessage(
    targetName: string,
    statusEffect: string,
    applied: boolean
): CombatMessage {
    if (applied) {
        const messages: Record<string, { message: string; educational: string }> = {
            overfitting: {
                message: `${targetName} is overfitting!`,
                educational: "Memorizes training data, fails on new examples"
            },
            underfitting: {
                message: `${targetName} is underfitting!`,
                educational: "Model too simple for data patterns"
            },
            'curse-dimensionality': {
                message: `${targetName} suffers curse of dimensionality!`,
                educational: "Too many features, sparse data distribution"
            },
            'data-leakage': {
                message: `${targetName} has data leakage!`,
                educational: "Future info leaked into training"
            }
        };

        const statusInfo = messages[statusEffect];
        return {
            message: statusInfo?.message || `${targetName} is affected by ${statusEffect}!`,
            educational: statusInfo?.educational || `${statusEffect} affects ML performance`,
            type: 'status'
        };
    }

    return {
        message: `${targetName} resisted the status effect!`,
        educational: "Built-in regularization provides resistance",
        type: 'info'
    };
}

export function generateMoveExplanation(moveName: string): CombatMessage {
    const explanations: Record<string, { message: string; educational: string }> = {
        'Bootstrap Assault': {
            message: "Creates multiple training datasets!",
            educational: "Sampling with replacement for diverse models"
        },
        'Gradient Descent': {
            message: "Optimizing towards global minimum!",
            educational: "Iteratively minimizes loss function"
        },
        'Kernel Trick': {
            message: "Transforms to higher dimensions!",
            educational: "Maps data for non-linear separation"
        },
        'Prior Strike': {
            message: "Uses historical probabilities!",
            educational: "Bayesian approach with class priors"
        },
        'Weak Learner Swarm': {
            message: "Combines simple models!",
            educational: "Ensemble of weak learners = strong predictor"
        },
        'Centroid Shift': {
            message: "Repositions cluster centers!",
            educational: "K-means optimization step"
        }
    };

    const explanation = explanations[moveName];
    return {
        message: explanation?.message || `${moveName} executed!`,
        educational: explanation?.educational || `Core ML technique`,
        type: 'info'
    };
}

export function generateTurnStartMessage(
    playerName: string,
    aiName: string,
    isPlayerTurn: boolean,
    turn: number
): CombatMessage {
    const currentPlayer = isPlayerTurn ? playerName : aiName;
    return {
        message: `🎯 ${currentPlayer}'s turn`,
        educational: "Each turn = one training iteration",
        type: 'info'
    };
}

export function generatePPWarning(moveName: string, remainingPP: number): CombatMessage {
    if (remainingPP === 0) {
        return {
            message: `${moveName} has no PP left!`,
            educational: "Computational resources exhausted",
            type: 'info'
        };
    }

    if (remainingPP <= 2) {
        return {
            message: `${moveName} running low! ${remainingPP} uses left`,
            educational: "Resource management is crucial in ML",
            type: 'info'
        };
    }

    return {
        message: `${moveName} has ${remainingPP} uses remaining`,
        type: 'info'
    };
}

export function generateEndBattleMessage(
    winnerName: string,
    loserName: string,
    finalDamage: number
): CombatMessage {
    return {
        message: `🏆 ${winnerName} wins! ${loserName} defeated!`,
        educational: "Superior algorithm performance on this dataset",
        type: 'info'
    };
}

export function generateAIReasoningMessage(
    aiName: string,
    moveName: string,
    reasoning: string,
    confidence: number
): CombatMessage {
    const shortReasoning = reasoning.length > 35 ? reasoning.substring(0, 32) + "..." : reasoning;
    return {
        message: `🤖 ${aiName}: "${shortReasoning}"`,
        educational: `Decision confidence ${Math.round(confidence * 100)}% - high confidence means model is certain about prediction`,
        type: 'info'
    };
}

function getDetailedEducationalNote(moveName: string): string {
    const notes: Record<string, string> = {
        'Bootstrap Assault': 'Random Forest trains multiple trees on different data samples (bagging) to reduce overfitting',
        'Gradient Descent': 'Optimization algorithm: follows negative gradient to minimize loss function step by step',
        'Kernel Trick': 'SVM maps data to higher dimensions using kernel functions (RBF, polynomial) for non-linear separation',
        'Prior Strike': 'Naive Bayes uses class priors P(class) from training data frequency',
        'Posterior Slam': 'Bayes theorem: P(class|features) = P(features|class) × P(class) / P(features)',
        'Likelihood Blast': 'P(features|class): probability of seeing these features given the class',
        'Weak Learner Swarm': 'Gradient Boosting combines many weak models (decision stumps) sequentially',
        'Centroid Shift': 'K-means moves cluster centers to mean of assigned points, minimizing within-cluster variance',
        'Backpropagation Blast': 'Neural networks propagate error gradients backward through layers to update weights',
        'Tree Vote': 'Random Forest final prediction: majority vote (classification) or average (regression)',
        'Support Vector Strike': 'SVM finds maximum margin hyperplane using support vectors (closest points)',
        'Hyperplane Slash': 'Decision boundary that maximally separates classes in feature space',
        'Feature Bagging': 'Random Forest selects sqrt(n_features) random features per tree to reduce correlation',
        'Convergence Lock': 'Algorithm stops when loss function change < threshold or max iterations reached'
    };
    return notes[moveName] || 'Fundamental machine learning technique with mathematical foundation';
}

// Educational tooltips for specific situations
export const EDUCATIONAL_TOOLTIPS = {
    typeAdvantage: "Algorithmic advantages: Neural nets excel at patterns, SVMs work with small datasets",
    criticalHit: "Finding optimal hyperparameters or breakthrough accuracy",
    statusEffects: "Real ML challenges: overfitting, underfitting, dimensionality",
    ppSystem: "Computational resources - powerful algorithms need more processing",
    turnBased: "Strategic thinking like data scientists choosing algorithms",
    aiDifficulty: "Expertise levels: rookie to expert ML practitioners"
};