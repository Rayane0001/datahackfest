<!-- @file src/lib/components/arena/Arena.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import type { Fighter } from '$lib/ml/algorithms';
    import { CombatEngine } from '$lib/ml/combat';

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let animationId: number;

    // Combat state
    let fighter1: Fighter | null = null;
    let fighter2: Fighter | null = null;
    let combatEngine: CombatEngine;
    let isLoading = false;
    let combatLog: string[] = [];

    // Available algorithms
    const availableAlgorithms = [
        { name: 'Random Forest', color: '#22c55e', type: 'forest' },
        { name: 'Neural Network', color: '#3b82f6', type: 'neural' },
        { name: 'SVM', color: '#ef4444', type: 'svm' },
        { name: 'Gradient Boosting', color: '#f59e0b', type: 'gradient' },
        { name: 'K-Means', color: '#8b5cf6', type: 'kmeans' },
        { name: 'Naive Bayes', color: '#ec4899', type: 'bayes' }
    ];

    onMount(async () => {
        ctx = canvas.getContext('2d')!;
        combatEngine = new CombatEngine();
        await combatEngine.initialize();

        // Set canvas size
        canvas.width = 800;
        canvas.height = 400;

        animate();
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw arena background
        drawArena();

        // Draw fighters if they exist
        if (fighter1) drawFighter(fighter1, 150, 200);
        if (fighter2) drawFighter(fighter2, 650, 200);

        animationId = requestAnimationFrame(animate);
    }

    function drawArena() {
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

    async function selectFighter(slot: 1 | 2, algorithm: any) {
        isLoading = true;
        const fighter = await combatEngine.createFighter(algorithm.name, algorithm.color, algorithm.type);

        if (slot === 1) {
            fighter1 = fighter;
        } else {
            fighter2 = fighter;
        }
        isLoading = false;
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
            if (round.damage > 0) {
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
</script>

<div class="combat-arena">
    <div class="arena-header">
        <h1>🥊 Predictive Combat Arena</h1>
        <p>Where algorithms fight for supremacy!</p>
    </div>

    <div class="arena-container">
        <div class="fighter-selection">
            <div class="fighter-slot">
                <h3>Fighter 1</h3>
                {#if fighter1}
                    <div class="selected-fighter" style="border-color: {fighter1.color}">
                        <strong>{fighter1.name}</strong>
                        <div class="fighter-stats">
                            <span>ATK: {fighter1.attack.toFixed(1)}</span>
                            <span>DEF: {fighter1.defense.toFixed(1)}</span>
                            <span>SPD: {fighter1.speed.toFixed(1)}</span>
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
                                {algo.name}
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
                        <strong>{fighter2.name}</strong>
                        <div class="fighter-stats">
                            <span>ATK: {fighter2.attack.toFixed(1)}</span>
                            <span>DEF: {fighter2.defense.toFixed(1)}</span>
                            <span>SPD: {fighter2.speed.toFixed(1)}</span>
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
                                {algo.name}
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

<style>
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
        padding: 10px;
        border: 2px solid;
        background: transparent;
        color: #fff;
        border-radius: 8px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.3s ease;
    }

    .algo-button:hover:not(:disabled) {
        transform: scale(1.05);
        box-shadow: 0 0 15px currentColor;
    }

    .algo-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .selected-fighter {
        border: 2px solid;
        border-radius: 8px;
        padding: 15px;
        text-align: center;
    }

    .fighter-stats {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        font-size: 0.9rem;
        color: #ccc;
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