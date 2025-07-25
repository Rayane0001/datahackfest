<!-- @file src/lib/components/arena/Arena.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import type { Fighter } from '$lib/ml/algorithms';
    import { CombatEngine } from '$lib/ml/combat';
    import DatasetUpload from './DatasetUpload.svelte';
    import Pokedex from '../pokedex/Pokedex.svelte';

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;
    let animationId: number;

    // Combat state
    let fighter1: Fighter | null = null;
    let fighter2: Fighter | null = null;
    let combatEngine: CombatEngine;
    let isLoading = false;
    let combatLog: string[] = [];

    // Dataset state
    let currentDataset: any = null;
    let datasetAnalysis: any = null;
    let showDatasetUpload = true;
    let showPokedex = false;

    // Available algorithms
    const availableAlgorithms = [
        { name: 'Random Forest', color: '#22c55e', type: 'forest', emoji: '🌳' },
        { name: 'Neural Network', color: '#3b82f6', type: 'neural', emoji: '🧠' },
        { name: 'Support Vector Machine', color: '#ef4444', type: 'svm', emoji: '⚔️' },
        { name: 'Gradient Boosting', color: '#f59e0b', type: 'gradient', emoji: '⚡' },
        { name: 'K-Means Clustering', color: '#8b5cf6', type: 'kmeans', emoji: '🎲' },
        { name: 'Naive Bayes', color: '#ec4899', type: 'bayes', emoji: '🎯' }
    ];

    onMount(async () => {
        // Initialize combat engine immediately
        combatEngine = new CombatEngine();
        await combatEngine.initialize();

        // Canvas setup will happen when we switch to combat phase
    });

    // Setup canvas when switching to combat phase
    async function setupCanvas() {
        if (canvas && !ctx) {
            ctx = canvas.getContext('2d')!;
            canvas.width = 800;
            canvas.height = 400;
            animate();
        }
    }

    function handleDatasetAnalyzed(event: CustomEvent) {
        currentDataset = event.detail.data;
        datasetAnalysis = event.detail.analysis;
        showDatasetUpload = false;

        // Setup canvas when switching to combat phase
        setTimeout(() => setupCanvas(), 100);
    }

    function handleReadyForBattle() {
        // Dataset is ready, user can now select fighters
    }

    function openPokedex() {
        showPokedex = true;
    }

    function closePokedex() {
        showPokedex = false;
    }

    function useAlgorithmFromPokedex(event: CustomEvent) {
        const { algorithmName } = event.detail;
        // Find the algorithm config
        const algo = availableAlgorithms.find(a => a.name === algorithmName);
        if (algo && currentDataset) {
            // Auto-select as fighter 1 if empty, otherwise fighter 2
            if (!fighter1) {
                selectFighter(1, algo);
            } else if (!fighter2) {
                selectFighter(2, algo);
            }
        }
        closePokedex();
    }

    function backToDatasetUpload() {
        // Stop animation before switching
        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        showDatasetUpload = true;
        currentDataset = null;
        datasetAnalysis = null;
        fighter1 = null;
        fighter2 = null;
        combatLog = [];

        // Reset canvas context
        ctx = null;
    }

    async function selectFighter(slot: 1 | 2, algorithm: any) {
        if (!currentDataset) {
            alert('Please upload a dataset first!');
            return;
        }

        if (!combatEngine) {
            console.error('Combat engine not initialized');
            return;
        }

        isLoading = true;
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
        } catch (error) {
            console.error('Failed to create fighter:', error);
        } finally {
            isLoading = false;
        }
    }

    async function startCombat() {
        if (!fighter1 || !fighter2) return;

        combatLog = [];
        const result = await combatEngine.battle(fighter1, fighter2);

        // Animate the combat
        for (let i = 0; i < result.rounds.length; i++) {
            const round = result.rounds[i];
            combatLog = [...combatLog, round.description];

            // Apply damage with animation
            if (round.damage > 0 && fighter1 && fighter2) {
                if (round.attacker === fighter1.name) {
                    fighter2.health = Math.max(0, fighter2.health - round.damage);
                } else {
                    fighter1.health = Math.max(0, fighter1.health - round.damage);
                }
            }

            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        combatLog = [...combatLog, `🏆 ${result.winner} wins!`];
    }

    function resetArena() {
        fighter1 = null;
        fighter2 = null;
        combatLog = [];
    }

    function animate() {
        if (!ctx || !canvas || showDatasetUpload) {
            // Stop animation if no canvas or back to dataset upload
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw arena background
        drawArena();

        // Draw fighters if they exist
        if (fighter1) drawFighter(fighter1, 150, 200);
        if (fighter2) drawFighter(fighter2, 650, 200);

        animationId = requestAnimationFrame(animate);
    }

    function drawArena() {
        if (!ctx) return;

        // Arena floor
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Arena grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }

        // Center line
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
    }

    function drawFighter(fighter: Fighter, x: number, y: number) {
        if (!ctx) return;

        const size = 60;

        // Fighter body
        ctx.fillStyle = fighter.color;
        ctx.fillRect(x - size/2, y - size/2, size, size);

        // Health bar
        const healthWidth = 80;
        const healthHeight = 8;
        ctx.fillStyle = '#333';
        ctx.fillRect(x - healthWidth/2, y - size/2 - 20, healthWidth, healthHeight);
        ctx.fillStyle = fighter.health > 50 ? '#22c55e' : fighter.health > 25 ? '#f59e0b' : '#ef4444';
        ctx.fillRect(x - healthWidth/2, y - size/2 - 20, (healthWidth * fighter.health) / 100, healthHeight);

        // Fighter name
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(fighter.name, x, y + size/2 + 20);

        // Stats
        ctx.font = '10px monospace';
        ctx.fillText(`ATK: ${fighter.attack.toFixed(1)}`, x, y + size/2 + 35);
        ctx.fillText(`DEF: ${fighter.defense.toFixed(1)}`, x, y + size/2 + 50);
    }
</script>

{#if showDatasetUpload}
    <div class="dataset-phase">
        <div class="arena-header">
            <h1>🥊 Predictive Combat Arena</h1>
            <p>Upload your dataset to begin the ultimate ML battle!</p>
        </div>

        <DatasetUpload
                on:dataset-analyzed={handleDatasetAnalyzed}
                on:ready-for-battle={handleReadyForBattle}
        />
    </div>
{:else}
    <div class="combat-arena">
        <div class="arena-header">
            <h1>🥊 Predictive Combat Arena</h1>
            <div class="dataset-info">
                <button class="back-button" on:click={backToDatasetUpload}>
                    ← Back to Dataset
                </button>
                <button class="pokedex-button" on:click={openPokedex}>
                    📖 Pokedex
                </button>
                <div class="current-dataset">
                    📊 {datasetAnalysis?.name} (Level {datasetAnalysis?.difficulty})
                </div>
            </div>
        </div>

        <div class="arena-container">
            <div class="fighter-selection">
                <div class="fighter-slot">
                    <h3>Fighter 1</h3>
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
                    <h3>Fighter 2</h3>
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

            <canvas bind:this={canvas} class="arena-canvas"></canvas>

            <div class="combat-controls">
                <button
                        class="combat-button start"
                        on:click={startCombat}
                        disabled={!fighter1 || !fighter2 || isLoading}
                >
                    ⚔️ START COMBAT
                </button>
                <button
                        class="combat-button reset"
                        on:click={resetArena}
                >
                    🔄 RESET ARENA
                </button>
            </div>

            {#if combatLog.length > 0}
                <div class="combat-log">
                    <h3>Combat Log</h3>
                    <div class="log-entries">
                        {#each combatLog as entry}
                            <div class="log-entry">{entry}</div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>
{/if}

<!-- Pokedex Modal -->
{#if showPokedex}
    <Pokedex
            on:close={closePokedex}
            on:use-in-battle={useAlgorithmFromPokedex}
    />
{/if}

<style>
    .dataset-phase {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    .combat-arena {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Courier New', monospace;
        background: #0a0a0a;
        color: #fff;
        min-height: 100vh;
    }

    .arena-header {
        text-align: center;
        margin-bottom: 30px;
    }

    .arena-header h1 {
        font-size: 2.5rem;
        margin: 0;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .dataset-info {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
        justify-content: center;
    }

    .back-button {
        background: #333;
        color: #ccc;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.3s ease;
    }

    .back-button:hover {
        background: #444;
        transform: translateX(-2px);
    }

    .pokedex-button {
        background: linear-gradient(45deg, #4ecdc4, #45b7d1);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-family: inherit;
        font-weight: bold;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .pokedex-button:hover {
        background: linear-gradient(45deg, #45b7d1, #4ecdc4);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
    }

    .current-dataset {
        color: #4ecdc4;
        font-weight: bold;
        background: rgba(78, 205, 196, 0.1);
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid #4ecdc4;
    }

    .fighter-selection {
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

    .arena-canvas {
        border: 2px solid #333;
        border-radius: 8px;
        background: #111;
        display: block;
        margin: 0 auto;
    }

    .combat-controls {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin: 20px 0;
    }

    .combat-button {
        padding: 12px 24px;
        font-size: 1.1rem;
        font-family: inherit;
        font-weight: bold;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .combat-button.start {
        background: linear-gradient(45deg, #ff6b6b, #ff8e53);
        color: white;
    }

    .combat-button.reset {
        background: #333;
        color: #ccc;
    }

    .combat-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
    }

    .combat-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    .combat-log {
        background: #111;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 20px;
        margin-top: 20px;
    }

    .combat-log h3 {
        margin: 0 0 15px 0;
        color: #ccc;
    }

    .log-entries {
        max-height: 200px;
        overflow-y: auto;
    }

    .log-entry {
        padding: 5px 0;
        border-bottom: 1px solid #222;
        color: #fff;
    }

    .log-entry:last-child {
        border-bottom: none;
        font-weight: bold;
        color: #4ecdc4;
    }
</style>