// @file src/lib/ml/dataset-analyzer.ts

import Papa from 'papaparse';

export interface DatasetAnalysis {
    name: string;
    problemType: 'classification' | 'regression' | 'clustering';
    difficulty: number; // 1-100 Pokemon level
    shape: { rows: number; cols: number };
    classes?: string[];
    features: string[];
    description: string;
    challenges: string[];
    recommendations: Array<{
        algorithm: string;
        reason: string;
    }>;
    parsedData: any[];
    statistics: {
        missingValues: number;
        numericFeatures: number;
        categoricalFeatures: number;
        classBalance?: Record<string, number>;
    };
}

export class DatasetAnalyzer {
    private geminiApiKey: string;

    constructor() {
        // Try to get API key from environment or use fallback
        this.geminiApiKey = this.getApiKey();
    }

    private getApiKey(): string {
        // Try multiple sources for API key
        if (typeof window !== 'undefined') {
            // @ts-ignore - Check for global config
            const globalKey = window.GEMINI_API_KEY;
            if (globalKey) return globalKey;
        }

        // Environment variable (if available)
        if (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) {
            return process.env.VITE_GEMINI_API_KEY;
        }

        // Your dev key (will be replaced with env var for production)
        return 'AIzaSyA1wN0X-7APpp1bzfPpCqQzLXLBldRcKiw';
    }

    async analyzeDataset(file: File): Promise<DatasetAnalysis> {
        try {
            // Parse CSV
            const parsedData = await this.parseCSV(file);

            // Basic analysis
            const basicAnalysis = this.performBasicAnalysis(parsedData, file.name);

            // AI-powered analysis (fallback to basic if API fails)
            let aiAnalysis;
            try {
                aiAnalysis = await this.getAIAnalysis(basicAnalysis);
            } catch (error) {
                console.warn('AI analysis failed, using fallback:', error);
                aiAnalysis = this.getFallbackAnalysis(basicAnalysis);
            }

            return {
                ...basicAnalysis,
                ...aiAnalysis,
                parsedData
            };

        } catch (error) {
            throw new Error(`Failed to analyze dataset: ${(error as Error).message}`);
        }
    }

    private async parseCSV(file: File): Promise<any[]> {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                delimitersToGuess: [',', '\t', '|', ';'],
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
                    } else {
                        resolve(results.data);
                    }
                },
                error: (error) => {
                    reject(new Error(`Failed to parse CSV: ${error.message}`));
                }
            });
        });
    }

    private performBasicAnalysis(data: any[], filename: string): {
        name: string;
        problemType: 'classification' | 'regression' | 'clustering';
        difficulty: number;
        shape: { rows: number; cols: number };
        classes?: string[];
        features: string[];
        statistics: {
            missingValues: number;
            numericFeatures: number;
            categoricalFeatures: number;
            classBalance?: Record<string, number>;
        };
    } {
        if (!data.length) {
            throw new Error('Dataset is empty');
        }

        const features = Object.keys(data[0]).map(key => key.trim());
        const rows = data.length;
        const cols = features.length;

        // Detect problem type
        const lastColumn = features[features.length - 1];
        const targetValues = data.map(row => row[lastColumn]).filter(val => val != null);
        const uniqueTargets = [...new Set(targetValues)];

        let problemType: 'classification' | 'regression' | 'clustering' = 'classification';
        let classes: string[] | undefined;

        if (uniqueTargets.length < rows * 0.1 && uniqueTargets.length <= 20) {
            // Likely classification
            problemType = 'classification';
            classes = uniqueTargets.map(String);
        } else if (typeof uniqueTargets[0] === 'number') {
            // Likely regression
            problemType = 'regression';
        }

        // Calculate statistics
        let missingValues = 0;
        let numericFeatures = 0;
        let categoricalFeatures = 0;

        features.forEach(feature => {
            const values = data.map(row => row[feature]);
            const nonNullValues = values.filter(val => val != null);
            const uniqueValues = [...new Set(nonNullValues)];

            missingValues += (values.length - nonNullValues.length);

            if (nonNullValues.length > 0) {
                if (typeof nonNullValues[0] === 'number' && uniqueValues.length > 10) {
                    numericFeatures++;
                } else {
                    categoricalFeatures++;
                }
            }
        });

        // Class balance for classification
        let classBalance: Record<string, number> | undefined;
        if (problemType === 'classification' && classes) {
            classBalance = {};
            classes.forEach(cls => {
                classBalance![cls] = targetValues.filter(val => String(val) === cls).length;
            });
        }

        // Calculate difficulty (Pokemon level)
        let difficulty = 20; // Base difficulty
        if (rows < 500) difficulty += 15; // Small dataset
        if (cols > 20) difficulty += 10; // Many features
        if (missingValues > rows * cols * 0.1) difficulty += 20; // Missing data
        if (classBalance) {
            const imbalanceRatio = Math.max(...Object.values(classBalance)) / Math.min(...Object.values(classBalance));
            if (imbalanceRatio > 10) difficulty += 15; // Imbalanced classes
        }
        difficulty = Math.min(100, difficulty);

        return {
            name: filename.replace('.csv', '').replace(/[_-]/g, ' '),
            problemType,
            difficulty,
            shape: { rows, cols },
            classes,
            features,
            statistics: {
                missingValues,
                numericFeatures,
                categoricalFeatures,
                classBalance
            }
        };
    }

    private async getAIAnalysis(basicAnalysis: any): Promise<{
        description: string;
        challenges: string[];
        recommendations: Array<{ algorithm: string; reason: string; }>;
    }> {
        const prompt = `You are Professor Oak from Pokemon, analyzing a machine learning dataset for an epic ML battle arena!

Dataset Info:
- Name: ${basicAnalysis.name}
- Type: ${basicAnalysis.problemType}
- Size: ${basicAnalysis.shape?.rows} samples, ${basicAnalysis.shape?.cols} features
- Difficulty Level: ${basicAnalysis.difficulty}
- Features: ${basicAnalysis.features?.slice(0, 5).join(', ')}${basicAnalysis.features?.length! > 5 ? '...' : ''}
- Missing Values: ${basicAnalysis.statistics?.missingValues}
- Class Balance: ${JSON.stringify(basicAnalysis.statistics?.classBalance)}

Please provide a JSON response with:
1. "description": A Pokemon-style description of this dataset (2-3 sentences, exciting and educational)
2. "challenges": Array of battle challenges this dataset presents (3-4 items)
3. "recommendations": Array of 3 recommended algorithms with reasons

Make it fun, educational, and Pokemon-themed while being technically accurate!`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No response from Gemini API');
        }

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in Gemini response');
        }

        const aiData = JSON.parse(jsonMatch[0]);
        return aiData;
    }

    private getFallbackAnalysis(basicAnalysis: any): {
        description: string;
        challenges: string[];
        recommendations: Array<{ algorithm: string; reason: string; }>;
    } {
        // Fallback descriptions when AI is not available
        const fallbackDescriptions = {
            classification: `A wild ${basicAnalysis.problemType} dataset appeared! This ${basicAnalysis.difficulty}-level challenger has ${basicAnalysis.shape?.rows} battle-ready samples across ${basicAnalysis.shape?.cols} feature dimensions. Choose your ML fighters wisely!`,
            regression: `A powerful regression dataset emerges! This level ${basicAnalysis.difficulty} numerical predictor contains ${basicAnalysis.shape?.rows} training examples with ${basicAnalysis.shape?.cols} features. Prepare for continuous target battles!`,
            clustering: `An unsupervised dataset approaches! This mysterious level ${basicAnalysis.difficulty} data contains ${basicAnalysis.shape?.rows} unlabeled samples waiting to be grouped. Clustering algorithms, this is your moment!`
        };

        const commonChallenges = [
            'High-dimensional feature space may cause curse of dimensionality',
            'Potential overfitting with complex models',
            'Feature scaling may be required for optimal performance',
            'Cross-validation needed for reliable performance estimates'
        ];

        if (basicAnalysis.statistics?.missingValues! > 0) {
            commonChallenges.unshift('Missing values require preprocessing strategy');
        }

        const algorithmRecommendations = {
            classification: [
                { algorithm: 'Random Forest', reason: 'Handles mixed data types and provides feature importance' },
                { algorithm: 'SVM', reason: 'Effective for high-dimensional data with clear margins' },
                { algorithm: 'Neural Network', reason: 'Can learn complex non-linear patterns' }
            ],
            regression: [
                { algorithm: 'Gradient Boosting', reason: 'Excellent for non-linear regression problems' },
                { algorithm: 'Random Forest', reason: 'Robust against outliers and overfitting' },
                { algorithm: 'SVM', reason: 'Good for high-dimensional regression tasks' }
            ],
            clustering: [
                { algorithm: 'K-Means', reason: 'Fast and effective for spherical clusters' },
                { algorithm: 'Random Forest', reason: 'Can be used for unsupervised feature selection' },
                { algorithm: 'Neural Network', reason: 'Autoencoders can learn complex representations' }
            ]
        };

        return {
            description: fallbackDescriptions[basicAnalysis.problemType as keyof typeof fallbackDescriptions],
            challenges: commonChallenges.slice(0, 4),
            recommendations: algorithmRecommendations[basicAnalysis.problemType as keyof typeof algorithmRecommendations]
        };
    }
}