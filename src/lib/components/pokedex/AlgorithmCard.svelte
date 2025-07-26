<!-- @file src/lib/components/pokedex/AlgorithmCard.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { getAlgorithmSprites } from '$lib/stores/theme';
    import { ALGORITHM_CONFIGS } from '$lib/ml/algorithms';
    import { getMovesByAlgorithm } from '$lib/data/moves';
    import { getTypeMatchups, ALGORITHM_TYPES } from '$lib/data/type-advantages';

    export let algorithmName: string;
    export let showBackButton: boolean = true;

    const dispatch = createEventDispatcher();

    $: config = ALGORITHM_CONFIGS[algorithmName];
    $: moves = getMovesByAlgorithm(algorithmName);
    $: algorithmType = ALGORITHM_TYPES[algorithmName];
    $: typeMatchups = getTypeMatchups(algorithmType);
    $: algorithmSprites = getAlgorithmSprites(algorithmName);

    // Tooltip state
    let showTooltip = false;
    let tooltipMove: any = null;
    let tooltipX = 0;
    let tooltipY = 0;

    // Icon mapping for algorithms
    function getAlgorithmIcon(name: string): string {
        const iconMap: Record<string, string> = {
            'Random Forest': '/icons/random-forest.png',
            'Neural Network': '/icons/neural-network.png',
            'Support Vector Machine': '/icons/support-vector-machine.png',
            'Gradient Boosting': '/icons/gradient-boost.png',
            'Naive Bayes': '/icons/naive-bayes.png',
            'K-Means Clustering': '/icons/clustering.png'
        };
        return iconMap[name] || '/icons/ai.png';
    }

    function handleMoveHover(event: MouseEvent, move: any) {
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

    function useInBattle() {
        dispatch('use-in-battle', { algorithmName });
    }

    function goBack() {
        dispatch('back');
    }
</script>

<div class="algorithm-card">
    {#if showBackButton}
        <button class="back-button" on:click={goBack}>
            ← Back to Database
        </button>
    {/if}

    <div class="card-header">
        <div class="algorithm-avatar">
            <div class="sprite-container">
                <img
                        src={algorithmSprites.front}
                        alt="{algorithmName} sprite"
                        class="algorithm-sprite"
                        on:error={() => console.warn(`Failed to load sprite for ${algorithmName}`)}
                />
            </div>
            <div class="algorithm-type type-{algorithmType}">{algorithmType.toUpperCase()}</div>
        </div>
        <div class="algorithm-info">
            <div class="name-with-icon">
                <img
                        src={getAlgorithmIcon(algorithmName)}
                        alt="{algorithmName} icon"
                        class="algorithm-icon"
                />
                <h2 class="algorithm-name">{config.name}</h2>
            </div>
            <div class="algorithm-id">#{String(Object.keys(ALGORITHM_CONFIGS).indexOf(algorithmName) + 1).padStart(3, '0')}</div>
        </div>
    </div>

    <div class="card-content">
        <!-- Base Stats -->
        <div class="stats-section">
            <h3>📊 Base Stats</h3>
            <div class="stats-grid">
                <div class="stat-bar">
                    <div class="stat-info">
                        <span class="stat-name">Attack</span>
                        <span class="stat-value">{config.baseStats.attack}</span>
                    </div>
                    <div class="stat-progress">
                        <div class="stat-fill" style="width: {config.baseStats.attack}%; background: #dc2626;"></div>
                    </div>
                </div>
                <div class="stat-bar">
                    <div class="stat-info">
                        <span class="stat-name">Defense</span>
                        <span class="stat-value">{config.baseStats.defense}</span>
                    </div>
                    <div class="stat-progress">
                        <div class="stat-fill" style="width: {config.baseStats.defense}%; background: #2563eb;"></div>
                    </div>
                </div>
                <div class="stat-bar">
                    <div class="stat-info">
                        <span class="stat-name">Speed</span>
                        <span class="stat-value">{config.baseStats.speed}</span>
                    </div>
                    <div class="stat-progress">
                        <div class="stat-fill" style="width: {config.baseStats.speed}%; background: #059669;"></div>
                    </div>
                </div>
                <div class="stat-bar">
                    <div class="stat-info">
                        <span class="stat-name">Accuracy</span>
                        <span class="stat-value">{config.baseStats.accuracy}</span>
                    </div>
                    <div class="stat-progress">
                        <div class="stat-fill" style="width: {config.baseStats.accuracy}%; background: #f59e0b;"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Moveset -->
        <div class="moves-section">
            <h3>⚔️ Signature Moves</h3>
            <div class="moves-grid">
                {#each moves as move}
                    <div
                            class="move-card"
                            on:mouseenter={(e) => handleMoveHover(e, move)}
                            on:mouseleave={handleMoveLeave}
                            role="button"
                            tabindex="0"
                    >
                        <div class="move-header">
                            <span class="move-name">{move.name}</span>
                            <span class="move-type type-{move.type}">{move.type}</span>
                        </div>
                        <div class="move-stats">
                            <span class="move-power">PWR: {move.power || '—'}</span>
                            <span class="move-accuracy">ACC: {move.accuracy}%</span>
                            <span class="move-pp">PP: {move.pp}</span>
                        </div>
                        <div class="move-category category-{move.category}">
                            {move.category === 'physical' ? '💪' : move.category === 'special' ? '✨' : '🛡️'}
                        </div>
                    </div>
                {/each}
            </div>
            <p class="moves-hint">💡 Hover over moves for detailed ML explanations!</p>
        </div>

        <!-- Type Effectiveness -->
        <div class="type-section">
            <h3>🎯 Type Effectiveness</h3>
            <div class="effectiveness-grid">
                {#if typeMatchups.strongAgainst.length > 0}
                    <div class="effectiveness-group">
                        <h4 class="effective-header super-effective">Super Effective Against:</h4>
                        {#each typeMatchups.strongAgainst as advantage}
                            <div class="effectiveness-item">
                                <span class="advantage-type type-{advantage.type}">{advantage.type}</span>
                                <span class="advantage-multiplier">×{advantage.multiplier}</span>
                                <span class="advantage-reason">{advantage.reason}</span>
                            </div>
                        {/each}
                    </div>
                {/if}

                {#if typeMatchups.weakAgainst.length > 0}
                    <div class="effectiveness-group">
                        <h4 class="effective-header not-effective">Not Very Effective Against:</h4>
                        {#each typeMatchups.weakAgainst as weakness}
                            <div class="effectiveness-item">
                                <span class="advantage-type type-{weakness.type}">{weakness.type}</span>
                                <span class="advantage-multiplier">×{weakness.multiplier}</span>
                                <span class="advantage-reason">{weakness.reason}</span>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Strengths & Weaknesses -->
        <div class="traits-section">
            <div class="strengths">
                <h4>✅ Strengths</h4>
                <ul>
                    {#each config.strengths as strength}
                        <li>{strength}</li>
                    {/each}
                </ul>
            </div>
            <div class="weaknesses">
                <h4>❌ Weaknesses</h4>
                <ul>
                    {#each config.weaknesses as weakness}
                        <li>{weakness}</li>
                    {/each}
                </ul>
            </div>
        </div>

        <!-- Special Move -->
        <div class="special-section">
            <h3>🌟 Ultimate Move</h3>
            <div class="special-move">
                <div class="special-name">{config.special}</div>
                <div class="special-description">
                    This algorithm's signature technique that defines its unique approach to machine learning problems.
                </div>
            </div>
        </div>

        <!-- Use in Battle Button -->
        <div class="battle-section">
            <button class="use-battle-button" on:click={useInBattle}>
                <img src="/icons/battle.png" alt="Battle" class="button-icon" />
                Use {config.name} in Battle!
            </button>
        </div>
    </div>
</div>

<!-- Simple Tooltip -->
{#if showTooltip && tooltipMove}
    <div
            class="simple-tooltip"
            style="left: {tooltipX}px; top: {tooltipY}px;"
            role="tooltip"
    >
        <div class="tooltip-header">
            <div class="move-name">{tooltipMove.name}</div>
            <div class="move-type type-{tooltipMove.type}">{tooltipMove.type.toUpperCase()}</div>
        </div>

        <div class="move-description">
            <p>{tooltipMove.description}</p>
        </div>

        {#if tooltipMove.educationalNote}
            <div class="educational-section">
                <div class="education-header">
                    <span class="education-icon">🎓</span>
                    <span>ML Explanation</span>
                </div>
                <p class="educational-note">{tooltipMove.educationalNote}</p>
            </div>
        {/if}

        <div class="tooltip-arrow"></div>
    </div>
{/if}

<style>
    .algorithm-card {
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
        border: 2px solid #2563eb;
        border-radius: 16px;
        padding: 24px;
        max-width: 800px;
        margin: 0 auto;
        color: #f1f5f9;
        font-family: 'Courier New', monospace;
        box-shadow: 0 8px 32px rgba(37, 99, 235, 0.3);
    }

    :global(.theme-dark) .algorithm-card {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        border-color: #3b82f6;
    }

    .back-button {
        background: rgba(71, 85, 105, 0.8);
        color: #e2e8f0;
        border: 2px solid #475569;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-family: inherit;
        margin-bottom: 20px;
        transition: all 0.3s ease;
        font-weight: 500;
    }

    .back-button:hover {
        background: #64748b;
        border-color: #64748b;
        transform: translateX(-2px);
    }

    .card-header {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid rgba(148, 163, 184, 0.3);
    }

    .algorithm-avatar {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .sprite-container {
        width: 100px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%);
        border: 3px solid #2563eb;
        border-radius: 50%;
    }

    .algorithm-sprite {
        width: 80px;
        height: 80px;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.4));
    }

    .algorithm-type {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #fff;
    }

    .algorithm-info {
        flex: 1;
    }

    .name-with-icon {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 8px;
    }

    .algorithm-icon {
        width: 40px;
        height: 40px;
        filter: drop-shadow(0 0 10px rgba(37, 99, 235, 0.5));
    }

    .algorithm-name {
        font-size: 2.2rem;
        margin: 0;
        color: #2563eb;
        text-shadow: 0 0 10px rgba(37, 99, 235, 0.3);
        font-weight: 600;
    }

    .algorithm-id {
        font-size: 1.2rem;
        color: #94a3b8;
        font-weight: 600;
    }

    .card-content {
        display: flex;
        flex-direction: column;
        gap: 25px;
    }

    .stats-section h3,
    .moves-section h3,
    .type-section h3,
    .special-section h3 {
        color: #3b82f6;
        margin: 0 0 15px 0;
        font-size: 1.3rem;
    }

    /* Stats */
    .stats-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .stat-bar {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .stat-info {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
    }

    .stat-name {
        color: #cbd5e1;
    }

    .stat-value {
        color: #f1f5f9;
        font-weight: 600;
    }

    .stat-progress {
        height: 8px;
        background: rgba(148, 163, 184, 0.3);
        border-radius: 4px;
        overflow: hidden;
    }

    .stat-fill {
        height: 100%;
        transition: width 0.5s ease;
        border-radius: 4px;
    }

    /* Moves */
    .moves-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 12px;
    }

    .move-card {
        background: rgba(148, 163, 184, 0.1);
        border: 1px solid rgba(148, 163, 184, 0.3);
        border-radius: 8px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
    }

    .move-card:hover {
        border-color: #2563eb;
        background: rgba(37, 99, 235, 0.15);
        transform: translateY(-2px);
    }

    .move-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .move-name {
        font-weight: 600;
        color: #f1f5f9;
        font-size: 0.95rem;
    }

    .move-stats {
        display: flex;
        gap: 12px;
        font-size: 0.8rem;
        color: #cbd5e1;
    }

    .move-category {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 0.8rem;
    }

    .moves-hint {
        text-align: center;
        color: #94a3b8;
        font-style: italic;
        margin-top: 10px;
        font-size: 0.9rem;
    }

    /* Type effectiveness */
    .effectiveness-grid {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .effectiveness-group {
        background: rgba(148, 163, 184, 0.05);
        border-radius: 8px;
        padding: 15px;
    }

    .effective-header {
        margin: 0 0 10px 0;
        font-size: 1rem;
    }

    .super-effective {
        color: #22c55e;
    }

    .not-effective {
        color: #dc2626;
    }

    .effectiveness-item {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        padding: 8px;
        background: rgba(148, 163, 184, 0.05);
        border-radius: 6px;
    }

    .advantage-type {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        min-width: 80px;
        text-align: center;
    }

    .advantage-multiplier {
        font-weight: 600;
        color: #3b82f6;
        min-width: 30px;
    }

    .advantage-reason {
        color: #cbd5e1;
        font-size: 0.85rem;
        flex: 1;
    }

    /* Traits */
    .traits-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .strengths,
    .weaknesses {
        background: rgba(148, 163, 184, 0.05);
        border-radius: 8px;
        padding: 15px;
    }

    .strengths h4 {
        color: #22c55e;
        margin: 0 0 10px 0;
    }

    .weaknesses h4 {
        color: #dc2626;
        margin: 0 0 10px 0;
    }

    .strengths ul,
    .weaknesses ul {
        margin: 0;
        padding-left: 20px;
    }

    .strengths li,
    .weaknesses li {
        margin-bottom: 5px;
        color: #cbd5e1;
        font-size: 0.9rem;
    }

    /* Special move */
    .special-move {
        background: linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1));
        border: 1px solid #3b82f6;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
    }

    .special-name {
        font-size: 1.5rem;
        font-weight: 600;
        color: #60a5fa;
        margin-bottom: 10px;
        text-shadow: 0 0 10px rgba(96, 165, 250, 0.3);
    }

    .special-description {
        color: #cbd5e1;
        font-style: italic;
    }

    /* Battle button */
    .battle-section {
        text-align: center;
    }

    .use-battle-button {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
        border: none;
        padding: 16px 32px;
        border-radius: 12px;
        font-size: 1.2rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: inherit;
        display: flex;
        align-items: center;
        gap: 10px;
        justify-content: center;
        margin: 0 auto;
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
    }

    .use-battle-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
    }

    .button-icon {
        width: 20px;
        height: 20px;
    }

    /* Simple tooltip styles */
    .simple-tooltip {
        position: fixed;
        z-index: 1000;
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
        border: 2px solid #2563eb;
        border-radius: 12px;
        padding: 16px;
        max-width: 320px;
        box-shadow: 0 8px 32px rgba(37, 99, 235, 0.5);
        color: #f1f5f9;
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

    .simple-tooltip .tooltip-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.3);
    }

    .simple-tooltip .move-name {
        font-size: 1.1rem;
        font-weight: 600;
        color: #2563eb;
    }

    .simple-tooltip .move-type {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #fff;
    }

    .simple-tooltip .move-description {
        margin-bottom: 12px;
        line-height: 1.4;
    }

    .simple-tooltip .move-description p {
        margin: 0;
        color: #cbd5e1;
        font-size: 0.95rem;
    }

    .simple-tooltip .educational-section {
        background: rgba(37, 99, 235, 0.15);
        border: 1px solid #2563eb;
        border-radius: 8px;
        padding: 12px;
        margin-top: 12px;
    }

    .simple-tooltip .education-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        color: #2563eb;
        font-weight: 600;
        font-size: 0.9rem;
    }

    .simple-tooltip .education-icon {
        font-size: 1rem;
    }

    .simple-tooltip .educational-note {
        margin: 0;
        color: #e2e8f0;
        font-size: 0.9rem;
        line-height: 1.4;
    }

    .simple-tooltip .tooltip-arrow {
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid #2563eb;
    }

    /* Type colors */
    .type-ensemble { background: #2563eb; }
    .type-neural { background: #1e40af; }
    .type-geometric { background: #1d4ed8; }
    .type-boosting { background: #3b82f6; }
    .type-probabilistic { background: #60a5fa; }
    .type-clustering { background: #93c5fd; }

    /* Responsive */
    @media (max-width: 768px) {
        .algorithm-card {
            padding: 16px;
        }

        .card-header {
            flex-direction: column;
            text-align: center;
        }

        .traits-section {
            grid-template-columns: 1fr;
        }

        .moves-grid {
            grid-template-columns: 1fr;
        }

        .algorithm-name {
            font-size: 1.8rem;
        }

        .name-with-icon {
            justify-content: center;
        }

        .simple-tooltip {
            max-width: 280px;
            padding: 12px;
        }
    }
</style>