<!-- @file src/lib/components/combat/MoveSelection.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Move } from '$lib/data/moves';
    import type { Fighter } from '$lib/ml/algorithms';
    import { getTypeMultiplier, ALGORITHM_TYPES } from '$lib/data/type-advantages';

    export let playerFighter: Fighter;
    export let opponentFighter: Fighter;
    export let availableMoves: Move[];
    export let ppCounters: Record<string, number>;
    export let isPlayerTurn: boolean;
    export let disabled: boolean = false;

    const dispatch = createEventDispatcher();

    let showTooltip = false;
    let currentMove: Move | null = null;

    function getEffectivenessInfo(move: Move) {
        const playerType = ALGORITHM_TYPES[playerFighter.name];
        const opponentType = ALGORITHM_TYPES[opponentFighter.name];
        const multiplier = getTypeMultiplier(playerType, opponentType);

        if (multiplier > 1.2) return { text: 'Super Effective!', class: 'super-effective' };
        if (multiplier < 0.9) return { text: 'Not Very Effective', class: 'not-effective' };
        return { text: 'Normal Damage', class: 'normal' };
    }

    function handleMoveSelect(move: Move) {
        if (disabled || !isPlayerTurn) return;

        const pp = ppCounters[move.name] || 0;
        if (pp <= 0) {
            dispatch('pp-warning', { moveName: move.name });
            return;
        }

        showTooltip = false;
        currentMove = null;
        dispatch('move-selected', { move });
    }

    function handleTooltipClick(event: MouseEvent, move: Move) {
        event.stopPropagation();

        if (showTooltip && currentMove === move) {
            closeTooltip();
        } else {
            currentMove = move;
            showTooltip = true;
        }
    }

    function closeTooltip() {
        showTooltip = false;
        currentMove = null;
    }

    function getPPStatus(move: Move): { class: string; text: string } {
        const pp = ppCounters[move.name] || 0;
        const maxPP = move.pp;
        const ratio = pp / maxPP;

        if (pp === 0) return { class: 'pp-empty', text: 'No PP!' };
        if (ratio < 0.25) return { class: 'pp-low', text: `${pp}/${maxPP}` };
        if (ratio < 0.5) return { class: 'pp-medium', text: `${pp}/${maxPP}` };
        return { class: 'pp-full', text: `${pp}/${maxPP}` };
    }

    function handleDocumentClick() {
        if (showTooltip) {
            closeTooltip();
        }
    }
</script>

<svelte:document on:click={handleDocumentClick} />

<div class="move-selection" class:disabled>
    <div class="selection-header">
        <h3>
            {#if isPlayerTurn}
                🎯 Choose your move!
            {:else}
                ⏳ AI is strategizing...
            {/if}
        </h3>

        {#if !isPlayerTurn}
            <div class="ai-thinking">
                <div class="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="thinking-text">AI is analyzing optimal strategy...</span>
            </div>
        {/if}
    </div>

    <div class="moves-grid">
        {#each availableMoves as move}
            {@const effectiveness = getEffectivenessInfo(move)}
            {@const ppStatus = getPPStatus(move)}
            {@const canUse = ppCounters[move.name] > 0 && isPlayerTurn && !disabled}

            <button
                    class="move-button"
                    class:can-use={canUse}
                    class:no-pp={ppCounters[move.name] <= 0}
                    class:disabled={!canUse}
                    disabled={!canUse}
                    on:click={() => handleMoveSelect(move)}
            >
                <div class="move-header">
                    <div class="move-name">{move.name}</div>
                    <div class="move-type type-{move.type}">{move.type}</div>
                </div>

                <div class="move-stats">
                    <div class="stat">
                        <span class="stat-label">PWR</span>
                        <span class="stat-value">{move.power || '—'}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">ACC</span>
                        <span class="stat-value">{move.accuracy}%</span>
                    </div>
                </div>

                <div class="move-bottom">
                    <div class="move-category">
						<span class="category-icon">
							{#if move.category === 'physical'}💪
							{:else if move.category === 'special'}✨
							{:else}🛡️
							{/if}
						</span>
                        <span class="category-text">{move.category}</span>
                    </div>

                    <div class="pp-display">
                        <span class="pp-label">PP</span>
                        <span class="pp-value {ppStatus.class}">{ppStatus.text}</span>
                    </div>

                    <span
                            class="move-tooltip-icon"
                            class:disabled={!canUse || disabled}
                            on:click={(e) => {
                                if (!canUse || disabled) return;
                                handleTooltipClick(e, move);
                            }}
                    >
                        ❓
                    </span>
                </div>

                {#if isPlayerTurn && canUse}
                    <div class="effectiveness-indicator {effectiveness.class}">
                        {effectiveness.text}
                    </div>
                {/if}

                {#if !canUse && ppCounters[move.name] <= 0}
                    <div class="pp-warning">
                        Out of PP!
                    </div>
                {/if}
            </button>
        {/each}
    </div>

    <div class="selection-footer">
        {#if isPlayerTurn}
            <div class="turn-info">
                <span class="tip-icon">💡</span>
                <span class="tip-text">Click ❓ on moves for detailed ML explanations!</span>
            </div>
        {/if}
    </div>
</div>

{#if showTooltip && currentMove}
    <div class="tooltip-overlay" on:click={closeTooltip}>
        <div class="move-tooltip" on:click={(e) => e.stopPropagation()}>
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

<style>
    .move-selection {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(180deg, rgba(30, 58, 138, 0.95) 0%, rgba(30, 64, 175, 0.98) 100%);
        border-top: 3px solid #2563eb;
        padding: 4px;
        transition: all 0.3s ease;
        z-index: 20;
        min-height: 100px;
        backdrop-filter: blur(10px);
    }

    :global(.theme-dark) .move-selection {
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%);
        border-top-color: #3b82f6;
    }

    .move-selection.disabled {
        opacity: 0.7;
        pointer-events: none;
    }

    .selection-header {
        text-align: center;
        margin-bottom: 4px;
        padding-bottom: 4px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.3);
    }

    .selection-header h3 {
        margin: 0;
        color: #f1f5f9;
        font-size: 0.9rem;
        font-weight: 600;
    }

    .ai-thinking {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: #cbd5e1;
    }

    .thinking-dots {
        display: flex;
        gap: 4px;
    }

    .thinking-dots span {
        width: 8px;
        height: 8px;
        background: #3b82f6;
        border-radius: 50%;
        animation: thinking 1.4s ease-in-out infinite both;
    }

    .thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
    .thinking-dots span:nth-child(2) { animation-delay: -0.16s; }
    .thinking-dots span:nth-child(3) { animation-delay: 0s; }

    @keyframes thinking {
        0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }

    .thinking-text {
        font-size: 0.9rem;
        font-style: italic;
    }

    .moves-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 4px;
        margin-bottom: 4px;
    }

    .move-button {
        background: rgba(148, 163, 184, 0.15);
        border: 2px solid rgba(148, 163, 184, 0.3);
        border-radius: 6px;
        padding: 4px 3px 6px;
        color: #f1f5f9;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        text-align: left;
        min-height: 45px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        backdrop-filter: blur(5px);
    }

    .move-button.can-use:hover {
        border-color: #2563eb;
        background: rgba(37, 99, 235, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
    }

    .move-button.no-pp {
        border-color: #64748b;
        background: rgba(71, 85, 105, 0.1);
        opacity: 0.6;
    }

    .move-button.disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    .move-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
    }

    .move-name {
        font-weight: 600;
        font-size: 0.85rem;
        color: #f1f5f9;
        line-height: 1.2;
        flex: 1;
        margin-right: 6px;
    }

    .move-type {
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 0.65rem;
        font-weight: 600;
        color: #fff;
        text-transform: uppercase;
        white-space: nowrap;
    }

    .move-stats {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
    }

    .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
    }

    .stat-label {
        font-size: 0.65rem;
        color: #94a3b8;
        text-transform: uppercase;
        font-weight: 600;
    }

    .stat-value {
        font-size: 0.75rem;
        font-weight: 600;
        color: #f1f5f9;
    }

    .move-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    .move-category {
        display: flex;
        align-items: center;
        gap: 3px;
    }

    .category-icon {
        font-size: 0.8rem;
    }

    .category-text {
        font-size: 0.7rem;
        color: #cbd5e1;
        text-transform: capitalize;
    }

    .pp-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
    }

    .pp-label {
        font-size: 0.65rem;
        color: #94a3b8;
        text-transform: uppercase;
        font-weight: 600;
    }

    .pp-value {
        font-size: 0.75rem;
        font-weight: 600;
    }

    .pp-value.pp-empty {
        color: #dc2626;
        font-weight: 700;
    }

    .pp-value.pp-low {
        color: #f59e0b;
    }

    .pp-value.pp-medium {
        color: #fbbf24;
    }

    .pp-value.pp-full {
        color: #22c55e;
    }

    .move-tooltip-icon {
        font-size: 0.8rem;
        opacity: 0.8;
        margin-left: 3px;
        transition: all 0.3s ease;
        cursor: pointer;
        padding: 3px;
        border-radius: 50%;
        color: #cbd5e1;
        display: inline-block;
        user-select: none;
        background: rgba(37, 99, 235, 0.1);
        border: 1px solid rgba(37, 99, 235, 0.3);
    }

    .move-tooltip-icon:hover {
        opacity: 1;
        transform: scale(1.1);
        background: rgba(37, 99, 235, 0.2);
        color: #3b82f6;
        border-color: #3b82f6;
    }

    .move-tooltip-icon.disabled {
        opacity: 0.3;
        cursor: not-allowed;
        pointer-events: none;
        background: rgba(71, 85, 105, 0.1);
        border-color: #64748b;
    }

    .effectiveness-indicator {
        position: absolute;
        bottom: 4px;
        right: 6px;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 0.65rem;
        font-weight: 600;
        z-index: 5;
    }

    .effectiveness-indicator.super-effective {
        background: #22c55e;
        color: #fff;
    }

    .effectiveness-indicator.not-effective {
        background: #dc2626;
        color: #fff;
    }

    .effectiveness-indicator.normal {
        background: #64748b;
        color: #fff;
    }

    .pp-warning {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(220, 38, 38, 0.9);
        color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 600;
        z-index: 10;
    }

    .selection-footer {
        text-align: center;
        padding-top: 4px;
        border-top: 1px solid rgba(148, 163, 184, 0.3);
    }

    .turn-info {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        color: #cbd5e1;
        font-size: 0.75rem;
    }

    .tip-icon {
        font-size: 0.9rem;
    }

    .tip-text {
        font-style: italic;
    }

    .tooltip-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .move-tooltip {
        position: relative;
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
        border: 2px solid #2563eb;
        border-radius: 8px;
        padding: 12px;
        max-width: 320px;
        width: 80vw;
        max-height: 50vh;
        overflow-y: auto;
        box-shadow: 0 8px 30px rgba(37, 99, 235, 0.4);
        color: #f1f5f9;
        font-family: 'Courier New', monospace;
        backdrop-filter: blur(10px);
        animation: tooltipFadeIn 0.3s ease-out;
    }

    :global(.theme-dark) .move-tooltip {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        border-color: #3b82f6;
    }

    @keyframes tooltipFadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }

    .tooltip-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(220, 38, 38, 0.8);
        border: none;
        color: #fff;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        font-weight: 600;
    }

    .tooltip-close:hover {
        background: #dc2626;
        transform: scale(1.1);
    }

    .tooltip-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.3);
    }

    .move-tooltip .move-name {
        font-size: 1rem;
        font-weight: 600;
        color: #3b82f6;
    }

    .move-tooltip .move-type {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        color: #fff;
    }

    .move-tooltip .move-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin-bottom: 10px;
    }

    .move-tooltip .stat {
        display: flex;
        justify-content: space-between;
        padding: 6px 8px;
        background: rgba(148, 163, 184, 0.1);
        border-radius: 4px;
        font-size: 0.8rem;
    }

    .move-tooltip .stat-label {
        color: #94a3b8;
    }

    .move-tooltip .stat-value {
        color: #f1f5f9;
        font-weight: 600;
    }

    .move-description {
        margin-bottom: 10px;
        line-height: 1.4;
    }

    .move-description p {
        margin: 0;
        color: #cbd5e1;
        font-size: 0.85rem;
    }

    .move-effect {
        margin-bottom: 10px;
        padding: 8px;
        background: rgba(245, 158, 11, 0.15);
        border-left: 3px solid #f59e0b;
        border-radius: 4px;
        font-size: 0.8rem;
        color: #fbbf24;
    }

    .educational-section {
        background: rgba(37, 99, 235, 0.15);
        border: 1px solid #2563eb;
        border-radius: 6px;
        padding: 10px;
        margin-top: 10px;
    }

    .education-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        color: #3b82f6;
        font-weight: 600;
        font-size: 0.9rem;
    }

    .education-icon {
        font-size: 1rem;
    }

    .educational-note {
        margin: 0;
        color: #e2e8f0;
        font-size: 0.8rem;
        line-height: 1.4;
    }

    .type-ensemble { background: #2563eb; }
    .type-neural { background: #1e40af; }
    .type-geometric { background: #1d4ed8; }
    .type-boosting { background: #3b82f6; }
    .type-probabilistic { background: #60a5fa; }
    .type-clustering { background: #93c5fd; }

    .move-tooltip::-webkit-scrollbar {
        width: 6px;
    }

    .move-tooltip::-webkit-scrollbar-track {
        background: rgba(148, 163, 184, 0.1);
        border-radius: 3px;
    }

    .move-tooltip::-webkit-scrollbar-thumb {
        background: #2563eb;
        border-radius: 3px;
    }

    .move-tooltip::-webkit-scrollbar-thumb:hover {
        background: #3b82f6;
    }

    @media (max-width: 768px) {
        .move-selection {
            min-height: 160px;
            padding: 6px;
        }

        .moves-grid {
            grid-template-columns: 1fr;
            gap: 6px;
            margin-bottom: 6px;
        }

        .move-button {
            min-height: 70px;
            padding: 6px 4px 8px;
        }

        .move-tooltip {
            max-width: 95vw;
            padding: 10px;
        }

        .move-tooltip .move-stats {
            grid-template-columns: 1fr;
            gap: 4px;
        }
    }

    @media (max-width: 480px) {
        .move-selection {
            padding: 4px;
        }

        .move-button {
            min-height: 65px;
            padding: 4px 3px 6px;
        }

        .move-name {
            font-size: 0.8rem;
        }

        .move-tooltip {
            padding: 8px;
        }
    }
</style>