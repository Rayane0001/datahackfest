<!-- @file src/lib/components/arena/phases/BattleSetup.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { getAlgorithmSprites } from '$lib/stores/theme';
    import type { Fighter } from '$lib/ml/algorithms';
    import type { AILevel } from '$lib/ai/combat-ai';
    import { playAudio } from '$lib/stores/audioPlayer';


    export let fighter1: Fighter | null;
    export let fighter2: Fighter | null;
    export let battleMode: 'tactical' | 'pokemon';
    export let selectedAILevel: AILevel;

    const dispatch = createEventDispatcher();

    function setBattleMode(mode: 'tactical' | 'pokemon') {
        playAudio('/audio/button_real.wav')
        battleMode = mode;
    }

    function setAILevel(level: AILevel) {
        playAudio('/audio/button_real.wav')
        selectedAILevel = level;
    }

    function startBattle() {
        if (!fighter1 || !fighter2) return;
        playAudio(`/audio/battle.wav`)
        setTimeout(() => {
            playAudio("/audio/fight.mp3")
        }, 250)
        dispatch('battle-start', {
            mode: battleMode,
            aiLevel: selectedAILevel
        });
    }

    function goBack() {
        dispatch('back');
    }

    function getLevel(fighter: Fighter): number {
        if (!fighter) return 50;
        return Math.floor((fighter.attack + fighter.defense + fighter.speed) / 3) || 50;
    }
</script>

<div class="battle-setup-screen">
    <div class="setup-header">
        <h1><img src="/icons/battle.png" style="height:45px" /> Battle Configuration</h1>
        <p class="subtitle">Choose your battle mode and difficulty</p>
    </div>

    <!-- Fighters Preview with Sprites -->
    <div class="fighters-showcase">
        <div class="fighter-display left">
            {#if fighter1}
                <div class="fighter-card player-card">
                    <div class="sprite-container">
                        <img
                                src={getAlgorithmSprites(fighter1.name).front}
                                alt="{fighter1.name} sprite"
                                class="fighter-sprite player-sprite"
                        />
                    </div>
                    <div class="fighter-details">
                        <div class="fighter-name">{fighter1.name}</div>
                        <div class="fighter-level">Lv. {getLevel(fighter1)}</div>
                        <div class="fighter-type type-{fighter1.type}">{fighter1.type}</div>
                        <div class="trainer-label"><img src="/icons/player.png" style="height:15px" /></div>
                    </div>
                </div>
            {:else}
                <div class="empty-slot">
                    <div class="empty-sprite">❓</div>
                    <div class="empty-text">No Fighter Selected</div>
                </div>
            {/if}
        </div>

        <div class="vs-lightning-container">
            <div class="vs-lightning">
                <img src="/icons/vs.png" style="height:90px" />
            </div>
            {#if fighter1 && fighter2}
                <div class="type-matchup">
                    <span class="matchup-text">Type Matchup</span>
                    <div class="matchup-display">
                        <span class="type-badge type-{fighter1.type}">{fighter1.type}</span>
                        <span class="vs-small">vs</span>
                        <span class="type-badge type-{fighter2.type}">{fighter2.type}</span>
                    </div>
                </div>
            {/if}
        </div>

        <div class="fighter-display right">
            {#if fighter2}
                <div class="fighter-card ai-card">
                    <div class="sprite-container">
                        <img
                                src={getAlgorithmSprites(fighter2.name).front}
                                alt="{fighter2.name} sprite"
                                class="fighter-sprite ai-sprite"
                        />
                    </div>
                    <div class="fighter-details">
                        <div class="fighter-name">{fighter2.name}</div>
                        <div class="fighter-level">Lv. {getLevel(fighter2)}</div>
                        <div class="fighter-type type-{fighter2.type}">{fighter2.type}</div>
                        <div class="trainer-label"><img src="/icons/ai.png" style="height:15px" /></div>
                    </div>
                </div>
            {:else}
                <div class="empty-slot">
                    <div class="empty-sprite">❓</div>
                    <div class="empty-text">No Fighter Selected</div>
                </div>
            {/if}
        </div>
    </div>

    <!-- Configuration Panels -->
    <div class="config-panels">
        <!-- Battle Mode Selection -->
        <div class="config-panel">
            <h3><img src="/icons/battle-mode.png" style="height:45px"/> Battle Mode</h3>
            <div class="mode-selection">
                <button
                        class="mode-card"
                        class:selected={battleMode === 'pokemon'}
                        on:click={() => setBattleMode('pokemon')}
                >
                    <div class="mode-icon">
                        <img src="/icons/pokemon-battle.png" style="height:90px" />
                    </div>
                    <div class="mode-info">
                        <div class="mode-title">
                            Pokemon Battle
                        </div>
                        <div class="mode-description">Classic battle system with sprites, animations, and authentic combat mechanics</div>
                    </div>
                    <div class="mode-features">
                        <span class="feature">Visual Sprites</span>
                        <span class="feature">Animated Combat</span>
                        <span class="feature">Type Effectiveness</span>
                    </div>
                </button>

                <button
                        class="mode-card"
                        class:selected={battleMode === 'tactical'}
                        on:click={() => setBattleMode('tactical')}
                >
                    <div class="mode-icon">
                        <img src="/icons/tactical-battle.png" style="height:90px" />
                    </div>
                    <div class="mode-info">
                        <div class="mode-title">Tactical Mode</div>
                        <div class="mode-description">Advanced combat with detailed statistics, battle logs, and in-depth ML analysis</div>
                    </div>
                    <div class="mode-features">
                        <span class="feature">Detailed Stats</span>
                        <span class="feature">Battle Logs</span>
                        <span class="feature">ML Analysis</span>
                    </div>
                </button>
            </div>
        </div>

        <!-- AI Difficulty Selection -->
        <div class="config-panel">
            <h3><img src="/icons/ai.png" style="height:45px" /> AI Difficulty</h3>
            <div class="difficulty-selection">
                <button
                        class="difficulty-card"
                        class:selected={selectedAILevel === 'easy'}
                        on:click={() => setAILevel('easy')}
                >
                    <div class="difficulty-icon">
                        <img src="/icons/easy-difficulty.png" style="height:90px" />
                    </div>
                    <div class="difficulty-info">
                        <div class="difficulty-title">Easy</div>
                        <div class="difficulty-description">Random moves, basic strategy, perfect for learning</div>
                    </div>
                </button>

                <button
                        class="difficulty-card"
                        class:selected={selectedAILevel === 'normal'}
                        on:click={() => setAILevel('normal')}
                >
                    <div class="difficulty-icon">
                        <img src="/icons/medium-difficulty.png" style="height:90px" />
                    </div>
                    <div class="difficulty-info">
                        <div class="difficulty-title">Normal</div>
                        <div class="difficulty-description">Tactical thinking, considers type advantages</div>
                    </div>
                </button>

                <button
                        class="difficulty-card"
                        class:selected={selectedAILevel === 'hard'}
                        on:click={() => setAILevel('hard')}
                >
                    <div class="difficulty-icon">
                        <img src="/icons/hard-difficulty.png" style="height:90px" />
                    </div>
                    <div class="difficulty-info">
                        <div class="difficulty-title">Hard</div>
                        <div class="difficulty-description">Expert strategy, pattern prediction, optimal play</div>
                    </div>
                </button>
            </div>
        </div>
    </div>

    <!-- Battle Controls -->
    <div class="battle-controls">
        <button class="control-button back-button" on:click={goBack}>
            ← Change Fighters
        </button>

        <button
                class="control-button battle-button"
                class:disabled={!fighter1 || !fighter2}
                on:click={startBattle}
                disabled={!fighter1 || !fighter2}
        >
            <div class="button-content">
                <div class="button-icon">
                    <img src="/icons/fight.png" style="height:30px" />
                </div>
                <div class="button-text">
                    {#if battleMode === 'pokemon'}
                        START POKEMON BATTLE
                    {:else}
                        START TACTICAL COMBAT
                    {/if}
                </div>
            </div>
        </button>
    </div>
</div>

<style>
    .battle-setup-screen {
        min-height: 100vh;
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
        padding: 80px 20px 40px;
        font-family: 'Courier New', monospace;
    }

    :global(.theme-dark) .battle-setup-screen {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
    }

    .setup-header {
        text-align: center;
        margin-bottom: 40px;
    }

    .setup-header h1 {
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

    .fighters-showcase {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 40px;
        margin-bottom: 50px;
        align-items: center;
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 50px;
    }

    .fighter-display {
        display: flex;
        justify-content: center;
    }

    .fighter-card {
        background: rgba(148, 163, 184, 0.15);
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        text-align: center;
        border: 4px solid transparent;
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(148, 163, 184, 0.2);
    }

    :global(.theme-dark) .fighter-card {
        background: rgba(30, 41, 59, 0.3);
        border-color: rgba(71, 85, 105, 0.3);
        color: #f1f5f9;
    }

    .fighter-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent, rgba(37, 99, 235, 0.1), transparent);
        animation: shine 3s ease-in-out infinite;
    }

    @keyframes shine {
        0%, 100% { transform: translateX(-100%); }
        50% { transform: translateX(100%); }
    }

    .sprite-container {
        width: 100px;
        height: 100px;
        margin: 0 auto 20px;
        background: radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }

    .fighter-sprite {
        width: 80px;
        height: 80px;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.4));
        animation: hover 3s ease-in-out infinite;
    }

    @keyframes hover {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
    }

    .fighter-details {
        position: relative;
        z-index: 2;
    }

    .fighter-name {
        font-size: 1.3rem;
        font-weight: 600;
        color: #f1f5f9;
        margin-bottom: 8px;
    }

    .fighter-level {
        font-size: 1rem;
        color: #cbd5e1;
        margin-bottom: 10px;
    }

    .fighter-type {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #fff;
        text-transform: uppercase;
        margin-bottom: 10px;
    }

    .trainer-label {
        font-size: 0.9rem;
        color: #94a3b8;
        font-weight: 600;
    }

    .empty-slot {
        background: rgba(71, 85, 105, 0.3);
        border-radius: 20px;
        padding: 40px 30px;
        text-align: center;
        border: 3px dashed #64748b;
    }

    .empty-sprite {
        font-size: 3rem;
        margin-bottom: 15px;
        opacity: 0.5;
    }

    .empty-text {
        color: #94a3b8;
        font-weight: 600;
    }

    .vs-lightning-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }

    .vs-lightning {
        display: flex;
        align-items: center;
        gap: 15px;
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        padding: 15px 25px;
        border-radius: 20px;
        box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
        animation: pulse 2s ease-in-out infinite;
    }

    .lightning-bolt {
        font-size: 1.5rem;
        animation: lightning 1.5s ease-in-out infinite;
        color: #fbbf24;
    }

    .vs-text {
        font-size: 1.8rem;
        font-weight: 600;
        color: #fff;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .type-matchup {
        background: rgba(148, 163, 184, 0.15);
        border-radius: 15px;
        padding: 15px;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(148, 163, 184, 0.2);
    }

    :global(.theme-dark) .type-matchup {
        background: rgba(30, 41, 59, 0.3);
        border-color: rgba(71, 85, 105, 0.3);
        color: #f1f5f9;
    }

    .matchup-text {
        font-size: 0.9rem;
        color: #94a3b8;
        margin-bottom: 10px;
        display: block;
    }

    .matchup-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    .type-badge {
        padding: 4px 10px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #fff;
        text-transform: uppercase;
    }

    .vs-small {
        font-size: 0.8rem;
        color: #94a3b8;
        font-weight: 600;
    }

    .config-panels {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;
        max-width: 1200px;
        margin: 0 auto 50px;
    }

    .config-panel {
        background: rgba(148, 163, 184, 0.15);
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(148, 163, 184, 0.2);
    }

    :global(.theme-dark) .config-panel {
        background: rgba(30, 41, 59, 0.3);
        border-color: rgba(71, 85, 105, 0.3);
        color: #f1f5f9;
    }

    .config-panel h3 {
        text-align: center;
        margin: 0 0 25px 0;
        font-size: 1.5rem;
        color: #f1f5f9;
    }

    .mode-selection,
    .difficulty-selection {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .mode-card,
    .difficulty-card {
        background: rgba(255, 255, 255, 0.1);
        border: 3px solid #64748b;
        border-radius: 15px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 15px;
        text-align: left;
    }

    :global(.theme-dark) .mode-card,
    :global(.theme-dark) .difficulty-card {
        background: rgba(15, 23, 42, 0.3);
        border-color: #475569;
    }

    .mode-card:hover,
    .difficulty-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .mode-card.selected,
    .difficulty-card.selected {
        border-color: #2563eb;
        background: rgba(37, 99, 235, 0.15);
        box-shadow: 0 0 20px rgba(37, 99, 235, 0.3);
    }

    .mode-icon,
    .mode-info,
    .difficulty-info {
        flex: 1;
    }

    .mode-title,
    .difficulty-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #f1f5f9;
        margin-bottom: 5px;
    }

    .mode-description,
    .difficulty-description {
        font-size: 0.9rem;
        color: #94a3b8;
        line-height: 1.4;
        margin-bottom: 10px;
    }

    .mode-features {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
    }

    .feature {
        background: #2563eb;
        color: #fff;
        padding: 2px 8px;
        border-radius: 8px;
        font-size: 0.7rem;
        font-weight: 600;
    }

    .battle-controls {
        display: flex;
        justify-content: center;
        gap: 30px;
        max-width: 600px;
        margin: 0 auto;
    }

    .control-button {
        padding: 20px 40px;
        border: none;
        border-radius: 15px;
        font-family: inherit;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1.1rem;
    }

    .back-button {
        background: rgba(71, 85, 105, 0.8);
        color: #e2e8f0;
        border: 2px solid #475569;
    }

    .back-button:hover {
        background: #64748b;
        border-color: #64748b;
        transform: translateX(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .battle-button {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: #fff;
        border: none;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.25);
    }

    .battle-button:hover:not(.disabled) {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
    }

    .battle-button.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    .button-content {
        display: flex;
        align-items: center;
        gap: 10px;
        position: relative;
        z-index: 2;
    }

    .button-icon {
        font-size: 1.3rem;
    }

    .button-text {
        font-size: 1rem;
        letter-spacing: 1px;
    }

    .type-ensemble { background: #2563eb; }
    .type-neural { background: #1e40af; }
    .type-geometric { background: #1d4ed8; }
    .type-boosting { background: #3b82f6; }
    .type-probabilistic { background: #93c5fd; }
    .type-clustering { background: #60a5fa; }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }

    @keyframes lightning {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-5deg); }
        75% { transform: rotate(5deg); }
    }

    @media (max-width: 1200px) {
        .fighters-showcase {
            grid-template-columns: 1fr;
            gap: 30px;
        }

        .vs-lightning-container {
            order: -1;
        }

        .config-panels {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 768px) {
        .setup-header h1 {
            font-size: 2rem;
        }

        .fighter-card {
            padding: 20px;
        }

        .difficulty-icon img {
  height: 120px;  /* or 140px — whatever looks right */
  width: auto;
  object-fit: contain;
}

        .battle-controls {
            flex-direction: column;
            gap: 15px;
        }

        .control-button {
            padding: 15px 30px;
            font-size: 1rem;
        }
    }
</style>