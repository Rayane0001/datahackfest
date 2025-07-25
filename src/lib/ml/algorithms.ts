// @file src/lib/ml/algorithms.ts

export interface Fighter {
    name: string;
    type: string;
    color: string;
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    speed: number;
    accuracy: number;
    special: string;
    combos: string[];
    // ML-specific stats
    precision: number;
    recall: number;
    f1Score: number;
    trainingTime: number;
}

export interface AlgorithmConfig {
    name: string;
    type: string;
    color: string;
    baseStats: {
        attack: number;
        defense: number;
        speed: number;
        accuracy: number;
    };
    special: string;
    combos: string[];
    strengths: string[];
    weaknesses: string[];
}

export const ALGORITHM_CONFIGS: Record<string, AlgorithmConfig> = {
    'Random Forest': {
        name: 'Random Forest',
        type: 'forest',
        color: '#22c55e',
        baseStats: {
            attack: 85,
            defense: 90,
            speed: 70,
            accuracy: 88
        },
        special: 'Tree Ensemble Fury',
        combos: ['Branch Slam', 'Leaf Storm', 'Root Bind', 'Forest Fire'],
        strengths: ['High accuracy', 'Handles overfitting well', 'Feature importance'],
        weaknesses: ['Memory intensive', 'Black box model']
    },

    'Neural Network': {
        name: 'Neural Network',
        type: 'neural',
        color: '#3b82f6',
        baseStats: {
            attack: 95,
            defense: 70,
            speed: 80,
            accuracy: 85
        },
        special: 'Backpropagation Blast',
        combos: ['Gradient Descent', 'Activation Burst', 'Weight Update', 'Deep Strike'],
        strengths: ['Pattern recognition', 'Non-linear relationships', 'Versatile'],
        weaknesses: ['Requires lots of data', 'Training time', 'Black box']
    },

    'SVM': {
        name: 'Support Vector Machine',
        type: 'svm',
        color: '#ef4444',
        baseStats: {
            attack: 90,
            defense: 95,
            speed: 65,
            accuracy: 92
        },
        special: 'Kernel Transformation',
        combos: ['Margin Maximizer', 'Support Vector Strike', 'Kernel Trick', 'Hyperplane Slash'],
        strengths: ['Effective with small datasets', 'Memory efficient', 'Versatile kernels'],
        weaknesses: ['Slow on large datasets', 'Sensitive to scaling']
    },

    'Gradient Boosting': {
        name: 'Gradient Boosting',
        type: 'gradient',
        color: '#f59e0b',
        baseStats: {
            attack: 92,
            defense: 75,
            speed: 60,
            accuracy: 90
        },
        special: 'Sequential Learning',
        combos: ['Weak Learner Army', 'Residual Attack', 'Boost Combo', 'Ensemble Explosion'],
        strengths: ['High predictive power', 'Handles mixed data types', 'Feature importance'],
        weaknesses: ['Overfitting risk', 'Sensitive to outliers', 'Training time']
    },

    'K-Means': {
        name: 'K-Means Clustering',
        type: 'kmeans',
        color: '#8b5cf6',
        baseStats: {
            attack: 70,
            defense: 80,
            speed: 95,
            accuracy: 75
        },
        special: 'Centroid Convergence',
        combos: ['Cluster Strike', 'Centroid Shift', 'Inertia Blast', 'K-Formation'],
        strengths: ['Fast convergence', 'Simple implementation', 'Scales well'],
        weaknesses: ['Assumes spherical clusters', 'Sensitive to initialization', 'Requires K']
    },

    'Naive Bayes': {
        name: 'Naive Bayes',
        type: 'bayes',
        color: '#ec4899',
        baseStats: {
            attack: 75,
            defense: 85,
            speed: 90,
            accuracy: 80
        },
        special: 'Probability Storm',
        combos: ['Prior Attack', 'Likelihood Strike', 'Posterior Slam', 'Independence Assumption'],
        strengths: ['Fast training and prediction', 'Works with small datasets', 'Handles multiple classes'],
        weaknesses: ['Naive independence assumption', 'Categorical inputs need smoothing']
    }
};

export class FighterFactory {
    static createFighter(algorithmName: string, performanceMetrics?: any): Fighter {
        const config = ALGORITHM_CONFIGS[algorithmName];
        if (!config) {
            throw new Error(`Unknown algorithm: ${algorithmName}`);
        }

        // Add some randomness to base stats (±10%)
        const randomize = (base: number) => base + (Math.random() - 0.5) * 20;

        // Use performance metrics if available, otherwise use base stats with randomization
        const attack = performanceMetrics?.precision ? performanceMetrics.precision * 100 : randomize(config.baseStats.attack);
        const defense = performanceMetrics?.recall ? performanceMetrics.recall * 100 : randomize(config.baseStats.defense);
        const speed = performanceMetrics?.fitTime ? Math.max(20, 100 - performanceMetrics.fitTime * 10) : randomize(config.baseStats.speed);
        const accuracy = performanceMetrics?.accuracy ? performanceMetrics.accuracy * 100 : randomize(config.baseStats.accuracy);

        const maxHealth = Math.round((attack + defense + speed) / 3);

        return {
            name: config.name,
            type: config.type,
            color: config.color,
            health: maxHealth,
            maxHealth,
            attack: Math.round(attack),
            defense: Math.round(defense),
            speed: Math.round(speed),
            accuracy: Math.round(accuracy),
            special: config.special,
            combos: config.combos,
            precision: performanceMetrics?.precision || attack / 100,
            recall: performanceMetrics?.recall || defense / 100,
            f1Score: performanceMetrics?.f1Score || (2 * (attack/100) * (defense/100)) / ((attack/100) + (defense/100)),
            trainingTime: performanceMetrics?.fitTime || Math.random() * 5
        };
    }

    static getAlgorithmInfo(algorithmName: string): AlgorithmConfig | null {
        return ALGORITHM_CONFIGS[algorithmName] || null;
    }

    static getAllAlgorithms(): string[] {
        return Object.keys(ALGORITHM_CONFIGS);
    }
}

// Combat-specific utilities
export class CombatUtils {
    static calculateDamage(attacker: Fighter, defender: Fighter): number {
        const baseDamage = attacker.attack;
        const defense = defender.defense;
        const speedModifier = attacker.speed / 100;
        const accuracyCheck = Math.random() < (attacker.accuracy / 100);

        if (!accuracyCheck) {
            return 0; // Miss!
        }

        // Damage calculation: (attack - defense/2) * speed modifier * random factor
        const damage = Math.max(1, (baseDamage - defense/2) * speedModifier * (0.8 + Math.random() * 0.4));

        return Math.round(damage);
    }

    static getRandomCombo(fighter: Fighter): string {
        return fighter.combos[Math.floor(Math.random() * fighter.combos.length)];
    }

    static shouldUseSpecial(fighter: Fighter): boolean {
        // 20% chance to use special, higher if health is low
        const baseChance = 0.2;
        const healthBonus = (1 - fighter.health / fighter.maxHealth) * 0.3;
        return Math.random() < (baseChance + healthBonus);
    }

    static getTypeAdvantage(attacker: string, defender: string): number {
        // Define type advantages (like Pokemon!)
        const advantages: Record<string, string[]> = {
            'neural': ['forest', 'gradient'], // Neural networks are good against tree-based models
            'svm': ['neural'], // SVM is good against neural networks (smaller data)
            'forest': ['svm', 'bayes'], // Random Forest is good against SVM and Naive Bayes
            'gradient': ['kmeans'], // Gradient Boosting is good against clustering
            'bayes': ['neural'], // Naive Bayes is fast vs slow neural networks
            'kmeans': ['bayes'] // Clustering vs probabilistic
        };

        if (advantages[attacker]?.includes(defender)) {
            return 1.25; // 25% damage bonus
        }

        if (advantages[defender]?.includes(attacker)) {
            return 0.8; // 20% damage reduction
        }

        return 1.0; // No advantage
    }
}