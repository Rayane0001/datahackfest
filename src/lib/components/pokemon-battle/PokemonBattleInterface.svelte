<!-- @file src/lib/components/pokemon-battle/PokemonBattleInterface.svelte -->
<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { theme } from '$lib/stores/theme';
    import type { Fighter } from '$lib/ml/algorithms';
    import { getMovesByAlgorithm } from '$lib/data/moves';
    import type { Move } from '$lib/data/moves';
    import { CombatAI, type AILevel, type CombatState } from '$lib/ai/combat-ai';
    import { getTypeMultiplier, ALGORITHM_TYPES } from '$lib/data/type-advantages';
    import BattleBackground from './BattleBackground.svelte';
    import PokemonSprite from './PokemonSprite.svelte';
    import HealthBar from './HealthBar.svelte';

    export let playerFighter: Fighter;
    export let aiFighter: Fighter;
    export let aiLevel: AILevel = 'normal';

    const dispatch = createEventDispatcher();

    let battlePlayerFighter: Fighter;
    let battleAiFighter: Fighter;

    let isPlayerTurn = true;
    let currentTurn = 1;
    let battleEnded = false;
    let winner: string | null = null;
    let playerMoves: Move[] = [];
    let aiMoves: Move[] = [];
    let playerPP: Record<string, number> = {};
    let aiPP: Record<string, number> = {};

    let playerAnimating = false;
    let aiAnimating = false;
    let playerAnimationType: 'none' | 'slide-in' | 'damage' | 'faint' | 'attack' = 'none';
    let aiAnimationType: 'none' | 'slide-in' | 'damage' | 'faint' | 'attack' = 'none';

    let showMoveSelection = false;
    let battleMessage = '';
    let isProcessingTurn = false;

    let combatAI: CombatAI;
    let aiThinking = false;

    let showMoveTooltip = false;
    let currentMove: Move | null = null;
    let tooltipX = 0;
    let tooltipY = 0;

    let isInitialized = false;

    onMount(() => {
        if (playerFighter && aiFighter) {
            resetAndInitializeBattle();
        }
        theme.init();
    });

    $: if (playerFighter && aiFighter && !isInitialized) {
        resetAndInitializeBattle();
    }

    function resetAndInitializeBattle() {
        if (!playerFighter || !aiFighter) return;

        battlePlayerFighter = {
            ...playerFighter,
            health: playerFighter.maxHealth
        };

        battleAiFighter = {
            ...aiFighter,
            health: aiFighter.maxHealth
        };

        isPlayerTurn = true;
        currentTurn = 1;
        battleEnded = false;
        winner = null;
        playerAnimating = false;
        aiAnimating = false;
        playerAnimationType = 'none';
        aiAnimationType = 'none';
        showMoveSelection = false;
        battleMessage = '';
        isProcessingTurn = false;
        aiThinking = false;
        showMoveTooltip = false;
        currentMove = null;

        initializeBattle();
    }

    function initializeBattle() {
        if (!battlePlayerFighter || !battleAiFighter) return;

        playerMoves = getMovesByAlgorithm(battlePlayerFighter.name);
        aiMoves = getMovesByAlgorithm(battleAiFighter.name);

        playerPP = {};
        aiPP = {};

        playerMoves.forEach(move => {
            playerPP[move.name] = move.pp;
        });
        aiMoves.forEach(move => {
            aiPP[move.name] = move.pp;
        });

        combatAI = new CombatAI(aiLevel);
        isInitialized = true;
        startBattleSequence();
    }

    function handleMoveHover(event: MouseEvent, move: Move) {
        // Remove hover functionality - now only works on click
    }

    function handleMoveLeave() {
        // Remove hover functionality - now only works on click
    }

    function handleTooltipClick(event: MouseEvent, move: Move) {
        event.stopPropagation();
        const rect = (event.target as HTMLElement).getBoundingClientRect();

        if (showMoveTooltip && currentMove === move) {
            // If clicking the same move tooltip that's already open, close it
            showMoveTooltip = false;
            currentMove = null;
        } else {
            // Open new tooltip
            currentMove = move;
            // Position tooltip in the center-top of screen for better visibility
            tooltipX = window.innerWidth / 2;
            tooltipY = 100;
            showMoveTooltip = true;
        }
    }

    function closeTooltip() {
        showMoveTooltip = false;
        currentMove = null;
    }

    async function startBattleSequence() {
        if (!battleAiFighter || !battlePlayerFighter) return;

        battleMessage = `${battleAiFighter.name} wants to battle!`;

        aiAnimationType = 'slide-in';
        aiAnimating = true;

        await new Promise(resolve => setTimeout(resolve, 400));

        playerAnimationType = 'slide-in';
        playerAnimating = true;

        await new Promise(resolve => setTimeout(resolve, 800));

        battleMessage = `Go! ${battlePlayerFighter.name}!`;

        await new Promise(resolve => setTimeout(resolve, 1000));

        startPlayerTurn();
    }

    function startPlayerTurn() {
        if (!battlePlayerFighter) return;

        isPlayerTurn = true;
        showMoveSelection = true;
        battleMessage = `What will ${battlePlayerFighter.name} do?`;
        isProcessingTurn = false;
    }

    async function handleMoveSelection(move: Move) {
        if (isProcessingTurn || !isPlayerTurn) return;

        isProcessingTurn = true;
        showMoveSelection = false;
        showMoveTooltip = false;

        await executePlayerMove(move);

        if (battleEnded) return;

        await executeAITurn();

        if (battleEnded) return;

        currentTurn++;
        startPlayerTurn();
    }

    async function executePlayerMove(move: Move) {
        if (!battlePlayerFighter || !battleAiFighter) return;

        battleMessage = `${battlePlayerFighter.name} used ${move.name}!`;

        playerAnimationType = 'attack';
        playerAnimating = true;

        await new Promise(resolve => setTimeout(resolve, 300));

        playerPP[move.name]--;

        const damage = calculateDamage(battlePlayerFighter, battleAiFighter, move);
        const effectiveness = getTypeMultiplier(
            ALGORITHM_TYPES[battlePlayerFighter.name],
            ALGORITHM_TYPES[battleAiFighter.name]
        );
        const isCritical = Math.random() < 0.1;
        const missed = Math.random() > (move.accuracy / 100);

        await new Promise(resolve => setTimeout(resolve, 300));

        if (missed) {
            battleMessage = `${battlePlayerFighter.name}'s attack missed!`;
        } else {
            let finalDamage = damage;
            if (isCritical) {
                finalDamage *= 1.5;
                battleMessage = `A critical hit!`;
            }
            finalDamage *= effectiveness;
            finalDamage = Math.round(finalDamage);

            battleAiFighter.health = Math.max(0, battleAiFighter.health - finalDamage);

            aiAnimationType = 'damage';
            aiAnimating = true;

            if (effectiveness > 1.2) {
                await new Promise(resolve => setTimeout(resolve, 500));
                battleMessage = "It's super effective!";
            } else if (effectiveness < 0.9) {
                await new Promise(resolve => setTimeout(resolve, 500));
                battleMessage = "It's not very effective...";
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (battleAiFighter.health <= 0) {
            aiAnimationType = 'faint';
            aiAnimating = true;
            battleMessage = `${battleAiFighter.name} fainted!`;

            await new Promise(resolve => setTimeout(resolve, 1500));

            endBattle(battlePlayerFighter.name);
        }
    }

    async function executeAITurn() {
        if (battleEnded || !battlePlayerFighter || !battleAiFighter) return;

        isPlayerTurn = false;
        aiThinking = true;
        battleMessage = `${battleAiFighter.name} is thinking...`;

        await new Promise(resolve => setTimeout(resolve, 1500));

        const combatState: CombatState = {
            playerFighter: battlePlayerFighter,
            aiFighter: battleAiFighter,
            playerMoves,
            aiMoves,
            playerPP,
            aiPP,
            turn: currentTurn,
            moveHistory: []
        };

        const aiDecision = combatAI.selectMove(combatState);
        const move = aiDecision.move;

        aiThinking = false;
        battleMessage = `${battleAiFighter.name} used ${move.name}!`;

        aiAnimationType = 'attack';
        aiAnimating = true;

        await new Promise(resolve => setTimeout(resolve, 300));

        aiPP[move.name]--;

        const damage = calculateDamage(battleAiFighter, battlePlayerFighter, move);
        const effectiveness = getTypeMultiplier(
            ALGORITHM_TYPES[battleAiFighter.name],
            ALGORITHM_TYPES[battlePlayerFighter.name]
        );
        const isCritical = Math.random() < 0.1;
        const missed = Math.random() > (move.accuracy / 100);

        await new Promise(resolve => setTimeout(resolve, 300));

        if (missed) {
            battleMessage = `${battleAiFighter.name}'s attack missed!`;
        } else {
            let finalDamage = damage;
            if (isCritical) {
                finalDamage *= 1.5;
                battleMessage = `A critical hit!`;
            }
            finalDamage *= effectiveness;
            finalDamage = Math.round(finalDamage);

            battlePlayerFighter.health = Math.max(0, battlePlayerFighter.health - finalDamage);

            playerAnimationType = 'damage';
            playerAnimating = true;

            if (effectiveness > 1.2) {
                await new Promise(resolve => setTimeout(resolve, 500));
                battleMessage = "It's super effective!";
            } else if (effectiveness < 0.9) {
                await new Promise(resolve => setTimeout(resolve, 500));
                battleMessage = "It's not very effective...";
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (battlePlayerFighter.health <= 0) {
            playerAnimationType = 'faint';
            playerAnimating = true;
            battleMessage = `${battlePlayerFighter.name} fainted!`;

            await new Promise(resolve => setTimeout(resolve, 1500));

            endBattle(battleAiFighter.name);
        }
    }

    function calculateDamage(attacker: Fighter, defender: Fighter, move: Move): number {
        if (!move.power) return 0;

        const attack = attacker.attack;
        const defense = defender.defense;
        const baseDamage = (attack * move.power) / 100;
        const defensiveReduction = Math.max(0.1, 1 - (defense / 200));

        return Math.round(baseDamage * defensiveReduction * (0.8 + Math.random() * 0.4));
    }

    function endBattle(winnerName: string) {
        if (!battlePlayerFighter || !battleAiFighter) return;

        battleEnded = true;
        winner = winnerName;
        showMoveSelection = false;
        showMoveTooltip = false;

        if (winnerName === battlePlayerFighter.name) {
            battleMessage = `You won the battle!`;
        } else {
            battleMessage = `You lost the battle!`;
        }

        setTimeout(() => {
            dispatch('battle-end', {
                winner: winnerName,
                playerFinalHealth: battlePlayerFighter.health,
                aiFinalHealth: battleAiFighter.health,
                totalTurns: currentTurn
            });
        }, 3000);
    }

    function resetBattle() {
        isInitialized = false;
        resetAndInitializeBattle();
    }

    function goBackToMenu() {
        dispatch('back-to-menu');
    }

    export function resetForNewBattle() {
        isInitialized = false;
        resetAndInitializeBattle();
    }
</script>

{#if battlePlayerFighter && battleAiFighter}
    <div class="pokemon-battle-interface">
        <div class="battle-field">
            <BattleBackground />

            <PokemonSprite
                    fighter={battleAiFighter}
                    isPlayer={false}
                    isVisible={true}
                    animationType={aiAnimationType}
                    bind:isAnimating={aiAnimating}
            />

            <PokemonSprite
                    fighter={battlePlayerFighter}
                    isPlayer={true}
                    isVisible={true}
                    animationType={playerAnimationType}
                    bind:isAnimating={playerAnimating}
            />

            <HealthBar
                    fighter={battleAiFighter}
                    isPlayer={false}
            />

            <HealthBar
                    fighter={battlePlayerFighter}
                    isPlayer={true}
            />
        </div>

        <div class="battle-ui">
            <div class="message-box">
                <div class="message-text">
                    {battleMessage}
                    {#if aiThinking}
                        <span class="thinking-dots">
                            <span>.</span><span>.</span><span>.</span>
                        </span>
                    {/if}
                </div>
            </div>

            {#if showMoveSelection && !battleEnded && battlePlayerFighter}
                <div class="move-menu">
                    <div class="move-menu-header">
                        <span>What will {battlePlayerFighter.name} do?</span>
                    </div>
                    <div class="moves-grid">
                        {#each playerMoves as move}
                            {@const pp = playerPP[move.name] || 0}
                            {@const canUse = pp > 0}

                            <button
                                    class="move-button"
                                    class:disabled={!canUse}
                                    disabled={!canUse || isProcessingTurn}
                                    on:click={() => canUse && handleMoveSelection(move)}
                            >
                                <div class="move-name">{move.name}</div>
                                <div class="move-info">
                                    <span class="move-type type-{move.type}">{move.type}</span>
                                    <span class="move-pp">PP: {pp}/{move.pp}</span>
                                    <span
                                            class="move-tooltip-icon"
                                            class:disabled={!canUse || isProcessingTurn}
                                            on:click={(e) => {
                                            if (!canUse || isProcessingTurn) return;
                                            handleTooltipClick(e, move);
                                        }}
                                    >
                                        ❓
                                    </span>
                                </div>
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}

            {#if battleEnded && battlePlayerFighter}
                <div class="battle-end">
                    <div class="battle-result">
                        {#if winner === battlePlayerFighter.name}
                            <h2 class="victory">You Win!</h2>
                        {:else}
                            <h2 class="defeat">You Lose!</h2>
                        {/if}
                    </div>
                    <div class="battle-buttons">
                        <button class="continue-button" on:click={resetBattle}>
                            🔄 Battle Again
                        </button>
                        <button class="menu-button" on:click={goBackToMenu}>
                            🏠 Back to Menu
                        </button>
                    </div>
                </div>
            {/if}
        </div>

        {#if showMoveTooltip && currentMove}
            <div class="tooltip-overlay" on:click={closeTooltip}>
                <div
                        class="move-tooltip"
                        style="left: {tooltipX}px; top: {tooltipY}px;"
                        on:click={(e) => e.stopPropagation()}
                >
                    <button class="tooltip-close" on:click={closeTooltip}>✖</button>

                    <div class="tooltip-header">
                        <div class="move-name">{currentMove.name}</div>
                        <div class="move-type type-{currentMove.type}">{currentMove.type.toUpperCase()}</div>
                    </div>

                    <div class="move-stats">
                        <div class="stat">
                            <span class="stat-label">Power</span>
                            <span class="stat-value">{currentMove.power || '—'}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Accuracy</span>
                            <span class="stat-value">{currentMove.accuracy}%</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">PP</span>
                            <span class="stat-value">{currentMove.pp}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Category</span>
                            <span class="stat-value">
                                {currentMove.category === 'physical' ? '💪' : currentMove.category === 'special' ? '✨' : '🛡️'}
                                {currentMove.category.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div class="move-description">
                        <p>{currentMove.description}</p>
                    </div>

                    {#if currentMove.effect}
                        <div class="move-effect">
                            <strong>Effect:</strong> {currentMove.effect}
                        </div>
                    {/if}

                    <div class="educational-section">
                        <div class="education-header">
                            <span class="education-icon">🎓</span>
                            <span>Machine Learning Explanation</span>
                        </div>
                        <p class="educational-note">{currentMove.educationalNote}</p>
                    </div>
                </div>
            </div>
        {/if}

        <button class="theme-toggle" on:click={theme.toggle}>
            {$theme === 'light' ? '🌙' : '☀️'}
        </button>
    </div>
{:else}
    <div class="loading-screen">
        <div class="loading-content">
            <h2>🔄 Initializing Battle...</h2>
            <p>Preparing fighters for combat</p>
        </div>
    </div>
{/if}

<style>
    .pokemon-battle-interface {
        position: relative;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        background: #000;
        font-family: 'Courier New', monospace;
    }

    .loading-screen {
        position: relative;
        width: 100vw;
        height: 100vh;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Courier New', monospace;
    }

    .loading-content {
        text-align: center;
        color: #4ecdc4;
    }

    .loading-content h2 {
        margin: 0 0 10px 0;
        font-size: 1.5rem;
    }

    .loading-content p {
        margin: 0;
        color: #999;
        font-size: 1rem;
    }

    .battle-field {
        position: relative;
        width: 100%;
        height: 60%;
        overflow: hidden;
    }

    .battle-ui {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40%;
        background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%);
        border-top: 3px solid #4a5568;
    }

    .message-box {
        background: #f7fafc;
        border: 3px solid #2d3748;
        border-radius: 8px;
        margin: 8px 15px;
        padding: 8px 12px;
        color: #2d3748;
        font-weight: bold;
        font-size: 0.9rem;
        min-height: 35px;
        display: flex;
        align-items: center;
    }

    .message-text {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .thinking-dots span {
        animation: thinkingDot 1.4s ease-in-out infinite both;
    }

    .thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
    .thinking-dots span:nth-child(2) { animation-delay: -0.16s; }
    .thinking-dots span:nth-child(3) { animation-delay: 0s; }

    @keyframes thinkingDot {
        0%, 80%, 100% { opacity: 0; }
        40% { opacity: 1; }
    }

    .move-menu {
        background: #e2e8f0;
        border: 3px solid #4a5568;
        border-radius: 8px;
        margin: 0 15px 10px;
        padding: 8px;
        color: #2d3748;
    }

    .move-menu-header {
        font-weight: bold;
        margin-bottom: 8px;
        color: #1a202c;
        font-size: 0.95rem;
    }

    .moves-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
    }

    .move-button {
        background: #f7fafc;
        border: 2px solid #cbd5e0;
        border-radius: 6px;
        padding: 4px 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        font-family: inherit;
        font-weight: bold;
        min-height: 55px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .move-button:hover:not(.disabled) {
        background: #edf2f7;
        border-color: #a0aec0;
        transform: translateY(-1px);
    }

    .move-button.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #f1f5f9;
    }

    .move-name {
        color: #2d3748;
        margin-bottom: 2px;
        font-size: 0.8rem;
        line-height: 1.1;
    }

    .move-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.65rem;
    }

    .move-type {
        padding: 1px 5px;
        border-radius: 4px;
        color: white;
        font-size: 0.6rem;
        text-transform: uppercase;
    }

    .move-pp {
        color: #4a5568;
        font-size: 0.65rem;
    }

    .move-tooltip-icon {
        font-size: 0.8rem;
        opacity: 0.8;
        margin-left: 4px;
        transition: all 0.2s ease;
        cursor: pointer;
        padding: 2px;
        border-radius: 3px;
        color: #4a5568;
        display: inline-block;
        user-select: none;
    }

    .move-tooltip-icon:hover {
        opacity: 1;
        transform: scale(1.2);
        background: rgba(78, 205, 196, 0.1);
        color: #4ecdc4;
    }

    .move-tooltip-icon.disabled {
        opacity: 0.3;
        cursor: not-allowed;
        pointer-events: none;
    }

    .battle-buttons {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        justify-content: center;
    }

    .menu-button {
        background: #6b7280;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
    }

    .menu-button:hover {
        background: #4b5563;
        transform: translateY(-2px);
    }

    .tooltip-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 999;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 100px;
    }

    .move-tooltip {
        position: relative;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #4ecdc4;
        border-radius: 12px;
        padding: 20px;
        max-width: 450px;
        width: 90vw;
        max-height: 70vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
        color: #fff;
        font-family: 'Courier New', monospace;
        backdrop-filter: blur(10px);
        animation: tooltipFadeIn 0.3s ease-out;
    }

    .tooltip-close {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: #fff;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .tooltip-close:hover {
        background: rgba(239, 68, 68, 0.8);
        transform: scale(1.1);
    }

    .battle-end {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 20px;
    }

    .battle-result h2 {
        margin: 0;
        font-size: 2rem;
        text-align: center;
    }

    .victory {
        color: #38a169;
    }

    .defeat {
        color: #e53e3e;
    }

    .continue-button {
        background: #4299e1;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
    }

    .continue-button:hover {
        background: #3182ce;
        transform: translateY(-2px);
    }

    .move-tooltip {
        position: fixed;
        z-index: 1000;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #4ecdc4;
        border-radius: 12px;
        padding: 16px;
        max-width: 320px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
        color: #fff;
        font-family: 'Courier New', monospace;
        backdrop-filter: blur(10px);
        transform: translateX(-50%);
        pointer-events: none;
        animation: tooltipFadeIn 0.2s ease-out;
    }

    @keyframes tooltipFadeIn {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }

    .tooltip-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #333;
    }

    .move-tooltip .move-name {
        font-size: 1.1rem;
        font-weight: bold;
        color: #4ecdc4;
    }

    .move-tooltip .move-type {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
        color: #fff;
    }

    .move-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 12px;
    }

    .stat {
        display: flex;
        justify-content: space-between;
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        font-size: 0.9rem;
    }

    .stat-label {
        color: #999;
    }

    .stat-value {
        color: #fff;
        font-weight: bold;
    }

    .move-description {
        margin-bottom: 12px;
        line-height: 1.4;
    }

    .move-description p {
        margin: 0;
        color: #ccc;
        font-size: 0.95rem;
    }

    .move-effect {
        margin-bottom: 12px;
        padding: 8px;
        background: rgba(245, 158, 11, 0.1);
        border-left: 3px solid #f59e0b;
        border-radius: 4px;
        font-size: 0.9rem;
        color: #fbbf24;
    }

    .educational-section {
        background: rgba(78, 205, 196, 0.1);
        border: 1px solid #4ecdc4;
        border-radius: 8px;
        padding: 12px;
        margin-top: 12px;
    }

    .education-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        color: #4ecdc4;
        font-weight: bold;
        font-size: 0.9rem;
    }

    .education-icon {
        font-size: 1rem;
    }

    .educational-note {
        margin: 0;
        color: #e5e7eb;
        font-size: 0.9rem;
        line-height: 1.4;
    }

    .tooltip-arrow {
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid #4ecdc4;
    }

    .theme-toggle {
        position: absolute;
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
        z-index: 25;
    }

    .theme-toggle:hover {
        transform: scale(1.1);
        background: white;
    }

    .type-ensemble { background: #22c55e; }
    .type-neural { background: #3b82f6; }
    .type-geometric { background: #ef4444; }
    .type-boosting { background: #f59e0b; }
    .type-probabilistic { background: #ec4899; }
    .type-clustering { background: #8b5cf6; }

    .move-tooltip .type-ensemble { background: #22c55e; }
    .move-tooltip .type-neural { background: #3b82f6; }
    .move-tooltip .type-geometric { background: #ef4444; }
    .move-tooltip .type-boosting { background: #f59e0b; }
    .move-tooltip .type-probabilistic { background: #ec4899; }
    .move-tooltip .type-clustering { background: #8b5cf6; }

    :global(.theme-dark) .message-box {
        background: #2d3748;
        color: #e2e8f0;
        border-color: #4a5568;
    }

    :global(.theme-dark) .move-menu {
        background: #1a202c;
        color: #e2e8f0;
        border-color: #4a5568;
    }

    :global(.theme-dark) .move-button {
        background: #2d3748;
        color: #e2e8f0;
        border-color: #4a5568;
    }

    :global(.theme-dark) .move-button:hover:not(.disabled) {
        background: #4a5568;
        border-color: #718096;
    }

    :global(.theme-dark) .move-name {
        color: #e2e8f0;
    }

    :global(.theme-dark) .move-menu-header {
        color: #e2e8f0;
    }

    @media (max-width: 768px) {
        .battle-ui {
            height: 45%;
        }

        .battle-field {
            height: 55%;
        }

        .message-box {
            margin: 6px 10px;
            padding: 6px 10px;
            font-size: 0.85rem;
            min-height: 30px;
        }

        .move-menu {
            margin: 0 10px 8px;
            padding: 6px;
        }

        .moves-grid {
            grid-template-columns: 1fr;
            gap: 3px;
        }

        .move-button {
            min-height: 50px;
            padding: 3px 5px;
        }

        .move-name {
            font-size: 0.75rem;
        }

        .theme-toggle {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
            top: 15px;
            right: 15px;
        }

        .battle-buttons {
            flex-direction: column;
            gap: 10px;
        }

        .continue-button,
        .menu-button {
            width: 100%;
            padding: 10px 20px;
            font-size: 1rem;
        }

        .move-tooltip {
            max-width: 95vw;
            padding: 15px;
            max-height: 60vh;
        }
    }
</style>