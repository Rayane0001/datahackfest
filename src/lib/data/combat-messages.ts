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
            message: `${attackerName}'s ${moveName} missed!`,
            educational: "In ML, this represents poor model accuracy - the algorithm failed to make a correct prediction.",
            type: 'miss'
        };
    }

    let message = `${attackerName} uses ${moveName}!`;
    let educational = "";
    let type: CombatMessage['type'] = 'attack';

    if (isCritical) {
        message += ` Critical hit!`;
        educational = "Critical hits represent when an algorithm performs exceptionally well, like finding optimal hyperparameters.";
        type = 'critical';
    }

    if (effectiveness > 1.2) {
        message += ` It's super effective!`;
        educational = "Super effectiveness shows when an algorithm is well-suited for the problem type - like using neural networks for image recognition.";
        type = 'super_effective';
    } else if (effectiveness < 0.9) {
        message += ` It's not very effective...`;
        educational = "Poor effectiveness happens when an algorithm doesn't match the problem - like using linear regression for complex non-linear data.";
        type = 'not_effective';
    }

    message += ` Deals ${damage} damage!`;

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
                message: `${targetName} is overfitting! High training accuracy but poor generalization!`,
                educational: "Overfitting occurs when a model learns training data too well, including noise, reducing performance on new data."
            },
            underfitting: {
                message: `${targetName} is underfitting! The model is too simple for the data!`,
                educational: "Underfitting happens when a model is too simple to capture underlying patterns in the data."
            },
            'curse-dimensionality': {
                message: `${targetName} suffers from the curse of dimensionality! Too many features!`,
                educational: "Curse of dimensionality occurs when algorithms struggle with high-dimensional data due to sparse data distribution."
            },
            'data-leakage': {
                message: `${targetName} has data leakage! Artificially inflated performance detected!`,
                educational: "Data leakage happens when future information accidentally gets into training data, creating unrealistic performance."
            }
        };

        const statusInfo = messages[statusEffect];
        return {
            message: statusInfo?.message || `${targetName} is affected by ${statusEffect}!`,
            educational: statusInfo?.educational || `${statusEffect} is a common ML challenge that affects model performance.`,
            type: 'status'
        };
    }

    return {
        message: `${targetName} resisted the status effect!`,
        educational: "Some algorithms have built-in resistance to certain problems through regularization or robust design.",
        type: 'info'
    };
}

export function generateMoveExplanation(moveName: string): CombatMessage {
    const explanations: Record<string, { message: string; educational: string }> = {
        'Bootstrap Assault': {
            message: "Creates multiple training datasets through resampling!",
            educational: "Bootstrap sampling creates multiple datasets by sampling with replacement, allowing Random Forest to train diverse trees."
        },
        'Gradient Descent': {
            message: "Iteratively optimizing towards the global minimum!",
            educational: "Gradient descent follows the steepest slope to minimize the loss function, finding optimal model parameters."
        },
        'Kernel Trick': {
            message: "Transforming data to higher dimensions for better separation!",
            educational: "The kernel trick allows SVM to find non-linear decision boundaries by mapping data to higher-dimensional spaces."
        },
        'Prior Strike': {
            message: "Using historical class probabilities for prediction!",
            educational: "Prior probabilities represent the base rates of each class before considering any features."
        },
        'Weak Learner Swarm': {
            message: "Combining many simple models for collective strength!",
            educational: "Gradient boosting uses many weak learners (like decision stumps) that together form a strong predictor."
        },
        'Centroid Shift': {
            message: "Repositioning cluster centers for optimal grouping!",
            educational: "K-means updates centroids to the mean position of assigned points, iteratively improving cluster quality."
        }
    };

    const explanation = explanations[moveName];
    return {
        message: explanation?.message || `${moveName} is executed with precision!`,
        educational: explanation?.educational || `${moveName} represents a core concept in machine learning algorithms.`,
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

    if (turn === 1) {
        return {
            message: `⚔️ Battle begins! ${currentPlayer} goes first!`,
            educational: "In ML competitions, the order of algorithm evaluation can sometimes affect results due to computational resources or data ordering.",
            type: 'info'
        };
    }

    return {
        message: `Turn ${turn}: ${currentPlayer}'s move!`,
        type: 'info'
    };
}

export function generatePPWarning(moveName: string, remainingPP: number): CombatMessage {
    if (remainingPP === 0) {
        return {
            message: `${moveName} has no PP left! Cannot use this move!`,
            educational: "In ML, this represents computational resource exhaustion - the algorithm has reached its processing limit.",
            type: 'info'
        };
    }

    if (remainingPP <= 2) {
        return {
            message: `${moveName} is running low! Only ${remainingPP} uses remaining!`,
            educational: "Resource management is crucial in ML - algorithms must balance accuracy with computational efficiency.",
            type: 'info'
        };
    }

    return {
        message: `${moveName} has ${remainingPP} uses remaining.`,
        type: 'info'
    };
}

export function generateEndBattleMessage(
    winnerName: string,
    loserName: string,
    finalDamage: number
): CombatMessage {
    return {
        message: `🏆 ${winnerName} wins the battle! ${loserName} has been defeated!`,
        educational: `The winning algorithm demonstrated superior performance on this dataset. In real ML, model selection depends on problem type, data size, and computational constraints.`,
        type: 'info'
    };
}

export function generateAIReasoningMessage(
    aiName: string,
    moveName: string,
    reasoning: string,
    confidence: number
): CombatMessage {
    const confidenceText = confidence > 0.8 ? "very confident" : confidence > 0.5 ? "moderately confident" : "uncertain";

    return {
        message: `🤖 ${aiName} is ${confidenceText}: "${reasoning}"`,
        educational: `AI decision-making in ML involves evaluating multiple factors like data patterns, computational cost, and expected performance.`,
        type: 'info'
    };
}

// Educational tooltips for specific situations
export const EDUCATIONAL_TOOLTIPS = {
    typeAdvantage: "Type advantages in ML combat represent real algorithmic strengths - neural networks excel at pattern recognition, while SVMs work better with smaller datasets.",
    criticalHit: "Critical hits represent finding optimal hyperparameters or achieving exceptional performance on validation data.",
    statusEffects: "Status effects mirror real ML challenges like overfitting, underfitting, and the curse of dimensionality.",
    ppSystem: "PP (Power Points) represents computational resources - more powerful algorithms often require more processing power.",
    turnBased: "Turn-based combat allows for strategic thinking, similar to how data scientists carefully choose algorithms and hyperparameters.",
    aiDifficulty: "Different AI levels represent varying expertise levels in ML - from beginner data scientists to expert researchers."
};