// @file src/lib/data/type-advantages.ts

export type AlgorithmType = 'ensemble' | 'neural' | 'geometric' | 'probabilistic' | 'clustering' | 'boosting';

export interface TypeAdvantage {
    attacker: AlgorithmType;
    defender: AlgorithmType;
    multiplier: number;
    reason: string;
}

// Pokemon-style type effectiveness chart for ML algorithms
export const TYPE_CHART: TypeAdvantage[] = [
    // Ensemble advantages
    {
        attacker: 'ensemble',
        defender: 'neural',
        multiplier: 1.5,
        reason: 'Ensemble methods are more robust against overfitting that neural networks are prone to'
    },
    {
        attacker: 'ensemble',
        defender: 'boosting',
        multiplier: 0.8,
        reason: 'Both use multiple learners, boosting has sequential advantage over parallel ensemble'
    },

    // Neural advantages
    {
        attacker: 'neural',
        defender: 'geometric',
        multiplier: 1.5,
        reason: 'Neural networks can learn non-linear patterns that geometric methods like SVM struggle with'
    },
    {
        attacker: 'neural',
        defender: 'probabilistic',
        multiplier: 1.3,
        reason: 'Deep learning can capture complex dependencies that naive independence assumptions miss'
    },
    {
        attacker: 'neural',
        defender: 'clustering',
        multiplier: 1.4,
        reason: 'Supervised neural networks have advantage over unsupervised clustering methods'
    },

    // Geometric advantages
    {
        attacker: 'geometric',
        defender: 'neural',
        multiplier: 1.3,
        reason: 'SVM works better with small datasets where neural networks would overfit'
    },
    {
        attacker: 'geometric',
        defender: 'clustering',
        multiplier: 1.5,
        reason: 'SVM creates clear decision boundaries vs clustering\'s soft groupings'
    },
    {
        attacker: 'geometric',
        defender: 'probabilistic',
        multiplier: 0.9,
        reason: 'Both handle uncertainty well, probabilistic methods slightly more flexible'
    },

    // Probabilistic advantages
    {
        attacker: 'probabilistic',
        defender: 'ensemble',
        multiplier: 1.2,
        reason: 'Probabilistic methods are faster and need less data than complex ensembles'
    },
    {
        attacker: 'probabilistic',
        defender: 'neural',
        multiplier: 1.1,
        reason: 'Naive Bayes works well with small datasets where neural networks fail'
    },
    {
        attacker: 'probabilistic',
        defender: 'boosting',
        multiplier: 0.8,
        reason: 'Boosting methods generally outperform simple probabilistic approaches'
    },

    // Clustering advantages
    {
        attacker: 'clustering',
        defender: 'probabilistic',
        multiplier: 1.2,
        reason: 'Clustering finds hidden patterns without prior class assumptions'
    },
    {
        attacker: 'clustering',
        defender: 'geometric',
        multiplier: 0.9,
        reason: 'SVM supervised learning generally outperforms unsupervised clustering'
    },

    // Boosting advantages
    {
        attacker: 'boosting',
        defender: 'ensemble',
        multiplier: 1.3,
        reason: 'Sequential boosting often outperforms parallel ensemble methods'
    },
    {
        attacker: 'boosting',
        defender: 'probabilistic',
        multiplier: 1.4,
        reason: 'Gradient boosting handles complex patterns better than simple probabilistic models'
    },
    {
        attacker: 'boosting',
        defender: 'clustering',
        multiplier: 1.5,
        reason: 'Supervised boosting has clear advantage over unsupervised clustering'
    },
    {
        attacker: 'boosting',
        defender: 'neural',
        multiplier: 0.9,
        reason: 'Neural networks can be more powerful than boosting on large datasets'
    }
];

// Helper functions
export function getTypeMultiplier(attackerType: AlgorithmType, defenderType: AlgorithmType): number {
    const advantage = TYPE_CHART.find(
        chart => chart.attacker === attackerType && chart.defender === defenderType
    );
    return advantage?.multiplier || 1.0;
}

export function getTypeReason(attackerType: AlgorithmType, defenderType: AlgorithmType): string {
    const advantage = TYPE_CHART.find(
        chart => chart.attacker === attackerType && chart.defender === defenderType
    );
    return advantage?.reason || 'No special type interaction';
}

export function getEffectivenessText(multiplier: number): string {
    if (multiplier >= 1.4) return "It's super effective!";
    if (multiplier >= 1.2) return "It's quite effective!";
    if (multiplier <= 0.8) return "It's not very effective...";
    if (multiplier <= 0.6) return "It's barely effective...";
    return "";
}

// Get all advantages/disadvantages for a specific type
export function getTypeMatchups(algorithmType: AlgorithmType) {
    const strongAgainst = TYPE_CHART
        .filter(chart => chart.attacker === algorithmType && chart.multiplier > 1.0)
        .map(chart => ({ type: chart.defender, multiplier: chart.multiplier, reason: chart.reason }));

    const weakAgainst = TYPE_CHART
        .filter(chart => chart.attacker === algorithmType && chart.multiplier < 1.0)
        .map(chart => ({ type: chart.defender, multiplier: chart.multiplier, reason: chart.reason }));

    const vulnerableTo = TYPE_CHART
        .filter(chart => chart.defender === algorithmType && chart.multiplier > 1.0)
        .map(chart => ({ type: chart.attacker, multiplier: chart.multiplier, reason: chart.reason }));

    const resistantTo = TYPE_CHART
        .filter(chart => chart.defender === algorithmType && chart.multiplier < 1.0)
        .map(chart => ({ type: chart.attacker, multiplier: chart.multiplier, reason: chart.reason }));

    return {
        strongAgainst,
        weakAgainst,
        vulnerableTo,
        resistantTo
    };
}

// Map algorithm names to types
export const ALGORITHM_TYPES: Record<string, AlgorithmType> = {
    'Random Forest': 'ensemble',
    'Neural Network': 'neural',
    'Support Vector Machine': 'geometric',
    'Gradient Boosting': 'boosting',
    'Naive Bayes': 'probabilistic',
    'K-Means Clustering': 'clustering'
};