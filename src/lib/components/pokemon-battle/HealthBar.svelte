<script lang="ts">
    import { onMount } from 'svelte';
    import type { Fighter } from '$lib/ml/algorithms';

    export let fighter: Fighter;
    export let isPlayer: boolean = false;
    export let showDetailedStats: boolean = false;

    let previousHealth = fighter.maxHealth;
    let isAnimating = false;

    $: healthPercentage = (fighter.health / fighter.maxHealth) * 100;
    $: healthColor = getHealthColor(healthPercentage);
    $: level = Math.floor(fighter.attack + fighter.defense + fighter.speed) || 50;

    $: if (fighter.health !== previousHealth) {
        animateHealthChange();
        previousHealth = fighter.health;
    }

    function getHealthColor(percentage: number): string {
        if (percentage > 50) return '#4ade80';
        if (percentage > 25) return '#fbbf24';
        return '#ef4444';
    }

    function animateHealthChange() {
        isAnimating = true;
        setTimeout(() => {
            isAnimating = false;
        }, 600);
    }

    onMount(() => {
        previousHealth = fighter.health;
    });
</script>

<div
        class="health-bar-container"
        class:player-bar={isPlayer}
        class:enemy-bar={!isPlayer}
        class:animating={isAnimating}
>
    <div class="pokemon-info">
        <div class="name-level">
            <span class="pokemon-name">{fighter.name}</span>
            <span class="pokemon-level">Lv{level}</span>
        </div>

        {#if !isPlayer}
            <div class="hp-section">
                <div class="hp-label">HP</div>
                <div class="hp-bar-wrapper">
                    <div class="hp-bar">
                        <div
                                class="hp-fill"
                                style="width: {healthPercentage}%; background-color: {healthColor};"
                        ></div>
                    </div>
                </div>
            </div>
        {:else}
            <div class="hp-section">
                <div class="hp-label">HP</div>
                <div class="hp-bar-wrapper">
                    <div class="hp-bar">
                        <div
                                class="hp-fill"
                                style="width: {healthPercentage}%; background-color: {healthColor};"
                        ></div>
                    </div>
                    <div class="hp-numbers">
                        <span class="current-hp">{fighter.health}</span>
                        <span class="hp-separator">/</span>
                        <span class="max-hp">{fighter.maxHealth}</span>
                    </div>
                </div>
            </div>
        {/if}
    </div>

    <div class="status-conditions">
        {#if fighter.health <= 0}
            <div class="status-icon fainted">FNT</div>
        {/if}
    </div>

    {#if showDetailedStats}
        <div class="detailed-stats">
            <div class="stat-row">
                <span class="stat-name">ATK</span>
                <span class="stat-value">{Math.round(fighter.attack)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-name">DEF</span>
                <span class="stat-value">{Math.round(fighter.defense)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-name">SPD</span>
                <span class="stat-value">{Math.round(fighter.speed)}</span>
            </div>
        </div>
    {/if}
</div>

<style>
    .health-bar-container {
        background: #f8f9fa;
        border: 3px solid #212529;
        border-radius: 12px;
        padding: 12px 16px;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        color: #212529;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        min-width: 260px;
        transition: all 0.3s ease;
        position: absolute;
        z-index: 15;
    }

    .player-bar {
        bottom: 25px;
        right: 25px;
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    }

    .enemy-bar {
        top: 25px;
        left: 25px;
        background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    }

    .animating {
        animation: healthBarPulse 0.6s ease-in-out;
    }

    @keyframes healthBarPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }

    .pokemon-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .name-level {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .pokemon-name {
        font-size: 1.1rem;
        color: #1565c0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .pokemon-level {
        font-size: 0.9rem;
        color: #424242;
    }

    .hp-section {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .hp-label {
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 2px;
    }

    .hp-bar-wrapper {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .hp-bar {
        width: 100%;
        height: 8px;
        background: #e0e0e0;
        border: 1px solid #666;
        border-radius: 4px;
        overflow: hidden;
        position: relative;
    }

    .hp-fill {
        height: 100%;
        transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        border-radius: 3px;
        position: relative;
    }

    .hp-fill::after {
        content: '';
        position: absolute;
        top: 1px;
        left: 2px;
        right: 2px;
        height: 2px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 1px;
    }

    .hp-numbers {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 2px;
        font-size: 0.9rem;
        margin-top: 2px;
    }

    .current-hp {
        color: #1565c0;
        font-weight: bold;
    }

    .hp-separator {
        color: #666;
    }

    .max-hp {
        color: #666;
    }

    .status-conditions {
        display: flex;
        gap: 4px;
        margin-top: 6px;
        min-height: 20px;
    }

    .status-icon {
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: bold;
        color: white;
    }

    .status-icon.fainted {
        background: #d32f2f;
        animation: blinkFaint 1s ease-in-out infinite;
    }

    @keyframes blinkFaint {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    .detailed-stats {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #ccc;
    }

    .stat-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
    }

    .stat-name {
        color: #666;
    }

    .stat-value {
        color: #1565c0;
        font-weight: bold;
    }

    :global(.theme-dark) .health-bar-container {
        background: #2d3748;
        color: #e2e8f0;
        border-color: #4a5568;
    }

    :global(.theme-dark) .player-bar {
        background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
    }

    :global(.theme-dark) .enemy-bar {
        background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
    }

    :global(.theme-dark) .pokemon-name {
        color: #63b3ed;
    }

    :global(.theme-dark) .current-hp {
        color: #63b3ed;
    }

    :global(.theme-dark) .hp-bar {
        background: #4a5568;
        border-color: #718096;
    }

    @media (max-width: 768px) {
        .health-bar-container {
            min-width: 200px;
            padding: 8px 12px;
        }

        .player-bar {
            bottom: 15px;
            right: 15px;
        }

        .enemy-bar {
            top: 15px;
            left: 15px;
        }

        .pokemon-name {
            font-size: 1rem;
        }

        .hp-numbers {
            font-size: 0.8rem;
        }
    }
</style>