// @file src/lib/data/moves.ts

export interface Move {
    name: string;
    type: 'ensemble' | 'neural' | 'geometric' | 'probabilistic' | 'clustering' | 'boosting';
    power: number;
    accuracy: number;
    pp: number; // Power Points (usage limit)
    category: 'physical' | 'special' | 'status';
    description: string;
    educationalNote: string;
    effect?: string;
}

export const MOVES_DATABASE: Record<string, Move> = {
    // Random Forest Moves
    'Bootstrap Assault': {
        name: 'Bootstrap Assault',
        type: 'ensemble',
        power: 80,
        accuracy: 90,
        pp: 15,
        category: 'physical',
        description: 'Creates multiple training samples with replacement for a devastating ensemble attack.',
        educationalNote: 'Bootstrap sampling is the foundation of Random Forest. Each tree trains on a different random sample of data with replacement, reducing overfitting.',
        effect: 'High accuracy, reduces opponent\'s variance'
    },

    'Feature Bagging': {
        name: 'Feature Bagging',
        type: 'ensemble',
        power: 70,
        accuracy: 85,
        pp: 20,
        category: 'special',
        description: 'Randomly selects features for each attack, confusing the opponent with unpredictability.',
        educationalNote: 'Random Forest uses only sqrt(n_features) random features at each split. This feature randomness prevents individual trees from dominating.',
        effect: 'Ignores opponent\'s defensive patterns'
    },

    'Out-of-Bag Counter': {
        name: 'Out-of-Bag Counter',
        type: 'ensemble',
        power: 0,
        accuracy: 100,
        pp: 10,
        category: 'status',
        description: 'Uses unsampled data to validate and counter-attack with precision.',
        educationalNote: 'OOB error uses ~37% of data not included in bootstrap sample for validation without separate test set.',
        effect: 'Next attack has 100% accuracy and +50% power'
    },

    'Tree Vote': {
        name: 'Tree Vote',
        type: 'ensemble',
        power: 85,
        accuracy: 95,
        pp: 10,
        category: 'special',
        description: 'All trees vote on the final prediction, overwhelming the opponent with consensus.',
        educationalNote: 'Random Forest final prediction is majority vote (classification) or average (regression) of all trees.',
        effect: 'Power increases with number of previous ensemble moves used'
    },

    // Neural Network Moves
    'Gradient Descent': {
        name: 'Gradient Descent',
        type: 'neural',
        power: 75,
        accuracy: 80,
        pp: 25,
        category: 'physical',
        description: 'Iteratively improves attack strength by following the steepest descent path.',
        educationalNote: 'Gradient descent optimizes neural network weights by computing gradients and moving in the direction that minimizes loss.',
        effect: 'Power increases each turn (learning rate effect)'
    },

    'Backpropagation Blast': {
        name: 'Backpropagation Blast',
        type: 'neural',
        power: 90,
        accuracy: 85,
        pp: 15,
        category: 'special',
        description: 'Propagates error backwards through layers, dealing devastating damage.',
        educationalNote: 'Backpropagation calculates gradients layer by layer from output to input using chain rule of calculus.',
        effect: 'Deals extra damage based on opponent\'s last move power'
    },

    'Activation Burst': {
        name: 'Activation Burst',
        type: 'neural',
        power: 65,
        accuracy: 90,
        pp: 20,
        category: 'special',
        description: 'Non-linear activation functions create explosive attack patterns.',
        educationalNote: 'Activation functions (ReLU, Sigmoid, Tanh) introduce non-linearity, allowing neural networks to learn complex patterns.',
        effect: 'Super effective against linear models'
    },

    'Dropout Defense': {
        name: 'Dropout Defense',
        type: 'neural',
        power: 0,
        accuracy: 100,
        pp: 15,
        category: 'status',
        description: 'Randomly ignores incoming attacks to prevent overfitting to opponent\'s strategy.',
        educationalNote: 'Dropout randomly sets neurons to zero during training, preventing co-adaptation and reducing overfitting.',
        effect: 'Reduces damage from next 3 attacks by 50%'
    },

    // SVM Moves
    'Kernel Trick': {
        name: 'Kernel Trick',
        type: 'geometric',
        power: 85,
        accuracy: 90,
        pp: 15,
        category: 'special',
        description: 'Transforms the battle space to higher dimensions for optimal separation.',
        educationalNote: 'Kernel trick allows SVM to find non-linear decision boundaries by mapping data to higher-dimensional space.',
        effect: 'Ignores opponent\'s defensive positioning'
    },

    'Margin Maximizer': {
        name: 'Margin Maximizer',
        type: 'geometric',
        power: 80,
        accuracy: 95,
        pp: 20,
        category: 'physical',
        description: 'Finds the optimal separation distance for maximum devastating impact.',
        educationalNote: 'SVM finds the hyperplane that maximizes the margin (distance) between classes, improving generalization.',
        effect: 'Critical hit ratio increased'
    },

    'Support Vector Strike': {
        name: 'Support Vector Strike',
        type: 'geometric',
        power: 95,
        accuracy: 85,
        pp: 12,
        category: 'physical',
        description: 'Targets only the most critical data points for maximum efficiency.',
        educationalNote: 'Only support vectors (data points closest to decision boundary) determine the SVM model.',
        effect: 'Always hits weakness, ignores filler moves'
    },

    'Hyperplane Slash': {
        name: 'Hyperplane Slash',
        type: 'geometric',
        power: 100,
        accuracy: 90,
        pp: 8,
        category: 'physical',
        description: 'Creates a perfect linear decision boundary that slices through opposition.',
        educationalNote: 'SVM decision boundary is a hyperplane in feature space that optimally separates classes.',
        effect: 'Super effective against clustering algorithms'
    },

    // Gradient Boosting Moves
    'Weak Learner Swarm': {
        name: 'Weak Learner Swarm',
        type: 'boosting',
        power: 60,
        accuracy: 95,
        pp: 25,
        category: 'physical',
        description: 'Multiple weak attacks that collectively build unstoppable momentum.',
        educationalNote: 'Gradient boosting combines many weak learners (typically decision stumps) sequentially.',
        effect: 'Each use increases power of next boosting move'
    },

    'Residual Correction': {
        name: 'Residual Correction',
        type: 'boosting',
        power: 70,
        accuracy: 90,
        pp: 20,
        category: 'special',
        description: 'Learns from previous mistakes to deliver precisely targeted attacks.',
        educationalNote: 'Each new tree in gradient boosting is trained on the residuals (errors) of previous trees.',
        effect: 'Damage increases based on opponent\'s remaining HP'
    },

    'AdaBoost Combo': {
        name: 'AdaBoost Combo',
        type: 'boosting',
        power: 80,
        accuracy: 85,
        pp: 15,
        category: 'physical',
        description: 'Re-weights attacks based on previous failures for adaptive strategy.',
        educationalNote: 'AdaBoost increases weights of misclassified examples, forcing subsequent learners to focus on hard cases.',
        effect: 'Power doubles against opponents with high defense'
    },

    'XGBoost Finisher': {
        name: 'XGBoost Finisher',
        type: 'boosting',
        power: 110,
        accuracy: 95,
        pp: 5,
        category: 'special',
        description: 'Ultimate optimized boosting attack with built-in regularization.',
        educationalNote: 'XGBoost adds regularization terms to prevent overfitting while maintaining boosting power.',
        effect: 'Cannot be countered, prevents opponent status moves next turn'
    },

    // Naive Bayes Moves
    'Prior Strike': {
        name: 'Prior Strike',
        type: 'probabilistic',
        power: 70,
        accuracy: 85,
        pp: 20,
        category: 'special',
        description: 'Attacks based on prior knowledge of class probabilities.',
        educationalNote: 'Prior probability P(class) represents the base rate of each class in the training data.',
        effect: 'Power increases against rare opponent types'
    },

    'Likelihood Blast': {
        name: 'Likelihood Blast',
        type: 'probabilistic',
        power: 75,
        accuracy: 90,
        pp: 18,
        category: 'special',
        description: 'Calculates attack probability based on feature evidence.',
        educationalNote: 'Likelihood P(features|class) measures how probable the features are given each class.',
        effect: 'Accuracy increases with more data observed'
    },

    'Independence Assumption': {
        name: 'Independence Assumption',
        type: 'probabilistic',
        power: 65,
        accuracy: 100,
        pp: 15,
        category: 'status',
        description: 'Ignores feature correlations for simplified but fast attacks.',
        educationalNote: 'Naive Bayes assumes features are independent given the class - often wrong but works well in practice.',
        effect: 'Moves cost 0 PP next turn (computational efficiency)'
    },

    'Posterior Slam': {
        name: 'Posterior Slam',
        type: 'probabilistic',
        power: 85,
        accuracy: 95,
        pp: 12,
        category: 'special',
        description: 'Final prediction using Bayes\' theorem for maximum probability impact.',
        educationalNote: 'Posterior P(class|features) = P(features|class) × P(class) / P(features) gives final classification.',
        effect: 'Power scales with confidence level of prediction'
    },

    // K-Means Moves
    'Centroid Shift': {
        name: 'Centroid Shift',
        type: 'clustering',
        power: 0,
        accuracy: 100,
        pp: 20,
        category: 'status',
        description: 'Repositions cluster centers for optimal grouping strategy.',
        educationalNote: 'K-means updates centroids to the mean position of all points assigned to each cluster.',
        effect: 'Changes battle field positioning, affects accuracy of next moves'
    },

    'Cluster Bomb': {
        name: 'Cluster Bomb',
        type: 'clustering',
        power: 80,
        accuracy: 85,
        pp: 15,
        category: 'physical',
        description: 'Assigns data points to clusters with explosive force.',
        educationalNote: 'Assignment step assigns each point to the nearest centroid based on Euclidean distance.',
        effect: 'Hits multiple targets, damage split between them'
    },

    'Elbow Method': {
        name: 'Elbow Method',
        type: 'clustering',
        power: 0,
        accuracy: 100,
        pp: 10,
        category: 'status',
        description: 'Analyzes opponent to find optimal number of attack clusters.',
        educationalNote: 'Elbow method plots within-cluster sum of squares vs K to find optimal number of clusters.',
        effect: 'Reveals opponent\'s optimal counter-strategy, boosts next attack'
    },

    'Convergence Lock': {
        name: 'Convergence Lock',
        type: 'clustering',
        power: 90,
        accuracy: 100,
        pp: 8,
        category: 'status',
        description: 'Locks opponent in place until cluster centers stabilize.',
        educationalNote: 'K-means converges when centroids stop moving between iterations.',
        effect: 'Opponent cannot use moves until they take damage'
    }
};

// Helper function to get moves by algorithm
export function getMovesByAlgorithm(algorithmName: string): Move[] {
    const algorithmMoves: Record<string, string[]> = {
        'Random Forest': ['Bootstrap Assault', 'Feature Bagging', 'Out-of-Bag Counter', 'Tree Vote'],
        'Neural Network': ['Gradient Descent', 'Backpropagation Blast', 'Activation Burst', 'Dropout Defense'],
        'Support Vector Machine': ['Kernel Trick', 'Margin Maximizer', 'Support Vector Strike', 'Hyperplane Slash'],
        'Gradient Boosting': ['Weak Learner Swarm', 'Residual Correction', 'AdaBoost Combo', 'XGBoost Finisher'],
        'Naive Bayes': ['Prior Strike', 'Likelihood Blast', 'Independence Assumption', 'Posterior Slam'],
        'K-Means Clustering': ['Centroid Shift', 'Cluster Bomb', 'Elbow Method', 'Convergence Lock']
    };

    const moveNames = algorithmMoves[algorithmName] || [];
    return moveNames.map(name => MOVES_DATABASE[name]).filter(Boolean);
}