<!-- @file src/lib/components/combat/CombatInterface.svelte -->
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
    let aiDecisionDelay = 2000; // 2 seconds for AI to "think"

    // UI state
    let showMoveSelection = true;
    let animationInProgress = false;

    onMount(() => {
        initializeCombat();
    });

    function initializeCombat() {
        // Initialize moves
        playerMoves = getMovesByAlgorithm(playerFighter.name);
        aiMoves = getMovesByAlgorithm(aiFighter.name);

        // Initialize PP
        playerMoves.forEach(move => {
            playerPP[move.name] = move.pp;
        });
        aiMoves.forEach(move => {
            aiPP[move.name] = move.pp;
        });

        // Initialize AI
        combatAI = new CombatAI(aiLevel);

        // Add initial message
        addCombatMessage(generateTurnStartMessage(
            playerFighter.name,
            aiFighter.name,
            isPlayerTurn,
            currentTurn
        ));

        // Add AI personality introduction
        addCombatMessage({
            message: `🤖 ${aiFighter.name} AI: "${combatAI.getPersonality()}"`,
            educational: `This AI represents different levels of ML expertise, from beginner to expert data scientist.`,
            type: 'info'
        });
    }

    function addCombatMessage(message: CombatMessage) {
        combatMessages = [...combatMessages, message];
        // Auto-scroll to bottom
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
        animationInProgress = true;
        showMoveSelection = false;

        // Reduce PP
        playerPP[move.name]--;

        // Add move to history
        moveHistory.push(move.name);

        // Calculate damage
        const damage = calculateDamage(playerFighter, aiFighter, move);
        const effectiveness = getTypeMultiplier(
            ALGORITHM_TYPES[playerFighter.name],
            ALGORITHM_TYPES[aiFighter.name]
        );
        const isCritical = Math.random() < 0.1; // 10% critical hit chance
        const missed = Math.random() > (move.accuracy / 100);

        // Apply damage if hit
        if (!missed) {
            let finalDamage = damage;
            if (isCritical) finalDamage *= 1.5;
            finalDamage *= effectiveness;
            finalDamage = Math.round(finalDamage);

            aiFighter.health = Math.max(0, aiFighter.health - finalDamage);

            // Add attack message
            addCombatMessage(generateAttackMessage(
                playerFighter.name,
                move.name,
                finalDamage,
                effectiveness,
                isCritical,
                false
            ));
        } else {
            addCombatMessage(generateAttackMessage(
                playerFighter.name,
                move.name,
                0,
                effectiveness,
                false,
                true
            ));
        }

        // Check for battle end
        if (aiFighter.health <= 0) {
            endBattle(playerFighter.name);
            return;
        }

        // Apply status effects if any
        if (move.category === 'status') {
            applyStatusEffect(move, 'ai');
        }

        // Switch to AI turn
        await switchToNextTurn();
    }

    async function executeAITurn() {
        if (isPlayerTurn || animationInProgress || battleEnded) return;

        aiThinking = true;

        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, aiDecisionDelay));

        // Get AI decision
        const combatState: CombatState = {
            playerFighter,
            aiFighter,
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
        animationInProgress = true;

        // Add AI reasoning message
        addCombatMessage(generateAIReasoningMessage(
            aiFighter.name,
            move.name,
            aiDecision.reasoning,
            aiDecision.confidence
        ));

        // Reduce AI PP
        aiPP[move.name]--;

        // Add move to history
        moveHistory.push(move.name);

        // Calculate damage
        const damage = calculateDamage(aiFighter, playerFighter, move);
        const effectiveness = getTypeMultiplier(
            ALGORITHM_TYPES[aiFighter.name],
            ALGORITHM_TYPES[playerFighter.name]
        );
        const isCritical = Math.random() < 0.1;
        const missed = Math.random() > (move.accuracy / 100);

        // Apply damage if hit
        if (!missed) {
            let finalDamage = damage;
            if (isCritical) finalDamage *= 1.5;
            finalDamage *= effectiveness;
            finalDamage = Math.round(finalDamage);

            playerFighter.health = Math.max(0, playerFighter.health - finalDamage);

            addCombatMessage(generateAttackMessage(
                aiFighter.name,
                move.name,
                finalDamage,
                effectiveness,
                isCritical,
                false
            ));
        } else {
            addCombatMessage(generateAttackMessage(
                aiFighter.name,
                move.name,
                0,
                effectiveness,
                false,
                true
            ));
        }

        // Check for battle end
        if (playerFighter.health <= 0) {
            endBattle(aiFighter.name);
            return;
        }

        // Apply status effects if any
        if (move.category === 'status') {
            applyStatusEffect(move, 'player');
        }

        // Switch to player turn
        await switchToNextTurn();
    }

    async function switchToNextTurn() {
        // Process status effects
        processStatusEffects();

        // Switch turns
        isPlayerTurn = !isPlayerTurn;
        if (isPlayerTurn) {
            currentTurn++;
        }

        // Add turn start message
        addCombatMessage(generateTurnStartMessage(
            playerFighter.name,
            aiFighter.name,
            isPlayerTurn,
            currentTurn
        ));

        // Reset UI state
        animationInProgress = false;
        if (isPlayerTurn) {
            showMoveSelection = true;
        } else {
            showMoveSelection = false;
            // Start AI turn after a short delay
            setTimeout(() => executeAITurn(), 1000);
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
        // Simple status effect system - can be expanded
        const statusEffects = {
            'Dropout Defense': { name: 'dropout-defense', type: 'positive' as const, turns: 3 },
            'Overfitting': { name: 'overfitting', type: 'negative' as const, turns: 4 },
            // Add more status effects based on moves
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
        }
    }

    function processStatusEffects() {
        // Process player status effects
        playerStatus = playerStatus.map(status => ({
            ...status,
            turnsRemaining: status.turnsRemaining - 1
        })).filter(status => status.turnsRemaining > 0);

        // Process AI status effects
        aiStatus = aiStatus.map(status => ({
            ...status,
            turnsRemaining: status.turnsRemaining - 1
        })).filter(status => status.turnsRemaining > 0);
    }

    function endBattle(winnerName: string) {
        battleEnded = true;
        winner = winnerName;
        showMoveSelection = false;
        animationInProgress = false;

        addCombatMessage(generateEndBattleMessage(
            winnerName,
            winnerName === playerFighter.name ? aiFighter.name : playerFighter.name,
            0
        ));

        // Dispatch battle end event
        setTimeout(() => {
            dispatch('battle-end', {
                winner: winnerName,
                playerFinalHealth: playerFighter.health,
                aiFinalHealth: aiFighter.health,
                totalTurns: currentTurn
            });
        }, 2000);
    }

    function handlePPWarning(event: CustomEvent) {
        const { moveName } = event.detail;
        addCombatMessage({
            message: `⚠️ ${moveName} has no PP remaining!`,
            educational: "PP (Power Points) represent computational resources. More powerful algorithms require more processing power.",
            type: 'info'
        });
    }

    function resetBattle() {
        // Reset all state for a new battle
        dispatch('reset-battle');
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
                    {:else if isPlayerTurn}
                        <span class="player-turn">🎯 Your Turn</span>
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
    <div class="health-bars">
        <div class="fighter-health player-health">
            <div class="fighter-info">
                <span class="fighter-name">{playerFighter.name}</span>
                <span class="health-text">{playerFighter.health}/{playerFighter.maxHealth}</span>
            </div>
            <div class="health-bar">
                <div
                        class="health-fill player-fill"
                        style="width: {(playerFighter.health / playerFighter.maxHealth) * 100}%"
                ></div>
            </div>
        </div>

        <div class="vs-indicator">VS</div>

        <div class="fighter-health ai-health">
            <div class="fighter-info">
                <span class="fighter-name">{aiFighter.name}</span>
                <span class="health-text">{aiFighter.health}/{aiFighter.maxHealth}</span>
            </div>
            <div class="health-bar">
                <div
                        class="health-fill ai-fill"
                        style="width: {(aiFighter.health / aiFighter.maxHealth) * 100}%"
                ></div>
            </div>
        </div>
    </div>

    <!-- Status Effects -->
    <div class="status-section">
        {#if playerStatus.length > 0}
            <StatusEffects
                    statusEffects={playerStatus}
                    fighterName={playerFighter.name}
            />
        {/if}

        {#if aiStatus.length > 0}
            <StatusEffects
                    statusEffects={aiStatus}
                    fighterName={aiFighter.name}
            />
        {/if}
    </div>

    <!-- Move Selection -->
    {#if showMoveSelection && !battleEnded}
        <MoveSelection
                {playerFighter}
                opponentFighter={aiFighter}
                availableMoves={playerMoves}
                ppCounters={playerPP}
                {isPlayerTurn}
                disabled={animationInProgress || aiThinking}
                on:move-selected={handlePlayerMoveSelection}
                on:pp-warning={handlePPWarning}
        />
    {/if}

    <!-- Combat Log -->
    <div class="combat-log">
        <div class="log-header">
            <h3>⚔️ Battle Log</h3>
            {#if aiThinking}
                <div class="ai-thinking-indicator">
                    <span class="thinking-text">AI is strategizing...</span>
                    <div class="thinking-animation">🤔</div>
                </div>
            {/if}
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
    {#if battleEnded}
        <div class="battle-end-overlay">
            <div class="battle-result">
                <div class="result-header">
                    {#if winner === playerFighter.name}
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
                        <span class="stat-value">{playerFighter.health}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">AI Final HP:</span>
                        <span class="stat-value">{aiFighter.health}</span>
                    </div>
                </div>

                <div class="battle-actions">
                    <button class="rematch-button" on:click={resetBattle}>
                        🔄 New Battle
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
        color: #fff;
        position: relative;
    }

    /* Battle Header */
    .battle-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        border: 1px solid #333;
    }

    .turn-indicator {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .turn-number {
        font-size: 1.2rem;
        font-weight: bold;
        color: #4ecdc4;
    }

    .current-turn {
        font-size: 0.9rem;
    }

    .player-turn {
        color: #22c55e;
        font-weight: bold;
    }

    .ai-turn {
        color: #f59e0b;
        font-weight: bold;
    }

    .battle-ended {
        color: #ec4899;
        font-weight: bold;
    }

    .ai-level-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .ai-level-label {
        color: #ccc;
        font-size: 0.9rem;
    }

    .ai-level-value {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: bold;
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
        background: #ef4444;
        color: #fff;
    }

    /* Health Bars */
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
        font-weight: bold;
        color: #4ecdc4;
    }

    .health-text {
        color: #ccc;
        font-size: 0.9rem;
    }

    .health-bar {
        height: 12px;
        background: #333;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid #555;
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
        background: linear-gradient(90deg, #ef4444, #dc2626);
    }

    .vs-indicator {
        font-size: 1.5rem;
        font-weight: bold;
        color: #ff6b6b;
        text-align: center;
    }

    /* Status Effects */
    .status-section {
        margin-bottom: 20px;
    }

    /* Combat Log */
    .combat-log {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid #333;
        border-radius: 10px;
        margin-top: 20px;
    }

    .log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #333;
    }

    .log-header h3 {
        margin: 0;
        color: #4ecdc4;
    }

    .ai-thinking-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #f59e0b;
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
        max-height: 300px;
        overflow-y: auto;
        padding: 15px;
    }

    .log-entry {
        margin-bottom: 12px;
        padding: 10px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.03);
        border-left: 3px solid #333;
    }

    .log-entry.latest {
        background: rgba(78, 205, 196, 0.1);
        border-left-color: #4ecdc4;
    }

    .message-attack { border-left-color: #ef4444; }
    .message-critical { border-left-color: #f59e0b; }
    .message-super_effective { border-left-color: #22c55e; }
    .message-not_effective { border-left-color: #6b7280; }
    .message-status { border-left-color: #8b5cf6; }
    .message-info { border-left-color: #4ecdc4; }
    .message-miss { border-left-color: #64748b; }

    .message-text {
        color: #fff;
        font-weight: bold;
        margin-bottom: 5px;
    }

    .educational-note {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        padding: 8px;
        background: rgba(78, 205, 196, 0.1);
        border-radius: 4px;
        margin-top: 5px;
    }

    .education-icon {
        color: #4ecdc4;
        font-size: 0.9rem;
        margin-top: 1px;
    }

    .education-text {
        color: #e5e7eb;
        font-size: 0.85rem;
        line-height: 1.4;
        font-style: italic;
    }

    /* Battle End Overlay */
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
    }

    .battle-result {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 3px solid #4ecdc4;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        max-width: 400px;
        width: 90%;
    }

    .result-header h2 {
        margin: 0 0 10px 0;
        font-size: 2rem;
    }

    .victory {
        color: #22c55e;
    }

    .defeat {
        color: #ef4444;
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
        padding: 5px 0;
        border-bottom: 1px solid #333;
    }

    .stat-label {
        color: #ccc;
    }

    .stat-value {
        color: #4ecdc4;
        font-weight: bold;
    }

    .rematch-button {
        background: linear-gradient(45deg, #4ecdc4, #45b7d1);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: inherit;
    }

    .rematch-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
    }

    /* Responsive */
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
        }

        .battle-result {
            padding: 20px;
        }
    }
</style>