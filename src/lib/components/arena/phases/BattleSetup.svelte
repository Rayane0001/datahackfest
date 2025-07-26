<!-- @file src/lib/components/arena/phases/BattleSetup.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Fighter } from '$lib/ml/algorithms';
    import type { AILevel } from '$lib/ai/combat-ai';

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

        dispatch('battle-start', {
            mode: battleMode,
            aiLevel: selectedAILevel
        });
    }

    function goBack() {
        dispatch('back');
    }
</script>

<div class="battle-setup-phase">
    <!-- Show selected fighters -->
    <div class="fighters-preview">
        <div class="fighter-preview">
            <span class="fighter-emoji">{fighter1 ? '🌳🧠⚔️⚡🎲🎯'[['Random Forest','Neural Network','Support Vector Machine','Gradient Boosting','K-Means Clustering','Naive Bayes'].indexOf(fighter1.name)] || '🔥' : '❓'}</span>
            <span class="fighter-name">{fighter1?.name || 'Select Fighter 1'}</span>
        </div>

        <div class="vs-text">VS</div>

        <div class="fighter-preview">
            <span class="fighter-emoji">{fighter2 ? '🌳🧠⚔️⚡🎲🎯'[['Random Forest','Neural Network','Support Vector Machine','Gradient Boosting','K-Means Clustering','Naive Bayes'].indexOf(fighter2.name)] || '🔥' : '❓'}</span>
            <span class="fighter-name">{fighter2?.name || 'Select Fighter 2'}</span>
        </div>
    </div>

    <!-- Battle Mode Selection -->
    <div class="setup-section">
        <h3>🎮 Choose Battle Mode:</h3>
        <div class="mode-buttons">
            <button
                    class="mode-button"
                    class:selected={battleMode === 'pokemon'}
                    on:click={() => setBattleMode('pokemon')}
            >
                <span class="mode-emoji">🐾</span>
                <span class="mode-name">Pokemon Battle</span>
                <span class="mode-desc">Classic Pokemon-style battle with sprites & animations</span>
            </button>
            <button
                    class="mode-button"
                    class:selected={battleMode === 'tactical'}
                    on:click={() => setBattleMode('tactical')}
            >
                <span class="mode-emoji">🎯</span>
                <span class="mode-name">Tactical Mode</span>
                <span class="mode-desc">Advanced combat with detailed stats & analysis</span>
            </button>
        </div>
    </div>

    <!-- AI Difficulty Selection -->
    <div class="setup-section">
        <h3>🤖 Choose AI Difficulty:</h3>
        <div class="difficulty-buttons">
            <button
                    class="difficulty-button"
                    class:selected={selectedAILevel === 'easy'}
                    on:click={() => setAILevel('easy')}
            >
                <span class="difficulty-emoji">😊</span>
                <span class="difficulty-name">Easy</span>
                <span class="difficulty-desc">Random moves, basic strategy</span>
            </button>
            <button
                    class="difficulty-button"
                    class:selected={selectedAILevel === 'normal'}
                    on:click={() => setAILevel('normal')}
            >
                <span class="difficulty-emoji">🎯</span>
                <span class="difficulty-name">Normal</span>
                <span class="difficulty-desc">Tactical thinking, type advantages</span>
            </button>
            <button
                    class="difficulty-button"
                    class:selected={selectedAILevel === 'hard'}
                    on:click={() => setAILevel('hard')}
            >
                <span class="difficulty-emoji">🧠</span>
                <span class="difficulty-name">Hard</span>
                <span class="difficulty-desc">Expert strategy, pattern prediction</span>
            </button>
        </div>
    </div>

    <!-- Battle Controls -->
    <div class="battle-controls">
        <button class="control-button back" on:click={goBack}>
            ← Change Fighters
        </button>

        <button
                class="control-button start"
                on:click={startBattle}
                disabled={!fighter1 || !fighter2}
        >
            {#if battleMode === 'pokemon'}
                🐾 START POKEMON BATTLE
            {:else}
                ⚔️ START TACTICAL COMBAT
            {/if}
        </button>
    </div>
</div>

<style>
    .battle-setup-phase {
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
    }

    .fighters-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 30px;
        margin-bottom: 40px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid #333;
    }

    .fighter-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        min-width: 150px;
    }

    .fighter-emoji {
        font-size: 3rem;
    }

    .fighter-name {
        font-weight: bold;
        color: #4ecdc4;
        text-align: center;
    }

    .vs-text {
        font-size: 2rem;
        font-weight: bold;
        color: #ff6b6b;
    }

    .setup-section {
        margin-bottom: 30px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        border: 1px solid #333;
    }

    .setup-section h3 {
        color: #4ecdc4;
        text-align: center;
        margin: 0 0 20px 0;
    }

    .mode-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
    }

    .difficulty-buttons {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
    }

    .mode-button,
    .difficulty-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid #333;
        border-radius: 10px;
        color: #fff;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .mode-button:hover,
    .difficulty-button:hover {
        border-color: #4ecdc4;
        background: rgba(78, 205, 196, 0.1);
        transform: translateY(-2px);
    }

    .mode-button.selected,
    .difficulty-button.selected {
        border-color: #4ecdc4;
        background: rgba(78, 205, 196, 0.2);
        box-shadow: 0 0 15px rgba(78, 205, 196, 0.3);
    }

    .mode-emoji {
        font-size: 2.5rem;
    }

    .difficulty-emoji {
        font-size: 2rem;
    }

    .mode-name,
    .difficulty-name {
        font-weight: bold;
        font-size: 1.1rem;
        color: #4ecdc4;
    }

    .mode-desc,
    .difficulty-desc {
        font-size: 0.85rem;
        color: #ccc;
        text-align: center;
        line-height: 1.3;
    }

    .battle-controls {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 40px;
    }

    .control-button {
        padding: 15px 30px;
        font-size: 1.1rem;
        font-family: inherit;
        font-weight: bold;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .control-button.back {
        background: #333;
        color: #ccc;
    }

    .control-button.back:hover {
        background: #444;
        transform: translateX(-2px);
    }

    .control-button.start {
        background: linear-gradient(45deg, #ff6b6b, #ff8e53);
        color: white;
    }

    .control-button.start:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
    }

    .control-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .fighters-preview {
            flex-direction: column;
            gap: 15px;
        }

        .vs-text {
            order: -1;
        }

        .mode-buttons {
            grid-template-columns: 1fr;
        }

        .difficulty-buttons {
            grid-template-columns: 1fr;
        }

        .battle-controls {
            flex-direction: column;
        }
    }
</style>