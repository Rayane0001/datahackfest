<!-- @file src/lib/components/arena/phases/BattleSetup.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { theme } from '$lib/stores/theme';
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
        battleMode = mode;
    }

    function setAILevel(level: AILevel) {
        selectedAILevel = level;
    }

    function startBattle() {
        if (!fighter1 || !fighter2) return;
        playAudio(`/audio/fight.mp3`)

        dispatch('battle-start', {
            mode: battleMode,
            aiLevel: selectedAILevel
        });
    }

    function goBack() {
        dispatch('back');
    }

    function getLevel(fighter: Fighter): number {
        return Math.floor((fighter.attack + fighter.defense + fighter.speed) / 3) || 50;
    }
</script>

<!-- Theme Toggle -->
<button class="theme-toggle" on:click={theme.toggle}>
    {$theme === 'light' ? '🌙' : '☀️'}
</button>

<div class="battle-setup-screen">
    <div class="setup-header">
        <h1>⚔️ Battle Configuration</h1>
        <p class="subtitle">Choose your battle mode and difficulty</p>
    </div>

    <!-- Fighters Preview with Sprites -->
    <div class="fighters-showcase">
        <div class="fighter-display left">
            {#if fighter1}
                <div class="fighter-card player-card">
                    <div class="sprite-container">
                        <img
                                src={getAlgorithmSprites(fighter1.name).back}
                                alt="{fighter1.name} sprite"
                                class="fighter-sprite player-sprite"
                        />
                    </div>
                    <div class="fighter-details">
                        <div class="fighter-name">{fighter1.name}</div>
                        <div class="fighter-level">Lv. {getLevel(fighter1)}</div>
                        <div class="fighter-type type-{fighter1.type}">{fighter1.type}</div>
                        <div class="trainer-label">👤 Player</div>
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
                <div class="lightning-bolt">⚡</div>
                <div class="vs-text">VS</div>
                <div class="lightning-bolt">⚡</div>
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
                        <div class="trainer-label">🤖 AI</div>
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
            <h3>🎮 Battle Mode</h3>
            <div class="mode-selection">
                <button
                        class="mode-card"
                        class:selected={battleMode === 'pokemon'}
                        on:click={() => setBattleMode('pokemon')}
                >
                    <div class="mode-icon">🐾</div>
                    <div class="mode-info">
                        <div class="mode-title">Pokemon Battle</div>
                        <div class="mode-description">Classic Pokemon-style combat with sprites, animations, and authentic battle mechanics</div>
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
                    <div class="mode-icon">🎯</div>
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
            <h3>🤖 AI Difficulty</h3>
            <div class="difficulty-selection">
                <button
                        class="difficulty-card"
                        class:selected={selectedAILevel === 'easy'}
                        on:click={() => setAILevel('easy')}
                >
                    <div class="difficulty-icon">😊</div>
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
                    <div class="difficulty-icon">🎯</div>
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
                    <div class="difficulty-icon">🧠</div>
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
                    {#if battleMode === 'pokemon'}⚔️{:else}🎯{/if}
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
    .theme-toggle {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid #4a5568;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .theme-toggle:hover {
        transform: scale(1.1);
        background: white;
    }

    .battle-setup-screen {
        min-height: 100vh;
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
        padding: 80px 20px 40px;
        font-family: 'Courier New', monospace;
    }

    :global(.theme-dark) .battle-setup-screen {
        background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
    }

    .setup-header {
        text-align: center;
        margin-bottom: 40px;
    }

    .setup-header h1 {
        font-size: 3rem;
        margin: 0 0 10px 0;
        color: #fff;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .subtitle {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.9);
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
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        text-align: center;
        border: 4px solid transparent;
        position: relative;
        overflow: hidden;
    }

    :global(.theme-dark) .fighter-card {
        background: rgba(26, 26, 46, 0.95);
        color: #fff;
    }

    .fighter-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
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
        background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
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
        font-weight: bold;
        color: #2d3748;
        margin-bottom: 8px;
    }

    :global(.theme-dark) .fighter-name {
        color: #e2e8f0;
    }

    .fighter-level {
        font-size: 1rem;
        color: #4a5568;
        margin-bottom: 10px;
    }

    :global(.theme-dark) .fighter-level {
        color: #a0aec0;
    }

    .fighter-type {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: bold;
        color: #fff;
        text-transform: uppercase;
        margin-bottom: 10px;
    }

    .trainer-label {
        font-size: 0.9rem;
        color: #6b7280;
        font-weight: bold;
    }

    :global(.theme-dark) .trainer-label {
        color: #9ca3af;
    }

    .empty-slot {
        background: rgba(255, 255, 255, 0.6);
        border-radius: 20px;
        padding: 40px 30px;
        text-align: center;
        border: 3px dashed #cbd5e0;
    }

    :global(.theme-dark) .empty-slot {
        background: rgba(45, 55, 72, 0.6);
        border-color: #4a5568;
        color: #a0aec0;
    }

    .empty-sprite {
        font-size: 3rem;
        margin-bottom: 15px;
        opacity: 0.5;
    }

    .empty-text {
        color: #9ca3af;
        font-weight: bold;
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
        background: linear-gradient(45deg, #ff6b6b, #ff8e53);
        padding: 15px 25px;
        border-radius: 20px;
        box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
        animation: pulse 2s ease-in-out infinite;
    }

    .lightning-bolt {
        font-size: 1.5rem;
        animation: lightning 1.5s ease-in-out infinite;
    }

    .vs-text {
        font-size: 1.8rem;
        font-weight: bold;
        color: #fff;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .type-matchup {
        background: rgba(255, 255, 255, 0.9);
        border-radius: 15px;
        padding: 15px;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    :global(.theme-dark) .type-matchup {
        background: rgba(26, 26, 46, 0.9);
        color: #fff;
    }

    .matchup-text {
        font-size: 0.9rem;
        color: #6b7280;
        margin-bottom: 10px;
        display: block;
    }

    :global(.theme-dark) .matchup-text {
        color: #9ca3af;
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
        font-weight: bold;
        color: #fff;
        text-transform: uppercase;
    }

    .vs-small {
        font-size: 0.8rem;
        color: #6b7280;
        font-weight: bold;
    }

    .config-panels {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;
        max-width: 1200px;
        margin: 0 auto 50px;
    }

    .config-panel {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
    }

    :global(.theme-dark) .config-panel {
        background: rgba(26, 26, 46, 0.95);
        color: #fff;
    }

    .config-panel h3 {
        text-align: center;
        margin: 0 0 25px 0;
        font-size: 1.5rem;
        color: #2d3748;
    }

    :global(.theme-dark) .config-panel h3 {
        color: #e2e8f0;
    }

    .mode-selection,
    .difficulty-selection {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .mode-card,
    .difficulty-card {
        background: rgba(255, 255, 255, 0.8);
        border: 3px solid #e2e8f0;
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
        background: rgba(45, 55, 72, 0.8);
        border-color: #4a5568;
    }

    .mode-card:hover,
    .difficulty-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .mode-card.selected,
    .difficulty-card.selected {
        border-color: #4ecdc4;
        background: rgba(78, 205, 196, 0.1);
        box-shadow: 0 0 20px rgba(78, 205, 196, 0.3);
    }

    .mode-icon,
    .difficulty-icon {
        font-size: 2.5rem;
        flex-shrink: 0;
    }

    .mode-info,
    .difficulty-info {
        flex: 1;
    }

    .mode-title,
    .difficulty-title {
        font-size: 1.1rem;
        font-weight: bold;
        color: #2d3748;
        margin-bottom: 5px;
    }

    :global(.theme-dark) .mode-title,
    :global(.theme-dark) .difficulty-title {
        color: #e2e8f0;
    }

    .mode-description,
    .difficulty-description {
        font-size: 0.9rem;
        color: #6b7280;
        line-height: 1.4;
        margin-bottom: 10px;
    }

    :global(.theme-dark) .mode-description,
    :global(.theme-dark) .difficulty-description {
        color: #9ca3af;
    }

    .mode-features {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
    }

    .feature {
        background: #4ecdc4;
        color: #fff;
        padding: 2px 8px;
        border-radius: 8px;
        font-size: 0.7rem;
        font-weight: bold;
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
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1.1rem;
    }

    .back-button {
        background: rgba(255, 255, 255, 0.9);
        color: #4a5568;
        border: 2px solid #e2e8f0;
    }

    .back-button:hover {
        background: #fff;
        transform: translateX(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .battle-button {
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        color: #fff;
        border: none;
        position: relative;
        overflow: hidden;
    }

    .battle-button:hover:not(.disabled) {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
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

    .type-ensemble { background: #22c55e; }
    .type-neural { background: #3b82f6; }
    .type-geometric { background: #ef4444; }
    .type-boosting { background: #f59e0b; }
    .type-probabilistic { background: #ec4899; }
    .type-clustering { background: #8b5cf6; }

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