<!-- Complete CombatInterface.svelte with all fixes -->
<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import type { Fighter } from '$lib/ml/algorithms';
    import { getMovesByAlgorithm } from '$lib/data/moves';
    import type { Move } from '$lib/data/moves';
    import { CombatAI, type AILevel, type CombatState } from '$lib/ai/combat-ai';
    import {
        generateAttackMessage,
        generateAIReasoningMessage,
        generateTurnStartMessage,
        generateEndBattleMessage,
        type CombatMessage
    } from '$lib/data/combat-messages';
    import { getTypeMultiplier, ALGORITHM_TYPES } from '$lib/data/type-advantages';
    import MoveSelection from './MoveSelection.svelte';
    import StatusEffects from './StatusEffects.svelte';

    export let playerFighter: Fighter;
    export let aiFighter: Fighter;
    export let aiLevel: AILevel = 'normal';

    const dispatch = createEventDispatcher();

    // Combat state
    let isPlayerTurn = true;
    let currentTurn = 1;
    let battleEnded = false;
    let winner: string | null = null;
    let showBattleEndOverlay = true;

    // Create battle copies to avoid mutating original fighters
    let battlePlayerFighter: Fighter;
    let battleAiFighter: Fighter;

    // Moves and PP
    let playerMoves: Move[] = [];
    let aiMoves: Move[] = [];
    let playerPP: Record<string, number> = {};
    let aiPP: Record<string, number> = {};

    // Status effects
    let playerStatus: Array<{name: string; turnsRemaining: number; description: string; type: 'positive' | 'negative' | 'neutral'}> = [];
    let aiStatus: Array<{name: string; turnsRemaining: number; description: string; type: 'positive' | 'negative' | 'neutral'}> = [];

    // Combat log
    let combatMessages: CombatMessage[] = [];
    let moveHistory: string[] = [];

    // AI
    let combatAI: CombatAI;
    let aiThinking = false;
    let aiDecisionDelay = 2000;

    // UI state
    let showMoveSelection = false;
    let animationInProgress = false;
    let isInitialized = false;

    onMount(() => {
        if (playerFighter && aiFighter) {
            initializeCombat();
        }
    });

    function initializeCombat() {
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
        animationInProgress = false;
        aiThinking = false;
        showMoveSelection = false;
        showBattleEndOverlay = true;

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

        playerStatus = [];
        aiStatus = [];
        combatMessages = [];
        moveHistory = [];

        combatAI = new CombatAI(aiLevel);
        isInitialized = true;

        startBattle();
    }

    function startBattle() {
        addCombatMessage({
            message: `🚀 BATTLE START`,
            type: 'info'
        });

        const playerGoesFirst = battlePlayerFighter.speed >= battleAiFighter.speed;

        addCombatMessage({
            message: `⚡ ${playerGoesFirst ? battlePlayerFighter.name : battleAiFighter.name} goes first!`,
            type: 'info'
        });

        if (playerGoesFirst) {
            startPlayerTurn();
        } else {
            isPlayerTurn = false;
            setTimeout(() => executeAITurn(), 1000);
        }
    }

    function startPlayerTurn() {
        if (battleEnded) return;

        isPlayerTurn = true;
        animationInProgress = false;
        showMoveSelection = true;

        addCombatMessage({
            message: `🎯 ${battlePlayerFighter.name}'s turn`,
            type: 'info'
        });
    }

    function addCombatMessage(message: CombatMessage) {
        combatMessages = [...combatMessages, message];

        setTimeout(() => {
            const logElement = document.querySelector('.combat-log-entries');
            if (logElement) {
                logElement.scrollTop = logElement.scrollHeight;
            }
        }, 100);
    }

    async function handlePlayerMoveSelection(event: CustomEvent) {
        if (!isPlayerTurn || animationInProgress || battleEnded) return;

        const { move } = event.detail;
        await executePlayerMove(move);
    }

    async function executePlayerMove(move: Move) {
        if (battleEnded) return;

        animationInProgress = true;
        showMoveSelection = false;

        playerPP[move.name]--;
        moveHistory.push(move.name);

        const damage = calculateDamage(battlePlayerFighter, battleAiFighter, move);
        const effectiveness = getTypeMultiplier(
            ALGORITHM_TYPES[battlePlayerFighter.name],
            ALGORITHM_TYPES[battleAiFighter.name]
        );
        const isCritical = Math.random() < 0.1;
        const missed = Math.random() > (move.accuracy / 100);

        if (!missed) {
            let finalDamage = damage;
            if (isCritical) finalDamage *= 1.5;
            finalDamage *= effectiveness;
            finalDamage = Math.round(finalDamage);

            battleAiFighter.health = Math.max(0, battleAiFighter.health - finalDamage);

            addCombatMessage(generateAttackMessage(
                battlePlayerFighter.name,
                move.name,
                finalDamage,
                effectiveness,
                isCritical,
                false
            ));
        } else {
            addCombatMessage(generateAttackMessage(
                battlePlayerFighter.name,
                move.name,
                0,
                effectiveness,
                false,
                true
            ));
        }

        await new Promise(resolve => setTimeout(resolve, 800));

        if (battleAiFighter.health <= 0 && !battleEnded) {
            endBattle(battlePlayerFighter.name);
            return;
        }

        if (move.category === 'status') {
            applyStatusEffect(move, 'ai');
        }

        if (!battleEnded) {
            await switchToNextTurn();
        }
    }

    async function executeAITurn() {
        if (isPlayerTurn || animationInProgress || battleEnded) return;

        aiThinking = true;

        addCombatMessage({
            message: `🤔 ${battleAiFighter.name} is thinking...`,
            type: 'info'
        });

        await new Promise(resolve => setTimeout(resolve, aiDecisionDelay));

        if (battleEnded) return;

        const combatState: CombatState = {
            playerFighter: battlePlayerFighter,
            aiFighter: battleAiFighter,
            playerMoves,
            aiMoves,
            playerPP,
            aiPP,
            turn: currentTurn,
            lastPlayerMove: moveHistory[moveHistory.length - 1],
            moveHistory: [...moveHistory]
        };

        const aiDecision = combatAI.selectMove(combatState);
        const move = aiDecision.move;

        aiThinking = false;

        if (battleEnded) return;

        animationInProgress = true;

        addCombatMessage(generateAIReasoningMessage(
            battleAiFighter.name,
            move.name,
            aiDecision.reasoning,
            aiDecision.confidence
        ));

        aiPP[move.name]--;
        moveHistory.push(move.name);

        const damage = calculateDamage(battleAiFighter, battlePlayerFighter, move);
        const effectiveness = getTypeMultiplier(
            ALGORITHM_TYPES[battleAiFighter.name],
            ALGORITHM_TYPES[battlePlayerFighter.name]
        );
        const isCritical = Math.random() < 0.1;
        const missed = Math.random() > (move.accuracy / 100);

        if (!missed) {
            let finalDamage = damage;
            if (isCritical) finalDamage *= 1.5;
            finalDamage *= effectiveness;
            finalDamage = Math.round(finalDamage);

            battlePlayerFighter.health = Math.max(0, battlePlayerFighter.health - finalDamage);

            addCombatMessage(generateAttackMessage(
                battleAiFighter.name,
                move.name,
                finalDamage,
                effectiveness,
                isCritical,
                false
            ));
        } else {
            addCombatMessage(generateAttackMessage(
                battleAiFighter.name,
                move.name,
                0,
                effectiveness,
                false,
                true
            ));
        }

        await new Promise(resolve => setTimeout(resolve, 800));

        if (battlePlayerFighter.health <= 0 && !battleEnded) {
            endBattle(battleAiFighter.name);
            return;
        }

        if (move.category === 'status') {
            applyStatusEffect(move, 'player');
        }

        if (!battleEnded) {
            await switchToNextTurn();
        }
    }

    async function switchToNextTurn() {
        if (battleEnded) return;

        animationInProgress = false;
        processStatusEffects();
        isPlayerTurn = !isPlayerTurn;
        currentTurn++;

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (battleEnded) return;

        if (isPlayerTurn) {
            startPlayerTurn();
        } else {
            isPlayerTurn = false;
            showMoveSelection = false;
            setTimeout(() => {
                if (!battleEnded && !isPlayerTurn) {
                    executeAITurn();
                }
            }, 500);
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

    function applyStatusEffect(move: Move, target: 'player' | 'ai') {
        const statusEffects = {
            'Dropout Defense': { name: 'dropout-defense', type: 'positive' as const, turns: 3 },
            'Overfitting': { name: 'overfitting', type: 'negative' as const, turns: 4 },
        };

        const effect = statusEffects[move.name as keyof typeof statusEffects];
        if (effect) {
            const statusArray = target === 'player' ? playerStatus : aiStatus;
            statusArray.push({
                name: effect.name,
                type: effect.type,
                turnsRemaining: effect.turns,
                description: `Applied by ${move.name}`
            });

            if (target === 'player') {
                playerStatus = [...playerStatus];
            } else {
                aiStatus = [...aiStatus];
            }

            addCombatMessage({
                message: `✨ ${target === 'player' ? battlePlayerFighter.name : battleAiFighter.name} is affected by ${effect.name}!`,
                type: 'status'
            });
        }
    }

    function processStatusEffects() {
        playerStatus = playerStatus.map(status => ({
            ...status,
            turnsRemaining: status.turnsRemaining - 1
        })).filter(status => {
            if (status.turnsRemaining <= 0) {
                addCombatMessage({
                    message: `🔄 ${battlePlayerFighter.name} recovers from ${status.name}`,
                    type: 'status'
                });
                return false;
            }
            return true;
        });

        aiStatus = aiStatus.map(status => ({
            ...status,
            turnsRemaining: status.turnsRemaining - 1
        })).filter(status => {
            if (status.turnsRemaining <= 0) {
                addCombatMessage({
                    message: `🔄 ${battleAiFighter.name} recovers from ${status.name}`,
                    type: 'status'
                });
                return false;
            }
            return true;
        });
    }

    function endBattle(winnerName: string) {
        if (battleEnded) return;

        battleEnded = true;
        winner = winnerName;
        showMoveSelection = false;
        animationInProgress = false;
        aiThinking = false;
        showBattleEndOverlay = true;

        addCombatMessage({
            message: `🏆 ${winnerName} WINS!`,
            type: 'info'
        });

        setTimeout(() => {
            if (battleEnded) {
                dispatch('battle-end', {
                    winner: winnerName,
                    playerFinalHealth: battlePlayerFighter.health,
                    aiFinalHealth: battleAiFighter.health,
                    totalTurns: currentTurn
                });
            }
        }, 2000);
    }

    function handlePPWarning(event: CustomEvent) {
        const { moveName } = event.detail;
        addCombatMessage({
            message: `⚠️ ${moveName} has no PP remaining!`,
            type: 'info'
        });
    }

    function resetBattle() {
        showBattleEndOverlay = true;
        initializeCombat();
    }

    function backToMenu() {
        dispatch('back-to-menu');
    }
</script>

<div class="combat-interface">
    <!-- Battle Header -->
    <div class="battle-header">
        <div class="turn-indicator">
            <div class="turn-info">
                <span class="turn-number">Turn {currentTurn}</span>
                <div class="current-turn">
                    {#if battleEnded}
                        <span class="battle-ended">🏆 Battle Complete!</span>
                    {:else if isPlayerTurn && !aiThinking}
                        <span class="player-turn">🎯 Your Turn</span>
                    {:else if aiThinking}
                        <span class="ai-thinking">🤔 AI Thinking...</span>
                    {:else}
                        <span class="ai-turn">🤖 AI Turn</span>
                    {/if}
                </div>
            </div>
        </div>

        <div class="ai-level-indicator">
            <span class="ai-level-label">AI Level:</span>
            <span class="ai-level-value level-{aiLevel}">{aiLevel.toUpperCase()}</span>
        </div>
    </div>

    <!-- Fighter Health Bars -->
    {#if battlePlayerFighter && battleAiFighter}
        <div class="health-bars">
            <div class="fighter-health player-health">
                <div class="fighter-info">
                    <span class="fighter-name">{battlePlayerFighter.name}</span>
                    <span class="health-text">{battlePlayerFighter.health}/{battlePlayerFighter.maxHealth}</span>
                </div>
                <div class="health-bar">
                    <div
                            class="health-fill player-fill"
                            style="width: {(battlePlayerFighter.health / battlePlayerFighter.maxHealth) * 100}%"
                    ></div>
                </div>
            </div>

            <div class="vs-indicator">VS</div>

            <div class="fighter-health ai-health">
                <div class="fighter-info">
                    <span class="fighter-name">{battleAiFighter.name}</span>
                    <span class="health-text">{battleAiFighter.health}/{battleAiFighter.maxHealth}</span>
                </div>
                <div class="health-bar">
                    <div
                            class="health-fill ai-fill"
                            style="width: {(battleAiFighter.health / battleAiFighter.maxHealth) * 100}%"
                    ></div>
                </div>
            </div>
        </div>
    {/if}

    <!-- Status Effects -->
    <div class="status-section">
        {#if playerStatus.length > 0 && battlePlayerFighter}
            <StatusEffects
                    statusEffects={playerStatus}
                    fighterName={battlePlayerFighter.name}
            />
        {/if}

        {#if aiStatus.length > 0 && battleAiFighter}
            <StatusEffects
                    statusEffects={aiStatus}
                    fighterName={battleAiFighter.name}
            />
        {/if}
    </div>

    <!-- Move Selection -->
    {#if showMoveSelection && !battleEnded && isPlayerTurn && battlePlayerFighter}
        <MoveSelection
                playerFighter={battlePlayerFighter}
                opponentFighter={battleAiFighter}
                availableMoves={playerMoves}
                ppCounters={playerPP}
                {isPlayerTurn}
                disabled={animationInProgress || aiThinking || battleEnded}
                on:move-selected={handlePlayerMoveSelection}
                on:pp-warning={handlePPWarning}
        />
    {/if}

    <!-- Combat Log -->
    <div class="combat-log">
        <div class="log-header">
            <h3>📋 Battle Log</h3>
            <div class="log-controls">
                {#if battleEnded && !showBattleEndOverlay}
                    <div class="post-battle-controls">
                        <button class="log-action-button" on:click={resetBattle}>🔄 Replay</button>
                        <button class="log-action-button" on:click={backToMenu}>🏠 Main Menu</button>
                    </div>
                {:else if aiThinking}
                    <div class="ai-thinking-indicator">
                        <span class="thinking-text">AI Analyzing...</span>
                        <div class="thinking-animation">🤔</div>
                    </div>
                {/if}
            </div>
        </div>

        <div class="combat-log-entries">
            {#each combatMessages as message, index}
                <div class="log-entry message-{message.type}" class:latest={index === combatMessages.length - 1}>
                    <div class="message-text">{message.message}</div>
                    {#if message.educational}
                        <div class="educational-note">
                            <span class="education-icon">🎓</span>
                            <span class="education-text">{message.educational}</span>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </div>

    <!-- Battle End Screen -->
    {#if battleEnded && battlePlayerFighter && showBattleEndOverlay}
        <div class="battle-end-overlay">
            <div class="battle-result">
                <div class="result-header">
                    {#if winner === battlePlayerFighter.name}
                        <h2 class="victory">🎉 Victory!</h2>
                        <p>You defeated the {aiLevel} AI!</p>
                    {:else}
                        <h2 class="defeat">💀 Defeat!</h2>
                        <p>The {aiLevel} AI proved superior!</p>
                    {/if}
                </div>

                <div class="battle-stats">
                    <div class="stat">
                        <span class="stat-label">Total Turns:</span>
                        <span class="stat-value">{currentTurn}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Your Final HP:</span>
                        <span class="stat-value">{battlePlayerFighter.health}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">AI Final HP:</span>
                        <span class="stat-value">{battleAiFighter.health}</span>
                    </div>
                </div>

                <div class="battle-actions">
                    <button class="action-button secondary-button" on:click={() => {showBattleEndOverlay = false}}>
                        📋 View Battle Log
                    </button>
                    <button class="action-button primary-button" on:click={resetBattle}>
                        🔄 New Battle
                    </button>
                    <button class="action-button secondary-button" on:click={backToMenu}>
                        🏠 Back to Menu
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .combat-interface {
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Courier New', monospace;
        color: #f1f5f9;
        position: relative;
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
        min-height: 100vh;
        border-radius: 10px;
    }

    :global(.theme-dark) .combat-interface {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
    }

    .battle-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(148, 163, 184, 0.15);
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        backdrop-filter: blur(10px);
    }

    .turn-indicator {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .turn-number {
        font-size: 1.2rem;
        font-weight: 600;
        color: #3b82f6;
    }

    .current-turn {
        font-size: 0.9rem;
    }

    .player-turn {
        color: #22c55e;
        font-weight: 600;
    }

    .ai-turn {
        color: #f59e0b;
        font-weight: 600;
    }

    .ai-thinking {
        color: #8b5cf6;
        font-weight: 600;
    }

    .battle-ended {
        color: #ec4899;
        font-weight: 600;
    }

    .ai-level-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .ai-level-label {
        color: #cbd5e1;
        font-size: 0.9rem;
    }

    .ai-level-value {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .level-easy {
        background: #22c55e;
        color: #fff;
    }

    .level-normal {
        background: #f59e0b;
        color: #fff;
    }

    .level-hard {
        background: #dc2626;
        color: #fff;
    }

    .health-bars {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 20px;
        align-items: center;
        margin-bottom: 20px;
    }

    .fighter-health {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .fighter-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .fighter-name {
        font-weight: 600;
        color: #3b82f6;
    }

    .health-text {
        color: #cbd5e1;
        font-size: 0.9rem;
    }

    .health-bar {
        height: 12px;
        background: rgba(148, 163, 184, 0.3);
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid rgba(148, 163, 184, 0.2);
    }

    .health-fill {
        height: 100%;
        transition: width 0.5s ease;
        border-radius: 5px;
    }

    .player-fill {
        background: linear-gradient(90deg, #22c55e, #16a34a);
    }

    .ai-fill {
        background: linear-gradient(90deg, #dc2626, #b91c1c);
    }

    .vs-indicator {
        font-size: 1.5rem;
        font-weight: 600;
        color: #60a5fa;
        text-align: center;
    }

    .status-section {
        margin-bottom: 20px;
    }

    .combat-log {
        background: rgba(148, 163, 184, 0.1);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 10px;
        margin-top: 20px;
        backdrop-filter: blur(10px);
    }

    .log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    }

    .log-header h3 {
        margin: 0;
        color: #3b82f6;
    }

    .post-battle-controls {
        display: flex;
        gap: 10px;
    }

    .log-action-button {
        background: rgba(37, 99, 235, 0.8);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: inherit;
    }

    .educational-note {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px;
        background: rgba(37, 99, 235, 0.1);
        border-radius: 4px;
        margin-top: 6px;
        border: 1px solid rgba(37, 99, 235, 0.2);
    }

    .education-icon {
        color: #3b82f6;
        font-size: 0.9rem;
        margin-top: 1px;
        flex-shrink: 0;
    }

    .education-text {
        color: #cbd5e1;
        font-size: 0.85rem;
        line-height: 1.4;
        font-style: italic;
    }

    .ai-thinking-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #8b5cf6;
    }

    .thinking-text {
        font-size: 0.9rem;
        font-style: italic;
    }

    .thinking-animation {
        animation: bounce 1s ease-in-out infinite;
    }

    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
    }

    .combat-log-entries {
        max-height: 350px;
        overflow-y: auto;
        padding: 15px;
    }

    .log-entry {
        margin-bottom: 8px;
        padding: 8px;
        border-radius: 6px;
        background: rgba(148, 163, 184, 0.05);
        border-left: 3px solid #64748b;
        transition: all 0.3s ease;
    }

    .log-entry.latest {
        background: rgba(37, 99, 235, 0.15);
        border-left-color: #2563eb;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
    }

    .message-attack { border-left-color: #dc2626; }
    .message-critical { border-left-color: #f59e0b; }
    .message-super_effective { border-left-color: #22c55e; }
    .message-not_effective { border-left-color: #6b7280; }
    .message-status { border-left-color: #8b5cf6; }
    .message-info { border-left-color: #3b82f6; }
    .message-miss { border-left-color: #64748b; }

    .message-text {
        color: #f1f5f9;
        font-weight: 500;
        line-height: 1.3;
        font-size: 0.95rem;
    }

    .battle-end-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        backdrop-filter: blur(5px);
        border-radius: 10px;
    }

    .battle-result {
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
        border: 3px solid #2563eb;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3);
    }

    :global(.theme-dark) .battle-result {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        border-color: #3b82f6;
    }

    .result-header h2 {
        margin: 0 0 10px 0;
        font-size: 2rem;
    }

    .result-header p {
        margin: 0 0 20px 0;
        color: #cbd5e1;
    }

    .victory {
        color: #22c55e;
    }

    .defeat {
        color: #dc2626;
    }

    .battle-stats {
        margin: 20px 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .stat {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    }

    .stat-label {
        color: #cbd5e1;
    }

    .stat-value {
        color: #3b82f6;
        font-weight: 600;
    }

    .battle-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        justify-content: center;
    }

    .action-button {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: inherit;
    }

    .primary-button {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
    }

    .primary-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
    }

    .secondary-button {
        background: rgba(71, 85, 105, 0.8);
        color: #e2e8f0;
        border: 2px solid #475569;
    }

    .secondary-button:hover {
        background: #64748b;
        border-color: #64748b;
        transform: translateY(-2px);
    }

    .combat-log-entries::-webkit-scrollbar {
        width: 8px;
    }

    .combat-log-entries::-webkit-scrollbar-track {
        background: rgba(148, 163, 184, 0.1);
        border-radius: 4px;
    }

    .combat-log-entries::-webkit-scrollbar-thumb {
        background: #2563eb;
        border-radius: 4px;
    }

    .combat-log-entries::-webkit-scrollbar-thumb:hover {
        background: #3b82f6;
    }

    @media (max-width: 768px) {
        .combat-interface {
            padding: 15px;
        }

        .battle-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
        }

        .health-bars {
            grid-template-columns: 1fr;
            gap: 15px;
        }

        .vs-indicator {
            order: -1;
        }

        .combat-log-entries {
            max-height: 250px;
            padding: 10px;
        }

        .battle-result {
            padding: 20px;
            margin: 0 10px;
        }

        .log-entry {
            padding: 6px;
            margin-bottom: 6px;
        }
    }

    @media (max-width: 480px) {
        .turn-number {
            font-size: 1rem;
        }

        .result-header h2 {
            font-size: 1.5rem;
        }

        .message-text {
            font-size: 0.9rem;
        }
    }
</style>