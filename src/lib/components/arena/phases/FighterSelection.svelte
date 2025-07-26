<!-- @file src/lib/components/arena/phases/FighterSelection.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Fighter } from '$lib/ml/algorithms';
    import type { CombatEngine } from '$lib/ml/combat';

    export let combatEngine: CombatEngine;
    export let currentDataset: any;
    export let isLoading: boolean;

    const dispatch = createEventDispatcher();

    // Fighter state
    let fighter1: Fighter | null = null;
    let fighter2: Fighter | null = null;

    // Available algorithms
    const availableAlgorithms = [
        { name: 'Random Forest', color: '#22c55e', type: 'forest', emoji: '🌳' },
        { name: 'Neural Network', color: '#3b82f6', type: 'neural', emoji: '🧠' },
        { name: 'Support Vector Machine', color: '#ef4444', type: 'svm', emoji: '⚔️' },
        { name: 'Gradient Boosting', color: '#f59e0b', type: 'gradient', emoji: '⚡' },
        { name: 'K-Means Clustering', color: '#8b5cf6', type: 'kmeans', emoji: '🎲' },
        { name: 'Naive Bayes', color: '#ec4899', type: 'bayes', emoji: '🎯' }
    ];

    async function selectFighter(slot: 1 | 2, algorithm: any) {
        if (!currentDataset) {
            alert('Please upload a dataset first!');
            return;
        }

        dispatch('loading', true);

        try {
            const fighter = await combatEngine.createFighterFromDataset(
                algorithm.name,
                algorithm.color,
                algorithm.type,
                currentDataset
            );

            if (slot === 1) {
                fighter1 = fighter;
            } else {
                fighter2 = fighter;
            }

            // Check if both fighters are selected
            if (fighter1 && fighter2) {
                dispatch('fighters-selected', { fighter1, fighter2 });
            }
        } catch (error) {
            console.error('Failed to create fighter:', error);
        } finally {
            dispatch('loading', false);
        }
    }
</script>

<div class="fighter-selection-phase">
    <div class="selection-grid">
        <div class="fighter-slot">
            <h3>Fighter 1 (You)</h3>
            {#if fighter1}
                <div class="selected-fighter" style="border-color: {fighter1.color}">
                    <div class="fighter-header">
                        <span class="fighter-emoji">{availableAlgorithms.find(a => a.name === fighter1?.name)?.emoji || '🔥'}</span>
                        <strong>{fighter1.name}</strong>
                    </div>
                    <div class="fighter-stats">
                        <span>ATK: {fighter1.attack.toFixed(1)}</span>
                        <span>DEF: {fighter1.defense.toFixed(1)}</span>
                        <span>SPD: {fighter1.speed.toFixed(1)}</span>
                    </div>
                    <div class="ml-stats">
                        <small>Accuracy: {(fighter1.precision * 100).toFixed(1)}%</small>
                    </div>
                </div>
            {:else}
                <div class="algorithm-grid">
                    {#each availableAlgorithms as algo}
                        <button
                                class="algo-button"
                                style="background-color: {algo.color}20; border-color: {algo.color}"
                                on:click={() => selectFighter(1, algo)}
                                disabled={isLoading}
                        >
                            <span class="algo-emoji">{algo.emoji}</span>
                            <span class="algo-name">{algo.name}</span>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="vs-divider">
            <span>VS</span>
        </div>

        <div class="fighter-slot">
            <h3>Fighter 2 (AI)</h3>
            {#if fighter2}
                <div class="selected-fighter" style="border-color: {fighter2.color}">
                    <div class="fighter-header">
                        <span class="fighter-emoji">{availableAlgorithms.find(a => a.name === fighter2?.name)?.emoji || '🔥'}</span>
                        <strong>{fighter2.name}</strong>
                    </div>
                    <div class="fighter-stats">
                        <span>ATK: {fighter2.attack.toFixed(1)}</span>
                        <span>DEF: {fighter2.defense.toFixed(1)}</span>
                        <span>SPD: {fighter2.speed.toFixed(1)}</span>
                    </div>
                    <div class="ml-stats">
                        <small>Accuracy: {(fighter2.precision * 100).toFixed(1)}%</small>
                    </div>
                </div>
            {:else}
                <div class="algorithm-grid">
                    {#each availableAlgorithms as algo}
                        <button
                                class="algo-button"
                                style="background-color: {algo.color}20; border-color: {algo.color}"
                                on:click={() => selectFighter(2, algo)}
                                disabled={isLoading}
                        >
                            <span class="algo-emoji">{algo.emoji}</span>
                            <span class="algo-name">{algo.name}</span>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    </div>

    {#if isLoading}
        <div class="loading-indicator">
            <div class="spinner">⚡</div>
            <p>Training algorithm on your dataset...</p>
        </div>
    {/if}
</div>

<style>
    .fighter-selection-phase {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .selection-grid {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }

    .fighter-slot h3 {
        text-align: center;
        margin-bottom: 15px;
        color: #ccc;
    }

    .algorithm-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }

    .algo-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        padding: 15px 10px;
        border: 2px solid;
        background: transparent;
        color: #fff;
        border-radius: 8px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.3s ease;
        min-height: 80px;
    }

    .algo-button:hover:not(:disabled) {
        transform: scale(1.05);
        box-shadow: 0 0 15px currentColor;
    }

    .algo-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .algo-emoji {
        font-size: 1.5rem;
    }

    .algo-name {
        font-size: 0.9rem;
        text-align: center;
        line-height: 1.2;
    }

    .selected-fighter {
        border: 2px solid;
        border-radius: 8px;
        padding: 15px;
        text-align: center;
    }

    .fighter-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        justify-content: center;
    }

    .fighter-emoji {
        font-size: 1.5rem;
    }

    .fighter-stats {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        font-size: 0.9rem;
        color: #ccc;
    }

    .ml-stats {
        margin-top: 8px;
        color: #999;
        text-align: center;
    }

    .vs-divider {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: bold;
        color: #ff6b6b;
    }

    .loading-indicator {
        text-align: center;
        padding: 20px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        border: 1px solid #333;
    }

    .spinner {
        font-size: 2rem;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
        .selection-grid {
            grid-template-columns: 1fr;
            gap: 15px;
        }

        .vs-divider {
            order: -1;
        }

        .algorithm-grid {
            grid-template-columns: 1fr;
        }
    }
</style>