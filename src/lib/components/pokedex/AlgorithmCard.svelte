<!-- @file src/lib/components/pokedex/AlgorithmCard.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { ALGORITHM_CONFIGS } from '$lib/ml/algorithms';
    import { getMovesByAlgorithm } from '$lib/data/moves';
    import { getTypeMatchups, ALGORITHM_TYPES } from '$lib/data/type-advantages';
    import MoveTooltip from './MoveTooltip.svelte';

    export let algorithmName: string;
    export let showBackButton: boolean = true;

    const dispatch = createEventDispatcher();

    $: config = ALGORITHM_CONFIGS[algorithmName];
    $: moves = getMovesByAlgorithm(algorithmName);
    $: algorithmType = ALGORITHM_TYPES[algorithmName];
    $: typeMatchups = getTypeMatchups(algorithmType);

    // Tooltip state
    let showTooltip = false;
    let tooltipMove: any = null;
    let tooltipX = 0;
    let tooltipY = 0;

    // Emoji mapping for algorithms
    const algorithmEmojis: Record<string, string> = {
        'Random Forest': '🌳',
        'Neural Network': '🧠',
        'Support Vector Machine': '⚔️',
        'Gradient Boosting': '⚡',
        'Naive Bayes': '🎯',
        'K-Means Clustering': '🎲'
    };

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
            ← Back to Pokedex
        </button>
    {/if}

    <div class="card-header">
        <div class="algorithm-avatar">
            <div class="avatar-emoji">{algorithmEmojis[algorithmName]}</div>
            <div class="algorithm-type type-{algorithmType}">{algorithmType.toUpperCase()}</div>
        </div>
        <div class="algorithm-info">
            <h2 class="algorithm-name">{config.name}</h2>
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
                        <div class="stat-fill" style="width: {config.baseStats.attack}%; background: #ef4444;"></div>
                    </div>
                </div>
                <div class="stat-bar">
                    <div class="stat-info">
                        <span class="stat-name">Defense</span>
                        <span class="stat-value">{config.baseStats.defense}</span>
                    </div>
                    <div class="stat-progress">
                        <div class="stat-fill" style="width: {config.baseStats.defense}%; background: #3b82f6;"></div>
                    </div>
                </div>
                <div class="stat-bar">
                    <div class="stat-info">
                        <span class="stat-name">Speed</span>
                        <span class="stat-value">{config.baseStats.speed}</span>
                    </div>
                    <div class="stat-progress">
                        <div class="stat-fill" style="width: {config.baseStats.speed}%; background: #22c55e;"></div>
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
                ⚔️ Use {config.name} in Battle!
            </button>
        </div>
    </div>
</div>

<!-- Tooltip -->
<MoveTooltip
        {tooltipMove}
        show={showTooltip}
        x={tooltipX}
        y={tooltipY}
        move={tooltipMove}
/>

<style>
    .algorithm-card {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #4ecdc4;
        border-radius: 16px;
        padding: 24px;
        max-width: 800px;
        margin: 0 auto;
        color: #fff;
        font-family: 'Courier New', monospace;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .back-button {
        background: #333;
        color: #ccc;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-family: inherit;
        margin-bottom: 20px;
        transition: all 0.3s ease;
    }

    .back-button:hover {
        background: #444;
        transform: translateX(-2px);
    }

    .card-header {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #333;
    }

    .algorithm-avatar {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .avatar-emoji {
        font-size: 4rem;
        width: 100px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(78, 205, 196, 0.1);
        border: 3px solid #4ecdc4;
        border-radius: 50%;
    }

    .algorithm-type {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.8rem;
        font-weight: bold;
        color: #fff;
    }

    .algorithm-info {
        flex: 1;
    }

    .algorithm-name {
        font-size: 2.2rem;
        margin: 0 0 8px 0;
        color: #4ecdc4;
        text-shadow: 0 0 10px rgba(78, 205, 196, 0.3);
    }

    .algorithm-id {
        font-size: 1.2rem;
        color: #999;
        font-weight: bold;
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
        color: #f59e0b;
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
        color: #ccc;
    }

    .stat-value {
        color: #fff;
        font-weight: bold;
    }

    .stat-progress {
        height: 8px;
        background: #333;
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
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid #333;
        border-radius: 8px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
    }

    .move-card:hover {
        border-color: #4ecdc4;
        background: rgba(78, 205, 196, 0.1);
        transform: translateY(-2px);
    }

    .move-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .move-name {
        font-weight: bold;
        color: #fff;
        font-size: 0.95rem;
    }

    .move-stats {
        display: flex;
        gap: 12px;
        font-size: 0.8rem;
        color: #ccc;
    }

    .move-category {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 0.8rem;
    }

    .moves-hint {
        text-align: center;
        color: #999;
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
        background: rgba(255, 255, 255, 0.03);
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
        color: #ef4444;
    }

    .effectiveness-item {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        padding: 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
    }

    .advantage-type {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: bold;
        min-width: 80px;
        text-align: center;
    }

    .advantage-multiplier {
        font-weight: bold;
        color: #f59e0b;
        min-width: 30px;
    }

    .advantage-reason {
        color: #ccc;
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
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
        padding: 15px;
    }

    .strengths h4 {
        color: #22c55e;
        margin: 0 0 10px 0;
    }

    .weaknesses h4 {
        color: #ef4444;
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
        color: #ccc;
        font-size: 0.9rem;
    }

    /* Special move */
    .special-move {
        background: linear-gradient(45deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.1));
        border: 1px solid #f59e0b;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
    }

    .special-name {
        font-size: 1.5rem;
        font-weight: bold;
        color: #fbbf24;
        margin-bottom: 10px;
        text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
    }

    .special-description {
        color: #ccc;
        font-style: italic;
    }

    /* Battle button */
    .battle-section {
        text-align: center;
    }

    .use-battle-button {
        background: linear-gradient(45deg, #ff6b6b, #ff8e53);
        color: white;
        border: none;
        padding: 16px 32px;
        border-radius: 12px;
        font-size: 1.2rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: inherit;
    }

    .use-battle-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
    }

    /* Type colors */
    .type-ensemble { background: #22c55e; }
    .type-neural { background: #3b82f6; }
    .type-geometric { background: #ef4444; }
    .type-boosting { background: #f59e0b; }
    .type-probabilistic { background: #ec4899; }
    .type-clustering { background: #8b5cf6; }

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
    }
</style>