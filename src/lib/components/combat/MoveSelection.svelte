<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Move } from '$lib/data/moves';
    import type { Fighter } from '$lib/ml/algorithms';
    import { getTypeMultiplier, ALGORITHM_TYPES } from '$lib/data/type-advantages';
    import { playAudio } from '$lib/stores/audioPlayer';

    export let playerFighter: Fighter;
    export let opponentFighter: Fighter;
    export let availableMoves: Move[];
    export let ppCounters: Record<string, number>;
    export let isPlayerTurn: boolean;
    export let disabled: boolean = false;

    const dispatch = createEventDispatcher();

    let showTooltip = false;
    let tooltipMove: Move | null = null;
    let tooltipX = 0;
    let tooltipY = 0;

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

        dispatch('move-selected', { move });
    }

    function handleMoveHover(event: MouseEvent, move: Move) {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        tooltipMove = move;
        tooltipX = rect.left + rect.width / 2;
        tooltipY = rect.top - 10;
        showTooltip = true;
    }

    function handleMoveLeave() {
        showTooltip = false;
        tooltipMove = null;
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
</script>

<div class="move-selection" class:disabled>
    <div class="selection-header">
        <h3>
            {#if isPlayerTurn}
                🎯 Choose your move!
            {:else}
                ⏳ Opponent is thinking...
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
                    on:click={() => {
                        handleMoveSelect(move)
                        playAudio(`/audio/button.mp3`)
                        }}
                    on:mouseenter={(e) => handleMoveHover(e, move)}
                    on:mouseleave={handleMoveLeave}
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
                <span class="tip-text">Hover over moves for detailed ML explanations!</span>
            </div>
        {/if}
    </div>
</div>

{#if showTooltip && tooltipMove}
    <div
            class="move-tooltip"
            style="left: {tooltipX}px; top: {tooltipY}px;"
            role="tooltip"
    >
        <div class="tooltip-header">
            <div class="move-name">{tooltipMove.name}</div>
            <div class="move-type type-{tooltipMove.type}">{tooltipMove.type.toUpperCase()}</div>
        </div>

        <div class="move-stats">
            <div class="stat">
                <span class="stat-label">Power</span>
                <span class="stat-value">{tooltipMove.power || '—'}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Accuracy</span>
                <span class="stat-value">{tooltipMove.accuracy}%</span>
            </div>
            <div class="stat">
                <span class="stat-label">PP</span>
                <span class="stat-value">{tooltipMove.pp}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Category</span>
                <span class="stat-value">
                    {tooltipMove.category === 'physical' ? '💪' : tooltipMove.category === 'special' ? '✨' : '🛡️'}
                    {tooltipMove.category.toUpperCase()}
                </span>
            </div>
        </div>

        <div class="move-description">
            <p>{tooltipMove.description}</p>
        </div>

        {#if tooltipMove.effect}
            <div class="move-effect">
                <strong>Effect:</strong> {tooltipMove.effect}
            </div>
        {/if}

        <div class="educational-section">
            <div class="education-header">
                <span class="education-icon">🎓</span>
                <span>Machine Learning Explanation</span>
            </div>
            <p class="educational-note">{tooltipMove.educationalNote}</p>
        </div>

        <div class="tooltip-arrow"></div>
    </div>
{/if}

<style>
    .move-selection {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.95);
        border-top: 3px solid #4ecdc4;
        padding: 12px 15px 15px;
        transition: all 0.3s ease;
        z-index: 20;
        height: 280px;
        overflow: visible;
    }

    .move-selection.disabled {
        opacity: 0.7;
        pointer-events: none;
    }

    .selection-header {
        text-align: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #333;
    }

    .selection-header h3 {
        margin: 0 0 8px 0;
        color: #4ecdc4;
        font-size: 1.2rem;
    }

    .ai-thinking {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: #999;
    }

    .thinking-dots {
        display: flex;
        gap: 4px;
    }

    .thinking-dots span {
        width: 8px;
        height: 8px;
        background: #4ecdc4;
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
        font-size: 0.85rem;
        font-style: italic;
    }

    .moves-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 15px;
    }

    .move-button {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid #333;
        border-radius: 8px;
        padding: 8px;
        color: #fff;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        text-align: left;
        height: 85px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .move-button {
        height: auto; /* Allow dynamic height */
        min-height: 100px; /* Taller minimum height for better breathing room */
        padding: 12px 10px 16px; /* Top, horizontal, bottom padding — bottom is larger */
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .move-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px; /* add this line */
}

.effectiveness-indicator {
    position: absolute;
    bottom: 4px;     /* was 6px before */
    right: 6px;
    padding: 3px 6px;
    border-radius: 4px;
    font-size: 0.6rem;
    font-weight: bold;
    z-index: 5;
}

    .move-button.can-use:hover {
        border-color: #4ecdc4;
        background: rgba(78, 205, 196, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(78, 205, 196, 0.2);
    }

    .move-button.no-pp {
        border-color: #666;
        background: rgba(255, 255, 255, 0.02);
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
        font-weight: bold;
        font-size: 0.85rem;
        color: #fff;
        line-height: 1.1;
        flex: 1;
        margin-right: 6px;
    }

    .move-type {
        padding: 1px 5px;
        border-radius: 8px;
        font-size: 0.6rem;
        font-weight: bold;
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
        font-size: 0.6rem;
        color: #999;
        text-transform: uppercase;
    }

    .stat-value {
        font-size: 0.75rem;
        font-weight: bold;
        color: #fff;
    }

    .move-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .move-category {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .category-icon {
        font-size: 0.8rem;
    }

    .category-text {
        font-size: 0.7rem;
        color: #ccc;
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
        color: #999;
        text-transform: uppercase;
    }

    .pp-value {
        font-size: 0.75rem;
        font-weight: bold;
    }

    .pp-value.pp-empty {
        color: #ef4444;
        font-weight: bold;
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

    .effectiveness-indicator {
        position: absolute;
        bottom: 6px;
        right: 6px;
        padding: 2px 5px;
        border-radius: 3px;
        font-size: 0.6rem;
        font-weight: bold;
    }

    .effectiveness-indicator.super-effective {
        background: #22c55e;
        color: #fff;
    }

    .effectiveness-indicator.not-effective {
        background: #ef4444;
        color: #fff;
    }

    .effectiveness-indicator.normal {
        background: #6b7280;
        color: #fff;
    }

    .pp-warning {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(239, 68, 68, 0.9);
        color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: bold;
        z-index: 10;
    }

    .selection-footer {
        text-align: center;
        padding-top: 10px;
        border-top: 1px solid #333;
    }

    .turn-info {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: #999;
        font-size: 0.8rem;
    }

    .tip-icon {
        font-size: 0.9rem;
    }

    .tip-text {
        font-style: italic;
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

    .move-tooltip .tooltip-header {
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

    .move-tooltip .move-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 12px;
    }

    .move-tooltip .stat {
        display: flex;
        justify-content: space-between;
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        font-size: 0.9rem;
    }

    .move-tooltip .stat-label {
        color: #999;
    }

    .move-tooltip .stat-value {
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

    @media (max-width: 768px) {
        .move-selection {
            padding: 12px 15px 15px;
            max-height: 40vh;
        }

        .moves-grid {
            grid-template-columns: 1fr;
            gap: 10px;
        }

        .move-button {
            height: 90px;
            padding: 10px;
        }

        .selection-header h3 {
            font-size: 1.1rem;
        }

        .move-name {
            font-size: 0.9rem;
        }

        .thinking-text {
            font-size: 0.8rem;
        }

        .move-tooltip {
            max-width: 280px;
            padding: 12px;
        }

        .move-tooltip .move-stats {
            grid-template-columns: 1fr;
            gap: 4px;
        }

        .move-tooltip .tooltip-header {
            flex-direction: column;
            gap: 8px;
            text-align: center;
        }
    }

    @media (max-height: 600px) {
        .move-selection {
            max-height: 50vh;
        }
    }

    .move-selection {
    height: 280px;
    overflow-y: auto; /* scrolls if content overflows */
    overflow-x: hidden;
}
</style>