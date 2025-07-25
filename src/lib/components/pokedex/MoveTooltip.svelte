<!-- @file src/lib/components/pokedex/MoveTooltip.svelte -->
<script lang="ts">
    import type { Move } from '$lib/data/moves';

    export let move: Move;
    export let show: boolean = false;
    export let x: number = 0;
    export let y: number = 0;
</script>

{#if show && move}
    <div
            class="move-tooltip"
            style="left: {x}px; top: {y}px;"
            role="tooltip"
    >
        <div class="tooltip-header">
            <div class="move-name">{move.name}</div>
            <div class="move-type type-{move.type}">{move.type.toUpperCase()}</div>
        </div>

        <div class="move-stats">
            <div class="stat">
                <span class="stat-label">Power</span>
                <span class="stat-value">{move.power || '—'}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Accuracy</span>
                <span class="stat-value">{move.accuracy}%</span>
            </div>
            <div class="stat">
                <span class="stat-label">PP</span>
                <span class="stat-value">{move.pp}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Category</span>
                <span class="stat-value category-{move.category}">
					{move.category === 'physical' ? '💪' : move.category === 'special' ? '✨' : '🛡️'}
                    {move.category.toUpperCase()}
				</span>
            </div>
        </div>

        <div class="move-description">
            <p>{move.description}</p>
        </div>

        {#if move.effect}
            <div class="move-effect">
                <strong>Effect:</strong> {move.effect}
            </div>
        {/if}

        <div class="educational-section">
            <div class="education-header">
                <span class="education-icon">🎓</span>
                <span>Machine Learning Explanation</span>
            </div>
            <p class="educational-note">{move.educationalNote}</p>
        </div>

        <div class="tooltip-arrow"></div>
    </div>
{/if}

<style>
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
    }

    .tooltip-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #333;
    }

    .move-name {
        font-size: 1.1rem;
        font-weight: bold;
        color: #4ecdc4;
    }

    .move-type {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
        color: #fff;
    }

    .type-ensemble { background: #22c55e; }
    .type-neural { background: #3b82f6; }
    .type-geometric { background: #ef4444; }
    .type-boosting { background: #f59e0b; }
    .type-probabilistic { background: #ec4899; }
    .type-clustering { background: #8b5cf6; }

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

    .category-physical { color: #ef4444; }
    .category-special { color: #8b5cf6; }
    .category-status { color: #6b7280; }

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

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .move-tooltip {
            max-width: 280px;
            padding: 12px;
        }

        .move-stats {
            grid-template-columns: 1fr;
            gap: 4px;
        }

        .tooltip-header {
            flex-direction: column;
            gap: 8px;
            text-align: center;
        }
    }
</style>