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

    if (!playerFighter || !aiFighter) {
        console.error('Fighters not properly initialized:', { playerFighter, aiFighter });
    }

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

    onMount(() => {
        initializeBattle();
        theme.init();
    });

    function initializeBattle() {
        playerMoves = getMovesByAlgorithm(playerFighter.name);
        aiMoves = getMovesByAlgorithm(aiFighter.name);

        playerMoves.forEach(move => {
            playerPP[move.name] = move.pp;
        });
        aiMoves.forEach(move => {
            aiPP[move.name] = move.pp;
        });

        combatAI = new CombatAI(aiLevel);
        startBattleSequence();
    }

    async function startBattleSequence() {
        battleMessage = `${aiFighter.name} wants to battle!`;

        aiAnimationType = 'slide-in';
        aiAnimating = true;

        await new Promise(resolve => setTimeout(resolve, 400));

        playerAnimationType = 'slide-in';
        playerAnimating = true;

        await new Promise(resolve => setTimeout(resolve, 800));

        battleMessage = `Go! ${playerFighter.name}!`;

        await new Promise(resolve => setTimeout(resolve, 1000));

        startPlayerTurn();
    }

    function startPlayerTurn() {
        isPlayerTurn = true;
        showMoveSelection = true;
        battleMessage = `What will ${playerFighter.name} do?`;
        isProcessingTurn = false;
    }

    async function handleMoveSelection(move: Move) {
        if (isProcessingTurn || !isPlayerTurn) return;

        isProcessingTurn = true;
        showMoveSelection = false;

        await executePlayerMove(move);

        if (battleEnded) return;

        await executeAITurn();

        if (battleEnded) return;

        currentTurn++;
        startPlayerTurn();
    }

    async function executePlayerMove(move: Move) {
        battleMessage = `${playerFighter.name} used ${move.name}!`;

        playerAnimationType = 'attack';
        playerAnimating = true;

        await new Promise(resolve => setTimeout(resolve, 300));

        playerPP[move.name]--;

        const damage = calculateDamage(playerFighter, aiFighter, move);
        const effectiveness = getTypeMultiplier(
            ALGORITHM_TYPES[playerFighter.name],
            ALGORITHM_TYPES[aiFighter.name]
        );
        const isCritical = Math.random() < 0.1;
        const missed = Math.random() > (move.accuracy / 100);

        await new Promise(resolve => setTimeout(resolve, 300));

        if (missed) {
            battleMessage = `${playerFighter.name}'s attack missed!`;
        } else {
            let finalDamage = damage;
            if (isCritical) {
                finalDamage *= 1.5;
                battleMessage = `A critical hit!`;
            }
            finalDamage *= effectiveness;
            finalDamage = Math.round(finalDamage);

            aiFighter.health = Math.max(0, aiFighter.health - finalDamage);

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

        if (aiFighter.health <= 0) {
            aiAnimationType = 'faint';
            aiAnimating = true;
            battleMessage = `${aiFighter.name} fainted!`;

            await new Promise(resolve => setTimeout(resolve, 1500));

            endBattle(playerFighter.name);
        }
    }

    async function executeAITurn() {
        if (battleEnded) return;

        isPlayerTurn = false;
        aiThinking = true;
        battleMessage = `${aiFighter.name} is thinking...`;

        await new Promise(resolve => setTimeout(resolve, 1500));

        const combatState: CombatState = {
            playerFighter,
            aiFighter,
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
        battleMessage = `${aiFighter.name} used ${move.name}!`;

        aiAnimationType = 'attack';
        aiAnimating = true;

        await new Promise(resolve => setTimeout(resolve, 300));

        aiPP[move.name]--;

        const damage = calculateDamage(aiFighter, playerFighter, move);
        const effectiveness = getTypeMultiplier(
            ALGORITHM_TYPES[aiFighter.name],
            ALGORITHM_TYPES[playerFighter.name]
        );
        const isCritical = Math.random() < 0.1;
        const missed = Math.random() > (move.accuracy / 100);

        await new Promise(resolve => setTimeout(resolve, 300));

        if (missed) {
            battleMessage = `${aiFighter.name}'s attack missed!`;
        } else {
            let finalDamage = damage;
            if (isCritical) {
                finalDamage *= 1.5;
                battleMessage = `A critical hit!`;
            }
            finalDamage *= effectiveness;
            finalDamage = Math.round(finalDamage);

            playerFighter.health = Math.max(0, playerFighter.health - finalDamage);

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

        if (playerFighter.health <= 0) {
            playerAnimationType = 'faint';
            playerAnimating = true;
            battleMessage = `${playerFighter.name} fainted!`;

            await new Promise(resolve => setTimeout(resolve, 1500));

            endBattle(aiFighter.name);
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
        battleEnded = true;
        winner = winnerName;
        showMoveSelection = false;

        if (winnerName === playerFighter.name) {
            battleMessage = `You won the battle!`;
        } else {
            battleMessage = `You lost the battle!`;
        }

        setTimeout(() => {
            dispatch('battle-end', {
                winner: winnerName,
                playerFinalHealth: playerFighter.health,
                aiFinalHealth: aiFighter.health,
                totalTurns: currentTurn
            });
        }, 3000);
    }

    function resetBattle() {
        dispatch('reset-battle');
    }
</script>

<div class="pokemon-battle-interface">
    <div class="battle-field">
        <BattleBackground />

        <PokemonSprite
                fighter={aiFighter}
                isPlayer={false}
                isVisible={true}
                animationType={aiAnimationType}
                bind:isAnimating={aiAnimating}
        />

        <PokemonSprite
                fighter={playerFighter}
                isPlayer={true}
                isVisible={true}
                animationType={playerAnimationType}
                bind:isAnimating={playerAnimating}
        />

        <HealthBar
                fighter={aiFighter}
                isPlayer={false}
        />

        <HealthBar
                fighter={playerFighter}
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

        {#if showMoveSelection && !battleEnded}
            <div class="move-menu">
                <div class="move-menu-header">
                    <span>What will {playerFighter.name} do?</span>
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
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
        {/if}

        {#if battleEnded}
            <div class="battle-end">
                <div class="battle-result">
                    {#if winner === playerFighter.name}
                        <h2 class="victory">You Win!</h2>
                    {:else}
                        <h2 class="defeat">You Lose!</h2>
                    {/if}
                </div>
                <button class="continue-button" on:click={resetBattle}>
                    Continue
                </button>
            </div>
        {/if}
    </div>

    <button class="theme-toggle" on:click={theme.toggle}>
        {$theme === 'light' ? '🌙' : '☀️'}
    </button>
</div>

<style>
    .pokemon-battle-interface {
        position: relative;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        background: #000;
        font-family: 'Courier New', monospace;
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
    }
</style>