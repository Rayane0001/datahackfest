// @file src/lib/stores/trainingResults.ts

import { writable } from 'svelte/store';
import type { Fighter } from '$lib/ml/algorithms';

export interface TrainingProgress {
    algorithmName: string;
    progress: number; // 0-100
    currentMetric: string;
    isTraining: boolean;
    completed: boolean;
}

export interface TrainingMetrics {
    algorithmName: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    trainingTime: number;
    fighter?: Fighter;
}

export interface TrainingSession {
    sessionId: string;
    datasetName: string;
    algorithms: TrainingMetrics[];
    startTime: Date;
    endTime?: Date;
    isComplete: boolean;
}

interface TrainingStore {
    currentSession: TrainingSession | null;
    progressMap: Record<string, TrainingProgress>;
    allSessions: TrainingSession[];
    showResults: boolean;
}

function createTrainingResultsStore() {
    const { subscribe, set, update } = writable<TrainingStore>({
        currentSession: null,
        progressMap: {},
        allSessions: [],
        showResults: false
    });

    return {
        subscribe,

        // Start a new training session
        startSession: (datasetName: string) => {
            const sessionId = `session_${Date.now()}`;
            const newSession: TrainingSession = {
                sessionId,
                datasetName,
                algorithms: [],
                startTime: new Date(),
                isComplete: false
            };

            update(store => ({
                ...store,
                currentSession: newSession,
                progressMap: {},
                showResults: false
            }));

            return sessionId;
        },

        // Start training for a specific algorithm
        startAlgorithmTraining: (algorithmName: string) => {
            update(store => ({
                ...store,
                progressMap: {
                    ...store.progressMap,
                    [algorithmName]: {
                        algorithmName,
                        progress: 0,
                        currentMetric: 'Initializing...',
                        isTraining: true,
                        completed: false
                    }
                },
                showResults: false
            }));
        },

        // Update training progress
        updateProgress: (algorithmName: string, progress: number, currentMetric: string) => {
            update(store => ({
                ...store,
                progressMap: {
                    ...store.progressMap,
                    [algorithmName]: {
                        ...store.progressMap[algorithmName],
                        progress: Math.min(100, Math.max(0, progress)),
                        currentMetric,
                        isTraining: progress < 100
                    }
                }
            }));
        },

        // Complete algorithm training with results
        completeAlgorithmTraining: (algorithmName: string, metrics: TrainingMetrics) => {
            update(store => {
                const updatedSession = store.currentSession ? {
                    ...store.currentSession,
                    algorithms: [
                        ...store.currentSession.algorithms.filter(a => a.algorithmName !== algorithmName),
                        metrics
                    ]
                } : null;

                return {
                    ...store,
                    currentSession: updatedSession,
                    progressMap: {
                        ...store.progressMap,
                        [algorithmName]: {
                            ...store.progressMap[algorithmName],
                            progress: 100,
                            currentMetric: 'Training Complete!',
                            isTraining: false,
                            completed: true
                        }
                    }
                };
            });
        },

        // Complete the entire session
        completeSession: () => {
            update(store => {
                if (!store.currentSession) return store;

                const completedSession = {
                    ...store.currentSession,
                    endTime: new Date(),
                    isComplete: true
                };

                return {
                    ...store,
                    currentSession: completedSession,
                    allSessions: [...store.allSessions, completedSession],
                    showResults: true
                };
            });
        },

        // Show/hide results panel
        toggleResults: () => {
            update(store => ({
                ...store,
                showResults: !store.showResults
            }));
        },

        // Hide results panel
        hideResults: () => {
            update(store => ({
                ...store,
                showResults: false
            }));
        },

        // Clear current session
        clearSession: () => {
            update(store => ({
                ...store,
                currentSession: null,
                progressMap: {},
                showResults: false
            }));
        },

        // Get comparison data for charts
        getComparisonData: () => {
            let comparisonData: any[] = [];

            subscribe(store => {
                if (store.currentSession?.algorithms.length) {
                    comparisonData = store.currentSession.algorithms.map(algo => ({
                        algorithm: algo.algorithmName,
                        accuracy: Math.round(algo.accuracy * 100),
                        precision: Math.round(algo.precision * 100),
                        recall: Math.round(algo.recall * 100),
                        f1Score: Math.round(algo.f1Score * 100),
                        trainingTime: Number(algo.trainingTime.toFixed(2)),
                        color: algo.fighter?.color || '#3b82f6'
                    }));
                }
            })();

            return comparisonData;
        }
    };
}

export const trainingResults = createTrainingResultsStore();