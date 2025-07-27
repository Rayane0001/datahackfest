<!-- @file src/lib/components/arena/phases/FighterSelection.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { getAlgorithmSprites } from '$lib/stores/theme';
    import { trainingResults } from '$lib/stores/trainingResults';
    import type { Fighter } from '$lib/ml/algorithms';
    import type { CombatEngine } from '$lib/ml/combat';
    import { playAudio } from '$lib/stores/audioPlayer';
    import TrainingResults from '../TrainingResults.svelte';

    export let combatEngine: CombatEngine;
    export let currentDataset: any;
    export let isLoading: boolean;
    export let datasetAnalysis: any = null;

    const dispatch = createEventDispatcher();

    let fighter1: Fighter | null = null;
    let fighter2: Fighter | null = null;
    let sessionId: string | null = null;
    let showTrainingResults = false;

    const availableAlgorithms = [
        { name: 'Random Forest', color: '#2563eb', type: 'ensemble' },
        { name: 'Neural Network', color: '#1e40af', type: 'neural' },
        { name: 'Support Vector Machine', color: '#1d4ed8', type: 'geometric' },
        { name: 'Gradient Boosting', color: '#3b82f6', type: 'boosting' },
        { name: 'K-Means Clustering', color: '#60a5fa', type: 'clustering' },
        { name: 'Naive Bayes', color: '#93c5fd', type: 'probabilistic' }
    ];

    // Subscribe to training results to show visualization
    let unsubscribe: (() => void) | undefined;

    $: if (typeof window !== 'undefined') {
        unsubscribe?.();
        unsubscribe = trainingResults.subscribe(store => {
            // Only show training results if there's active training or explicitly requested
            const hasActiveTraining = Object.values(store.progressMap).some(p => p.isTraining);
            const hasCompletedTraining = store.currentSession?.algorithms.length > 0;
            showTrainingResults = hasActiveTraining || (store.showResults && hasCompletedTraining);
        });
    }

    async function selectFighter(slot: 1 | 2, algorithm: any) {
        playAudio("/audio/button_real.wav");

        if (!currentDataset) {
            alert('Please upload a dataset first!');
            return;
        }

        // Start session if not already started
        if (!sessionId) {
            sessionId = trainingResults.startSession(currentDataset.name || 'Unknown Dataset');
        }

        dispatch('loading', true);

        try {
            // Start training progress tracking
            trainingResults.startAlgorithmTraining(algorithm.name);

            // Simulate training progress for visual feedback
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15 + 5;

                let currentMetric = 'Initializing...';
                if (progress > 20) currentMetric = 'Loading dataset...';
                if (progress > 40) currentMetric = 'Training model...';
                if (progress > 60) currentMetric = 'Calculating metrics...';
                if (progress > 80) currentMetric = 'Finalizing results...';

                trainingResults.updateProgress(algorithm.name, Math.min(progress, 95), currentMetric);

                if (progress >= 95) {
                    clearInterval(progressInterval);
                }
            }, 200);

            // Actual training
            const fighter = await combatEngine.createFighterFromDataset(
                algorithm.name,
                algorithm.color,
                algorithm.type,
                currentDataset
            );

            // Complete progress
            clearInterval(progressInterval);
            trainingResults.updateProgress(algorithm.name, 100, 'Training Complete!');

            // Store training metrics
            const metrics = {
                algorithmName: algorithm.name,
                accuracy: fighter.precision,
                precision: fighter.precision,
                recall: fighter.recall,
                f1Score: fighter.f1Score,
                trainingTime: fighter.trainingTime,
                fighter: fighter
            };

            trainingResults.completeAlgorithmTraining(algorithm.name, metrics);

            // Assign fighter to slot
            if (slot === 1) {
                fighter1 = fighter;
            } else {
                fighter2 = fighter;
            }

            // If both fighters are ready, complete the session
            if (fighter1 && fighter2) {
                setTimeout(() => {
                    trainingResults.completeSession();
                }, 500);
            }

        } catch (error) {
            console.error('Failed to create fighter:', error);
            trainingResults.updateProgress(algorithm.name, 0, 'Training Failed');
        } finally {
            dispatch('loading', false);
        }
    }

    function proceedToBattle() {
        playAudio("/audio/button_real.wav");
        if (fighter1 && fighter2) {
            dispatch('fighters-selected', { fighter1, fighter2 });
        }
    }

    function getLevel(fighter: Fighter): number {
        if (!fighter) return 50;
        return Math.floor((fighter.attack + fighter.defense + fighter.speed) / 3) || 50;
    }

    function resetFighter(slot: 1 | 2) {
        playAudio('/audio/button_real.wav');

        // Clear fighter from UI
        if (slot === 1) {
            fighter1 = null;
        } else {
            fighter2 = null;
        }

        // Hide training results when resetting fighters
        trainingResults.hideResults();

        // Clear session if no fighters remain
        if (!fighter1 && !fighter2) {
            trainingResults.clearSession();
            sessionId = null;
        }
    }

    function showResultsDashboard() {
        playAudio("/audio/button_real.wav");
        trainingResults.toggleResults();
    }
</script>

<div class="pokemon-selection-screen">
    <div class="selection-header">
        <h1>Choose Your Fighters!</h1>
        <p class="subtitle">Select two ML algorithms to battle with your dataset</p>

        {#if fighter1 || fighter2}
            <button class="results-button" on:click={showResultsDashboard}>
                📊 View Training Results
            </button>
        {/if}
    </div>

    {#if fighter1 && fighter2}
        <div class="battle-controls">
            <button class="proceed-button" on:click={proceedToBattle}>
                🚀 Proceed to Battle Configuration
            </button>
        </div>
    {/if}

    <div class="selection-grid">
        <div class="trainer-section player-section">
            <div class="trainer-header">
                <h2>👤 Player 1 (You)</h2>
            </div>

            {#if fighter1}
                <div class="selected-pokemon" style="border-color: {fighter1.color}">
                    <div class="pokemon-sprite-container">
                        <img
                                src={getAlgorithmSprites(fighter1.name).front}
                                alt="{fighter1.name} sprite"
                                class="pokemon-sprite selected"
                                on:error={() => console.warn(`Failed to load sprite for ${fighter1.name}`)}
                        />
                    </div>
                    <div class="pokemon-info">
                        <div class="pokemon-name">{fighter1.name}</div>
                        <div class="pokemon-level">Lv. {getLevel(fighter1)}</div>
                        <div class="pokemon-type type-{fighter1.type}">{fighter1.type.toUpperCase()}</div>
                    </div>
                    <div class="pokemon-stats">
                        <div class="stat">
                            <span class="stat-name">ATK</span>
                            <span class="stat-value">{Math.round(fighter1.attack)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-name">DEF</span>
                            <span class="stat-value">{Math.round(fighter1.defense)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-name">SPD</span>
                            <span class="stat-value">{Math.round(fighter1.speed)}</span>
                        </div>
                    </div>

                    <div class="ml-performance">
                        <div class="performance-grid">
                            <div class="performance-bar">
                                <span class="metric-label">Accuracy</span>
                                <div class="bar">
                                    <div class="fill" style="width: {fighter1.precision * 100}%; background: {fighter1.color}"></div>
                                </div>
                                <span class="metric-value">{(fighter1.precision * 100).toFixed(1)}%</span>
                            </div>

                            <div class="performance-bar">
                                <span class="metric-label">Precision</span>
                                <div class="bar">
                                    <div class="fill" style="width: {fighter1.precision * 100}%; background: {fighter1.color}"></div>
                                </div>
                                <span class="metric-value">{(fighter1.precision * 100).toFixed(1)}%</span>
                            </div>

                            <div class="performance-bar">
                                <span class="metric-label">Recall</span>
                                <div class="bar">
                                    <div class="fill" style="width: {fighter1.recall * 100}%; background: {fighter1.color}"></div>
                                </div>
                                <span class="metric-value">{(fighter1.recall * 100).toFixed(1)}%</span>
                            </div>
                        </div>

                        <div class="training-time">
                            ⏱️ Training Time: {fighter1.trainingTime.toFixed(2)}s
                        </div>
                    </div>

                    <button class="change-fighter-button" on:click={() => resetFighter(1)}>
                        🔄 Change Fighter
                    </button>
                </div>
            {:else}
                <div class="pokemon-selection-grid">
                    {#each availableAlgorithms as algo}
                        <button
                                class="pokemon-card"
                                style="--type-color: {algo.color}"
                                on:click={() => {
                                selectFighter(1, algo);
                                setTimeout(() => playAudio(`/audio/${algo.type}.mp3`, true), 250)
                            }}
                                disabled={isLoading}
                        >
                            <div class="card-sprite-container">
                                <img
                                        src={getAlgorithmSprites(algo.name).front}
                                        alt="{algo.name} sprite"
                                        class="card-sprite"
                                        on:error={() => console.warn(`Failed to load sprite for ${algo.name}`)}
                                />
                            </div>
                            <div class="card-info">
                                <div class="card-name">{algo.name}</div>
                                <div class="card-type type-{algo.type}">{algo.type}</div>
                            </div>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="vs-section">
            <div class="vs-circle">
                <span class="vs-text">VS</span>
            </div>
            {#if fighter1 && fighter2}
                <div class="vs-lightning">⚡</div>
            {/if}
        </div>

        <div class="trainer-section ai-section">
            <div class="trainer-header">
                <h2>🤖 Player 2 (AI)</h2>
            </div>

            {#if fighter2}
                <div class="selected-pokemon" style="border-color: {fighter2.color}">
                    <div class="pokemon-sprite-container">
                        <img
                                src={getAlgorithmSprites(fighter2.name).front}
                                alt="{fighter2.name} sprite"
                                class="pokemon-sprite selected"
                                on:error={() => console.warn(`Failed to load sprite for ${fighter2.name}`)}
                        />
                    </div>
                    <div class="pokemon-info">
                        <div class="pokemon-name">{fighter2.name}</div>
                        <div class="pokemon-level">Lv. {getLevel(fighter2)}</div>
                        <div class="pokemon-type type-{fighter2.type}">{fighter2.type.toUpperCase()}</div>
                    </div>
                    <div class="pokemon-stats">
                        <div class="stat">
                            <span class="stat-name">ATK</span>
                            <span class="stat-value">{Math.round(fighter2.attack)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-name">DEF</span>
                            <span class="stat-value">{Math.round(fighter2.defense)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-name">SPD</span>
                            <span class="stat-value">{Math.round(fighter2.speed)}</span>
                        </div>
                    </div>

                    <div class="ml-performance">
                        <div class="performance-grid">
                            <div class="performance-bar">
                                <span class="metric-label">Accuracy</span>
                                <div class="bar">
                                    <div class="fill" style="width: {fighter2.precision * 100}%; background: {fighter2.color}"></div>
                                </div>
                                <span class="metric-value">{(fighter2.precision * 100).toFixed(1)}%</span>
                            </div>

                            <div class="performance-bar">
                                <span class="metric-label">Precision</span>
                                <div class="bar">
                                    <div class="fill" style="width: {fighter2.precision * 100}%; background: {fighter2.color}"></div>
                                </div>
                                <span class="metric-value">{(fighter2.precision * 100).toFixed(1)}%</span>
                            </div>

                            <div class="performance-bar">
                                <span class="metric-label">Recall</span>
                                <div class="bar">
                                    <div class="fill" style="width: {fighter2.recall * 100}%; background: {fighter2.color}"></div>
                                </div>
                                <span class="metric-value">{(fighter2.recall * 100).toFixed(1)}%</span>
                            </div>
                        </div>

                        <div class="training-time">
                            ⏱️ Training Time: {fighter2.trainingTime.toFixed(2)}s
                        </div>
                    </div>

                    <button class="change-fighter-button" on:click={() => resetFighter(2)}>
                        🔄 Change Fighter
                    </button>
                </div>
            {:else}
                <div class="pokemon-selection-grid">
                    {#each availableAlgorithms as algo}
                        <button
                                class="pokemon-card"
                                style="--type-color: {algo.color}"
                                on:click={() => selectFighter(2, algo)}
                                disabled={isLoading}
                        >
                            <div class="card-sprite-container">
                                <img
                                        src={getAlgorithmSprites(algo.name).front}
                                        alt="{algo.name} sprite"
                                        class="card-sprite"
                                        on:error={() => console.warn(`Failed to load sprite for ${algo.name}`)}
                                />
                            </div>
                            <div class="card-info">
                                <div class="card-name">{algo.name}</div>
                                <div class="card-type type-{algo.type}">{algo.type}</div>
                            </div>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    </div>

    {#if isLoading}
        <div class="loading-overlay">
            <div class="pokeball-loading">
                <div class="pokeball">
                    <div class="pokeball-top"></div>
                    <div class="pokeball-bottom"></div>
                    <div class="pokeball-center"></div>
                </div>
                <p>Training {isLoading ? 'algorithm' : ''} on your dataset...</p>
            </div>
        </div>
    {/if}
</div>

<TrainingResults visible={showTrainingResults} {datasetAnalysis} />

<style>
    .results-button {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 15px;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
    }

    .results-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(245, 158, 11, 0.35);
    }

    .performance-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 15px;
    }

    .performance-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
    }

    .metric-label {
        min-width: 60px;
        color: #64748b;
        font-weight: 600;
    }

    :global(.theme-dark) .metric-label {
        color: #94a3b8;
    }

    .bar {
        flex: 1;
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
    }

    :global(.theme-dark) .bar {
        background: #334155;
    }

    .fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.5s ease;
    }

    .metric-value {
        min-width: 40px;
        text-align: right;
        font-weight: 600;
        color: #1e293b;
    }

    :global(.theme-dark) .metric-value {
        color: #f1f5f9;
    }

    .training-time {
        text-align: center;
        font-size: 0.9rem;
        color: #64748b;
        font-weight: 600;
        padding: 8px;
        background: rgba(15, 23, 42, 0.1);
        border-radius: 6px;
    }

    :global(.theme-dark) .training-time {
        background: rgba(15, 23, 42, 0.3);
        color: #94a3b8;
    }

    .pokemon-selection-screen {
        min-height: 100vh;
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
        padding: 80px 20px 20px;
        font-family: 'Courier New', monospace;
    }

    :global(.theme-dark) .pokemon-selection-screen {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
    }

    .selection-header {
        text-align: center;
        margin-bottom: 40px;
    }

    .selection-header h1 {
        font-size: 3rem;
        margin: 0 0 10px 0;
        color: #f1f5f9;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .subtitle {
        font-size: 1.2rem;
        color: #cbd5e1;
        margin: 0;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }

    .selection-grid {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 40px;
        max-width: 1400px;
        margin: 0 auto;
        align-items: start;
    }

    .trainer-section {
        background: rgba(148, 163, 184, 0.15);
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(148, 163, 184, 0.2);
    }

    :global(.theme-dark) .trainer-section {
        background: rgba(30, 41, 59, 0.3);
        border-color: rgba(71, 85, 105, 0.3);
        color: #f1f5f9;
    }

    .trainer-header h2 {
        text-align: center;
        margin: 0 0 30px 0;
        color: #f1f5f9;
        font-size: 1.5rem;
    }

    .pokemon-selection-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
    }

    .pokemon-card {
        background: rgba(255, 255, 255, 0.9);
        border: 3px solid var(--type-color);
        border-radius: 15px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        min-height: 120px;
    }

    :global(.theme-dark) .pokemon-card {
        background: rgba(30, 41, 59, 0.8);
        color: #f1f5f9;
    }

    .pokemon-card:hover:not(:disabled) {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        border-width: 4px;
    }

    .pokemon-card:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .card-sprite-container {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .card-sprite {
        width: 100%;
        height: 100%;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
    }

    .card-info {
        text-align: center;
    }

    .card-name {
        font-weight: 600;
        font-size: 0.9rem;
        color: #1e293b;
        margin-bottom: 5px;
    }

    :global(.theme-dark) .card-name {
        color: #f1f5f9;
    }

    .card-type {
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.7rem;
        font-weight: 600;
        color: #fff;
        text-transform: uppercase;
    }

    .selected-pokemon {
        background: rgba(255, 255, 255, 0.95);
        border: 4px solid;
        border-radius: 20px;
        padding: 25px;
        text-align: center;
        animation: selectedGlow 2s ease-in-out infinite;
    }

    :global(.theme-dark) .selected-pokemon {
        background: rgba(30, 41, 59, 0.9);
        color: #f1f5f9;
    }

    @keyframes selectedGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(37, 99, 235, 0.5); }
        50% { box-shadow: 0 0 30px rgba(37, 99, 235, 0.8); }
    }

    .pokemon-sprite-container {
        width: 120px;
        height: 120px;
        margin: 0 auto 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%);
        border-radius: 50%;
    }

    .pokemon-sprite.selected {
        width: 100px;
        height: 100px;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.4));
        animation: bobbing 2s ease-in-out infinite;
    }

    @keyframes bobbing {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }

    .pokemon-info {
        margin-bottom: 20px;
    }

    .pokemon-name {
        font-size: 1.5rem;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 5px;
    }

    :global(.theme-dark) .pokemon-name {
        color: #f1f5f9;
    }

    .pokemon-level {
        font-size: 1.1rem;
        color: #475569;
        margin-bottom: 8px;
    }

    :global(.theme-dark) .pokemon-level {
        color: #94a3b8;
    }

    .pokemon-type {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #fff;
        text-transform: uppercase;
    }

    .pokemon-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin-bottom: 20px;
    }

    .stat {
        text-align: center;
        background: rgba(15, 23, 42, 0.1);
        padding: 10px;
        border-radius: 8px;
    }

    :global(.theme-dark) .stat {
        background: rgba(15, 23, 42, 0.3);
    }

    .stat-name {
        display: block;
        font-size: 0.8rem;
        color: #64748b;
        margin-bottom: 5px;
    }

    :global(.theme-dark) .stat-name {
        color: #94a3b8;
    }

    .stat-value {
        display: block;
        font-size: 1.2rem;
        font-weight: 600;
        color: #1e293b;
    }

    :global(.theme-dark) .stat-value {
        color: #f1f5f9;
    }

    .ml-performance {
        margin-top: 20px;
    }

    .vs-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
    }

    .vs-circle {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
        animation: pulse 2s ease-in-out infinite;
    }

    .vs-text {
        font-size: 1.5rem;
        font-weight: 600;
        color: #fff;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .vs-lightning {
        font-size: 2rem;
        animation: lightning 1s ease-in-out infinite;
        color: #fbbf24;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }

    @keyframes lightning {
        0%, 100% { transform: rotate(0deg) scale(1); }
        25% { transform: rotate(-10deg) scale(1.2); }
        75% { transform: rotate(10deg) scale(1.2); }
    }

    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }

    .pokeball-loading {
        text-align: center;
        color: #fff;
    }

    .pokeball {
        width: 60px;
        height: 60px;
        margin: 0 auto 20px;
        position: relative;
        animation: bounce 1s ease-in-out infinite;
    }

    .pokeball-top {
        width: 100%;
        height: 50%;
        background: #dc2626;
        border-radius: 60px 60px 0 0;
        border: 3px solid #1f2937;
        border-bottom: none;
    }

    .pokeball-bottom {
        width: 100%;
        height: 50%;
        background: #f1f5f9;
        border-radius: 0 0 60px 60px;
        border: 3px solid #1f2937;
        border-top: none;
    }

    .pokeball-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        background: #f1f5f9;
        border: 3px solid #1f2937;
        border-radius: 50%;
    }

    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }

    .change-fighter-button {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 15px;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
    }

    .change-fighter-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(220, 38, 38, 0.35);
    }

    .battle-controls {
        display: flex;
        justify-content: center;
        margin-top: 60px;
        padding-bottom: 40px;
    }

    .proceed-button {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
        border: none;
        padding: 20px 40px;
        border-radius: 12px;
        font-size: 1.2rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
        animation: readyGlow 2s ease-in-out infinite;
    }

    .proceed-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
    }

    @keyframes readyGlow {
        0%, 100% { box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3); }
        50% { box-shadow: 0 8px 30px rgba(37, 99, 235, 0.5); }
    }

    .type-ensemble { background: #2563eb; }
    .type-neural { background: #1e40af; }
    .type-geometric { background: #1d4ed8; }
    .type-boosting { background: #3b82f6; }
    .type-probabilistic { background: #93c5fd; }
    .type-clustering { background: #60a5fa; }

    @media (max-width: 1200px) {
        .selection-grid {
            grid-template-columns: 1fr;
            gap: 30px;
        }

        .vs-section {
            order: -1;
        }

        .pokemon-selection-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    @media (max-width: 768px) {
        .selection-header h1 {
            font-size: 2rem;
        }

        .pokemon-selection-grid {
            grid-template-columns: 1fr 1fr;
        }

        .trainer-section {
            padding: 20px;
        }

        .performance-grid {
            gap: 6px;
        }

        .performance-bar {
            font-size: 0.7rem;
        }

        .metric-label {
            min-width: 50px;
        }

        .metric-value {
            min-width: 35px;
        }
    }
</style>