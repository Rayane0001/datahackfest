<!-- @file src/lib/components/pokedex/Pokedex.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { ALGORITHM_CONFIGS } from '$lib/ml/algorithms';
    import { ALGORITHM_TYPES } from '$lib/data/type-advantages';
    import AlgorithmCard from './AlgorithmCard.svelte';

    const dispatch = createEventDispatcher();

    // Component state
    let selectedAlgorithm: string | null = null;
    let searchTerm = '';
    let selectedTypeFilter = 'all';

    // Algorithm data with emojis and types
    const algorithms = Object.keys(ALGORITHM_CONFIGS).map(name => ({
        name,
        config: ALGORITHM_CONFIGS[name],
        type: ALGORITHM_TYPES[name],
        emoji: getAlgorithmEmoji(name),
        id: Object.keys(ALGORITHM_CONFIGS).indexOf(name) + 1
    }));

    // Type filter options
    const typeFilters = [
        { value: 'all', label: 'All Types', color: '#6b7280' },
        { value: 'ensemble', label: 'Ensemble', color: '#22c55e' },
        { value: 'neural', label: 'Neural', color: '#3b82f6' },
        { value: 'geometric', label: 'Geometric', color: '#ef4444' },
        { value: 'boosting', label: 'Boosting', color: '#f59e0b' },
        { value: 'probabilistic', label: 'Probabilistic', color: '#ec4899' },
        { value: 'clustering', label: 'Clustering', color: '#8b5cf6' }
    ];

    // Filtered algorithms based on search and type
    $: filteredAlgorithms = algorithms.filter(algo => {
        const matchesSearch = algo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            algo.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedTypeFilter === 'all' || algo.type === selectedTypeFilter;
        return matchesSearch && matchesType;
    });

    function getAlgorithmEmoji(name: string): string {
        const emojis: Record<string, string> = {
            'Random Forest': '🌳',
            'Neural Network': '🧠',
            'Support Vector Machine': '⚔️',
            'Gradient Boosting': '⚡',
            'Naive Bayes': '🎯',
            'K-Means Clustering': '🎲'
        };
        return emojis[name] || '🤖';
    }

    function selectAlgorithm(algorithmName: string) {
        selectedAlgorithm = algorithmName;
    }

    function goBackToGrid() {
        selectedAlgorithm = null;
    }

    function useInBattle(event: CustomEvent) {
        dispatch('use-in-battle', event.detail);
        close();
    }

    function close() {
        dispatch('close');
    }

    function clearSearch() {
        searchTerm = '';
    }
</script>

<div class="pokedex-overlay" on:click={close} role="button" tabindex="0">
    <div class="pokedex-container" on:click|stopPropagation role="dialog">
        {#if selectedAlgorithm}
            <!-- Detailed Algorithm Card -->
            <AlgorithmCard
                    algorithmName={selectedAlgorithm}
                    on:back={goBackToGrid}
                    on:use-in-battle={useInBattle}
            />
        {:else}
            <!-- Main Pokedex Grid -->
            <div class="pokedex-header">
                <div class="header-top">
                    <h1 class="pokedex-title">🔬 ML Algorithm Pokedex</h1>
                    <button class="close-button" on:click={close}>✕</button>
                </div>
                <p class="pokedex-subtitle">
                    Discover the strengths, weaknesses, and signature moves of each machine learning algorithm
                </p>
            </div>

            <!-- Search and Filters -->
            <div class="controls-section">
                <div class="search-container">
                    <div class="search-input-wrapper">
                        <span class="search-icon">🔍</span>
                        <input
                                type="text"
                                placeholder="Search algorithms..."
                                bind:value={searchTerm}
                                class="search-input"
                        />
                        {#if searchTerm}
                            <button class="clear-search" on:click={clearSearch}>✕</button>
                        {/if}
                    </div>
                </div>

                <div class="type-filters">
                    {#each typeFilters as filter}
                        <button
                                class="type-filter"
                                class:active={selectedTypeFilter === filter.value}
                                style="--filter-color: {filter.color}"
                                on:click={() => selectedTypeFilter = filter.value}
                        >
                            {filter.label}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Results Summary -->
            <div class="results-summary">
				<span class="results-count">
					{filteredAlgorithms.length} algorithm{filteredAlgorithms.length !== 1 ? 's' : ''} found
				</span>
                {#if searchTerm || selectedTypeFilter !== 'all'}
                    <button class="clear-filters" on:click={() => { searchTerm = ''; selectedTypeFilter = 'all'; }}>
                        Clear filters
                    </button>
                {/if}
            </div>

            <!-- Algorithm Grid -->
            <div class="algorithms-grid">
                {#each filteredAlgorithms as algorithm}
                    <div class="algorithm-entry" on:click={() => selectAlgorithm(algorithm.name)} role="button" tabindex="0">
                        <div class="entry-header">
                            <div class="algorithm-emoji">{algorithm.emoji}</div>
                            <div class="entry-id">#{String(algorithm.id).padStart(3, '0')}</div>
                        </div>

                        <div class="entry-info">
                            <h3 class="entry-name">{algorithm.name}</h3>
                            <div class="entry-type type-{algorithm.type}">{algorithm.type}</div>
                        </div>

                        <div class="entry-stats">
                            <div class="mini-stat">
                                <span class="mini-stat-label">ATK</span>
                                <span class="mini-stat-value">{algorithm.config.baseStats.attack}</span>
                            </div>
                            <div class="mini-stat">
                                <span class="mini-stat-label">DEF</span>
                                <span class="mini-stat-value">{algorithm.config.baseStats.defense}</span>
                            </div>
                            <div class="mini-stat">
                                <span class="mini-stat-label">SPD</span>
                                <span class="mini-stat-value">{algorithm.config.baseStats.speed}</span>
                            </div>
                        </div>

                        <div class="entry-preview">
                            <div class="strength-preview">
                                <strong>Strength:</strong> {algorithm.config.strengths[0]}
                            </div>
                            <div class="special-preview">
                                <strong>Special:</strong> {algorithm.config.special}
                            </div>
                        </div>

                        <div class="entry-footer">
                            <span class="entry-hint">Click to view details →</span>
                        </div>
                    </div>
                {/each}

                {#if filteredAlgorithms.length === 0}
                    <div class="no-results">
                        <div class="no-results-icon">🔍</div>
                        <h3>No algorithms found</h3>
                        <p>Try adjusting your search terms or filters</p>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .pokedex-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 20px;
        backdrop-filter: blur(5px);
    }

    .pokedex-container {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 3px solid #4ecdc4;
        border-radius: 20px;
        width: 100%;
        max-width: 1200px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 30px;
        color: #fff;
        font-family: 'Courier New', monospace;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .pokedex-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #333;
    }

    .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .pokedex-title {
        font-size: 2.5rem;
        margin: 0;
        background: linear-gradient(45deg, #4ecdc4, #45b7d1, #f39c12);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 20px rgba(78, 205, 196, 0.3);
    }

    .close-button {
        background: #ef4444;
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 1.2rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .close-button:hover {
        background: #dc2626;
        transform: scale(1.1);
    }

    .pokedex-subtitle {
        color: #ccc;
        margin: 0;
        font-size: 1.1rem;
    }

    /* Controls */
    .controls-section {
        margin-bottom: 25px;
    }

    .search-container {
        margin-bottom: 20px;
    }

    .search-input-wrapper {
        position: relative;
        max-width: 400px;
        margin: 0 auto;
    }

    .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.1rem;
        color: #999;
    }

    .search-input {
        width: 100%;
        padding: 12px 40px 12px 40px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid #333;
        border-radius: 25px;
        color: #fff;
        font-family: inherit;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    .search-input:focus {
        outline: none;
        border-color: #4ecdc4;
        box-shadow: 0 0 10px rgba(78, 205, 196, 0.3);
    }

    .clear-search {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        font-size: 1rem;
        padding: 4px;
    }

    .clear-search:hover {
        color: #fff;
    }

    .type-filters {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
    }

    .type-filter {
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid var(--filter-color, #333);
        border-radius: 20px;
        color: #fff;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
    }

    .type-filter:hover {
        background: var(--filter-color);
        transform: translateY(-2px);
    }

    .type-filter.active {
        background: var(--filter-color);
        color: #fff;
        font-weight: bold;
    }

    /* Results */
    .results-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 10px 0;
        border-bottom: 1px solid #333;
    }

    .results-count {
        color: #ccc;
        font-size: 0.9rem;
    }

    .clear-filters {
        background: none;
        border: 1px solid #666;
        color: #ccc;
        padding: 4px 12px;
        border-radius: 12px;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.8rem;
        transition: all 0.3s ease;
    }

    .clear-filters:hover {
        border-color: #4ecdc4;
        color: #4ecdc4;
    }

    /* Algorithm Grid */
    .algorithms-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;
    }

    .algorithm-entry {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid #333;
        border-radius: 16px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .algorithm-entry:hover {
        border-color: #4ecdc4;
        background: rgba(78, 205, 196, 0.1);
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(78, 205, 196, 0.2);
    }

    .entry-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    .algorithm-emoji {
        font-size: 3rem;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }

    .entry-id {
        font-size: 1.2rem;
        color: #999;
        font-weight: bold;
    }

    .entry-info {
        margin-bottom: 15px;
    }

    .entry-name {
        font-size: 1.3rem;
        margin: 0 0 8px 0;
        color: #4ecdc4;
    }

    .entry-type {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: bold;
        color: #fff;
        text-transform: uppercase;
    }

    .entry-stats {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
    }

    .mini-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    }

    .mini-stat-label {
        font-size: 0.7rem;
        color: #999;
        text-transform: uppercase;
    }

    .mini-stat-value {
        font-size: 1.1rem;
        font-weight: bold;
        color: #fff;
    }

    .entry-preview {
        margin-bottom: 15px;
        font-size: 0.85rem;
        line-height: 1.4;
    }

    .strength-preview {
        color: #22c55e;
        margin-bottom: 5px;
    }

    .special-preview {
        color: #f59e0b;
    }

    .entry-footer {
        text-align: center;
        padding-top: 10px;
        border-top: 1px solid #333;
    }

    .entry-hint {
        color: #999;
        font-size: 0.8rem;
        font-style: italic;
    }

    /* No results */
    .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #666;
    }

    .no-results-icon {
        font-size: 4rem;
        margin-bottom: 20px;
        opacity: 0.5;
    }

    .no-results h3 {
        margin: 0 0 10px 0;
        color: #999;
    }

    .no-results p {
        margin: 0;
        color: #666;
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
        .pokedex-container {
            padding: 20px;
        }

        .pokedex-title {
            font-size: 2rem;
        }

        .header-top {
            flex-direction: column;
            gap: 15px;
        }

        .algorithms-grid {
            grid-template-columns: 1fr;
        }

        .type-filters {
            gap: 8px;
        }

        .type-filter {
            padding: 6px 12px;
            font-size: 0.8rem;
        }

        .results-summary {
            flex-direction: column;
            gap: 10px;
        }
    }

    /* Scrollbar styling */
    .pokedex-container::-webkit-scrollbar {
        width: 8px;
    }

    .pokedex-container::-webkit-scrollbar-track {
        background: #1a1a2e;
    }

    .pokedex-container::-webkit-scrollbar-thumb {
        background: #4ecdc4;
        border-radius: 4px;
    }

    .pokedex-container::-webkit-scrollbar-thumb:hover {
        background: #45b7d1;
    }
</style>