// @file src/lib/ml/combat.ts

import type { Fighter } from './algorithms';
import { FighterFactory, CombatUtils } from './algorithms';

export interface CombatRound {
    round: number;
    attacker: string;
    defender: string;
    move: string;
    damage: number;
    description: string;
    special: boolean;
    combo: boolean;
    missed: boolean;
}

export interface CombatResult {
    winner: string;
    rounds: CombatRound[];
    totalRounds: number;
    fighter1FinalHealth: number;
    fighter2FinalHealth: number;
}

export class CombatEngine {
    private pyodide: any = null;
    private sklearn: any = null;
    private numpy: any = null;
    private isInitialized = false;

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Load Pyodide from CDN
            const pyodideScript = document.createElement('script');
            pyodideScript.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
            document.head.appendChild(pyodideScript);

            await new Promise((resolve, reject) => {
                pyodideScript.onload = resolve;
                pyodideScript.onerror = reject;
            });

            // @ts-ignore - Pyodide is loaded globally
            this.pyodide = await loadPyodide();

            // Install required packages
            await this.pyodide.loadPackage(['scikit-learn', 'numpy']);

            // Import libraries
            this.pyodide.runPython(`
				import numpy as np
				from sklearn.datasets import make_classification, make_regression
				from sklearn.model_selection import train_test_split
				from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
				from sklearn.neural_network import MLPClassifier
				from sklearn.svm import SVC
				from sklearn.cluster import KMeans
				from sklearn.naive_bayes import GaussianNB
				from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
				import time
				
				# Global variables to store results
				results = {}
			`);

            this.numpy = this.pyodide.globals.get('np');
            this.isInitialized = true;
            console.log('Combat Engine initialized with ML capabilities!');
        } catch (error) {
            console.error('Failed to initialize ML engine:', error);
            this.isInitialized = false;
        }
    }

    async createFighterFromDataset(algorithmName: string, color: string, type: string, dataset: any[]): Promise<Fighter> {
        if (!this.isInitialized) {
            // Fallback to basic fighter creation
            return FighterFactory.createFighter(algorithmName);
        }

        try {
            // Train algorithm on the provided dataset and get performance metrics
            const performanceMetrics = await this.trainOnDataset(algorithmName, dataset);
            return FighterFactory.createFighter(algorithmName, performanceMetrics);
        } catch (error) {
            console.error(`Failed to train ${algorithmName} on dataset:`, error);
            // Fallback to basic fighter creation
            return FighterFactory.createFighter(algorithmName);
        }
    }

    private async trainOnDataset(algorithmName: string, dataset: any[]): Promise<any> {
        if (!dataset || dataset.length === 0) {
            throw new Error('Dataset is empty');
        }

        // Prepare data for Python
        const features = Object.keys(dataset[0]).slice(0, -1); // All columns except last
        const targetColumn = Object.keys(dataset[0]).slice(-1)[0]; // Last column as target

        const X = dataset.map(row => features.map(feature => {
            const value = row[feature];
            return typeof value === 'number' ? value : (typeof value === 'string' ? value.length : 0);
        }));

        const y = dataset.map(row => {
            const value = row[targetColumn];
            return typeof value === 'number' ? value : (typeof value === 'string' ? value.charCodeAt(0) % 10 : 0);
        });

        const pythonCode = `
# Suppress warnings for cleaner output
import warnings
warnings.filterwarnings('ignore')

# Prepare the dataset
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import time

# Convert JavaScript arrays to numpy arrays
X = np.array(${JSON.stringify(X)})
y = np.array(${JSON.stringify(y)})

# Handle potential issues with data
X = np.nan_to_num(X)
y = np.nan_to_num(y)

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Scale features for algorithms that need it
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Initialize algorithm
algorithm_name = "${algorithmName}"
start_time = time.time()

if algorithm_name == "Random Forest":
    from sklearn.ensemble import RandomForestClassifier
    model = RandomForestClassifier(n_estimators=50, random_state=42, max_depth=10)
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
elif algorithm_name == "Neural Network":
    from sklearn.neural_network import MLPClassifier
    model = MLPClassifier(hidden_layer_sizes=(50,), max_iter=200, random_state=42)
    model.fit(X_train_scaled, y_train)
    predictions = model.predict(X_test_scaled)
elif algorithm_name == "Support Vector Machine":
    from sklearn.svm import SVC
    model = SVC(kernel='rbf', random_state=42, gamma='scale')
    model.fit(X_train_scaled, y_train)
    predictions = model.predict(X_test_scaled)
elif algorithm_name == "Gradient Boosting":
    from sklearn.ensemble import GradientBoostingClassifier
    model = GradientBoostingClassifier(n_estimators=50, random_state=42, max_depth=5)
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
elif algorithm_name == "Naive Bayes":
    from sklearn.naive_bayes import GaussianNB
    model = GaussianNB()
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
elif algorithm_name == "K-Means Clustering":
    from sklearn.cluster import KMeans
    from sklearn.metrics import silhouette_score
    model = KMeans(n_clusters=min(5, len(np.unique(y))), random_state=42)
    model.fit(X_train)
    predictions = model.predict(X_test)
    # For clustering, create synthetic accuracy based on silhouette score
    try:
        silhouette_avg = silhouette_score(X_test, predictions)
        accuracy = (silhouette_avg + 1) / 2  # Normalize to 0-1
    except:
        accuracy = 0.6  # Fallback
    precision = accuracy * 0.9
    recall = accuracy * 0.85
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    fit_time = time.time() - start_time
else:
    # Default to Random Forest
    from sklearn.ensemble import RandomForestClassifier
    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

fit_time = time.time() - start_time

# Calculate metrics (except for K-Means which is handled above)
if algorithm_name != "K-Means Clustering":
    try:
        accuracy = accuracy_score(y_test, predictions)
        precision = precision_score(y_test, predictions, average='weighted', zero_division=0)
        recall = recall_score(y_test, predictions, average='weighted', zero_division=0)
        f1 = f1_score(y_test, predictions, average='weighted', zero_division=0)
    except:
        # Fallback for regression or other issues
        accuracy = max(0.5, 1 - np.mean(np.abs(predictions - y_test)) / np.std(y_test)) if np.std(y_test) > 0 else 0.6
        precision = accuracy * 0.9
        recall = accuracy * 0.85
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

# Store results
results[algorithm_name] = {
    'accuracy': float(max(0.1, min(1.0, accuracy))),
    'precision': float(max(0.1, min(1.0, precision))),
    'recall': float(max(0.1, min(1.0, recall))),
    'f1_score': float(max(0.1, min(1.0, f1))),
    'fit_time': float(max(0.01, fit_time))
}

results[algorithm_name]
		`;

        this.pyodide.runPython(pythonCode);
        const result = this.pyodide.globals.get('results').get(algorithmName);
        return result.toJs();
    }

    private async trainAndEvaluate(algorithmName: string): Promise<any> {
        const pythonCode = `
# Generate dataset
X, y = make_classification(n_samples=1000, n_features=10, n_classes=2, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Initialize algorithm
algorithm_name = "${algorithmName}"
start_time = time.time()

if algorithm_name == "Random Forest":
    model = RandomForestClassifier(n_estimators=50, random_state=42)
elif algorithm_name == "Neural Network":
    model = MLPClassifier(hidden_layer_sizes=(50,), max_iter=200, random_state=42)
elif algorithm_name == "Support Vector Machine":
    model = SVC(kernel='rbf', random_state=42)
elif algorithm_name == "Gradient Boosting":
    model = GradientBoostingClassifier(n_estimators=50, random_state=42)
elif algorithm_name == "Naive Bayes":
    model = GaussianNB()
elif algorithm_name == "K-Means Clustering":
    # For clustering, we'll use a different approach
    model = KMeans(n_clusters=2, random_state=42)
    model.fit(X_train)
    predictions = model.predict(X_test)
    # For clustering, we'll create synthetic accuracy based on silhouette score
    from sklearn.metrics import silhouette_score
    accuracy = (silhouette_score(X_test, predictions) + 1) / 2  # Normalize to 0-1
    precision = accuracy * 0.9  # Approximate
    recall = accuracy * 0.85    # Approximate
    f1 = 2 * (precision * recall) / (precision + recall)
    fit_time = time.time() - start_time
else:
    model = RandomForestClassifier(n_estimators=50, random_state=42)

# Train and evaluate (except for K-Means which is handled above)
if algorithm_name != "K-Means Clustering":
    model.fit(X_train, y_train)
    fit_time = time.time() - start_time
    
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(y_test, predictions, average='weighted', zero_division=0)
    recall = recall_score(y_test, predictions, average='weighted', zero_division=0)
    f1 = f1_score(y_test, predictions, average='weighted', zero_division=0)

# Store results
results[algorithm_name] = {
    'accuracy': float(accuracy),
    'precision': float(precision),
    'recall': float(recall),
    'f1_score': float(f1),
    'fit_time': float(fit_time)
}

results[algorithm_name]
		`;

        this.pyodide.runPython(pythonCode);
        const result = this.pyodide.globals.get('results').get(algorithmName);
        return result.toJs();
    }

    async battle(fighter1: Fighter, fighter2: Fighter): Promise<CombatResult> {
        const rounds: CombatRound[] = [];
        let roundNumber = 1;
        const maxRounds = 50; // Prevent infinite battles

        // Clone fighters to avoid modifying originals
        const f1 = { ...fighter1 };
        const f2 = { ...fighter2 };

        while (f1.health > 0 && f2.health > 0 && roundNumber <= maxRounds) {
            // Determine turn order based on speed
            const f1GoesFirst = f1.speed >= f2.speed || (f1.speed === f2.speed && Math.random() > 0.5);

            if (f1GoesFirst) {
                const round = this.executeAttack(f1, f2, roundNumber);
                rounds.push(round);
                f2.health = Math.max(0, f2.health - round.damage);

                if (f2.health > 0) {
                    roundNumber++;
                    const counterRound = this.executeAttack(f2, f1, roundNumber);
                    rounds.push(counterRound);
                    f1.health = Math.max(0, f1.health - counterRound.damage);
                }
            } else {
                const round = this.executeAttack(f2, f1, roundNumber);
                rounds.push(round);
                f1.health = Math.max(0, f1.health - round.damage);

                if (f1.health > 0) {
                    roundNumber++;
                    const counterRound = this.executeAttack(f1, f2, roundNumber);
                    rounds.push(counterRound);
                    f2.health = Math.max(0, f2.health - counterRound.damage);
                }
            }

            roundNumber++;
        }

        const winner = f1.health > 0 ? f1.name : f2.name;

        return {
            winner,
            rounds,
            totalRounds: rounds.length,
            fighter1FinalHealth: f1.health,
            fighter2FinalHealth: f2.health
        };
    }

    private executeAttack(attacker: Fighter, defender: Fighter, roundNumber: number): CombatRound {
        const useSpecial = CombatUtils.shouldUseSpecial(attacker);
        const useCombo = !useSpecial && Math.random() < 0.3; // 30% chance for combo

        let move: string;
        let damageMultiplier = 1;

        if (useSpecial) {
            move = attacker.special;
            damageMultiplier = 1.5;
        } else if (useCombo) {
            move = CombatUtils.getRandomCombo(attacker);
            damageMultiplier = 1.2;
        } else {
            move = "Basic Attack";
        }

        const baseDamage = CombatUtils.calculateDamage(attacker, defender);
        const typeAdvantage = CombatUtils.getTypeAdvantage(attacker.type, defender.type);
        const finalDamage = Math.round(baseDamage * damageMultiplier * typeAdvantage);

        const missed = finalDamage === 0;

        let description: string;
        if (missed) {
            description = `${attacker.name} uses ${move} but misses!`;
        } else {
            let effectText = "";
            if (typeAdvantage > 1) {
                effectText = " It's super effective!";
            } else if (typeAdvantage < 1) {
                effectText = " It's not very effective...";
            }

            if (useSpecial) {
                description = `💥 ${attacker.name} unleashes ${move}! Deals ${finalDamage} damage!${effectText}`;
            } else if (useCombo) {
                description = `⚡ ${attacker.name} performs ${move}! Deals ${finalDamage} damage!${effectText}`;
            } else {
                description = `${attacker.name} attacks with ${move}! Deals ${finalDamage} damage!${effectText}`;
            }
        }

        return {
            round: roundNumber,
            attacker: attacker.name,
            defender: defender.name,
            move,
            damage: finalDamage,
            description,
            special: useSpecial,
            combo: useCombo,
            missed
        };
    }

    // Generate sample datasets for training
    async generateDataset(type: 'classification' | 'regression' | 'clustering' = 'classification'): Promise<any> {
        if (!this.isInitialized) {
            throw new Error('Combat engine not initialized');
        }

        const pythonCode = `
import numpy as np
from sklearn.datasets import make_classification, make_regression, make_blobs

if "${type}" == "classification":
    X, y = make_classification(n_samples=1000, n_features=20, n_classes=3, n_informative=15, random_state=42)
elif "${type}" == "regression":
    X, y = make_regression(n_samples=1000, n_features=20, noise=0.1, random_state=42)
else:  # clustering
    X, y = make_blobs(n_samples=1000, centers=4, n_features=10, random_state=42)

dataset = {"X": X.tolist(), "y": y.tolist()}
dataset
		`;

        this.pyodide.runPython(pythonCode);
        const result = this.pyodide.globals.get('dataset');
        return result.toJs();
    }

    // Get algorithm performance comparison
    async getAllAlgorithmPerformance(): Promise<Record<string, any>> {
        if (!this.isInitialized) {
            return {};
        }

        try {
            const algorithms = ['Random Forest', 'Neural Network', 'Support Vector Machine', 'Gradient Boosting', 'Naive Bayes'];
            const results: Record<string, any> = {};

            for (const algo of algorithms) {
                results[algo] = await this.trainAndEvaluate(algo);
            }

            return results;
        } catch (error) {
            console.error('Failed to get algorithm performance:', error);
            return {};
        }
    }
}