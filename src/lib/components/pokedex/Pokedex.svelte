<!-- @file src/lib/components/pokedex/Pokedex.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { getAlgorithmSprites } from '$lib/stores/theme';
    import { ALGORITHM_CONFIGS } from '$lib/ml/algorithms';
    import AlgorithmCard from './AlgorithmCard.svelte';

    const dispatch = createEventDispatcher();

    // Component state
    let selectedAlgorithm: string | null = null;
    let searchTerm = '';
    let selectedTypeFilter = 'all';

    // Algorithm data with sprites and icons - using correct type mapping
    const algorithms = Object.keys(ALGORITHM_CONFIGS).map(name => {
        const config = ALGORITHM_CONFIGS[name];
        return {
            name,
            config,
            type: config.type, // Use the type from ALGORITHM_CONFIGS
            sprite: getAlgorithmSprites(name).front,
            icon: getAlgorithmIcon(name),
            id: Object.keys(ALGORITHM_CONFIGS).indexOf(name) + 1
        };
    });

    // Type filter options - updated to match the new types
    const typeFilters = [
        { value: 'all', label: 'All Types', color: '#64748b' },
        { value: 'forest', label: 'Forest', color: '#22c55e' },
        { value: 'neural', label: 'Neural', color: '#3b82f6' },
        { value: 'svm', label: 'SVM', color: '#ef4444' },
        { value: 'gradient', label: 'Gradient', color: '#f59e0b' },
        { value: 'bayes', label: 'Bayes', color: '#ec4899' },
        { value: 'kmeans', label: 'K-Means', color: '#8b5cf6' }
    ];

    // Filtered algorithms based on search and type
    $: filteredAlgorithms = algorithms.filter(algo => {
        const matchesSearch = algo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            algo.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedTypeFilter === 'all' || algo.type === selectedTypeFilter;
        return matchesSearch && matchesType;
    });

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
                    <h1 class="pokedex-title">
                        <img src="/icons/pokedex.png" alt="Pokedex" class="title-icon" />
                        ML Algorithm Database
                    </h1>
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
                            <div class="sprite-container">
                                <img
                                        src={algorithm.sprite}
                                        alt="{algorithm.name} sprite"
                                        class="algorithm-sprite"
                                        on:error={() => console.warn(`Failed to load sprite for ${algorithm.name}`)}
                                />
                            </div>
                            <div class="entry-id">#{String(algorithm.id).padStart(3, '0')}</div>
                        </div>

                        <div class="entry-info">
                            <div class="name-with-icon">
                                <img
                                        src={algorithm.icon}
                                        alt="{algorithm.name} icon"
                                        class="algorithm-icon"
                                        on:error={() => console.warn(`Failed to load icon for ${algorithm.name}`)}
                                />
                                <h3 class="entry-name">{algorithm.name}</h3>
                            </div>
                            <div class="entry-type type-{algorithm.type}">{algorithm.type}</div>
                        </div>

                        <div class="entry-stats">
                            <div class="mini-stat">
                                <span class="mini-stat-label">ATK</span>
                                <span class="mini-stat-value">{algorithm.config.baseStats.attack}</span>
                                <div class="mini-stat-bar">
                                    <div class="mini-stat-fill" style="width: {algorithm.config.baseStats.attack}%; background: #ef4444;"></div>
                                </div>
                            </div>
                            <div class="mini-stat">
                                <span class="mini-stat-label">DEF</span>
                                <span class="mini-stat-value">{algorithm.config.baseStats.defense}</span>
                                <div class="mini-stat-bar">
                                    <div class="mini-stat-fill" style="width: {algorithm.config.baseStats.defense}%; background: #3b82f6;"></div>
                                </div>
                            </div>
                            <div class="mini-stat">
                                <span class="mini-stat-label">SPD</span>
                                <span class="mini-stat-value">{algorithm.config.baseStats.speed}</span>
                                <div class="mini-stat-bar">
                                    <div class="mini-stat-fill" style="width: {algorithm.config.baseStats.speed}%; background: #22c55e;"></div>
                                </div>
                            </div>
                        </div>

                        <div class="entry-preview">
                            <div class="strength-preview">
                                <strong>💪 Strength:</strong> {algorithm.config.strengths[0]}
                            </div>
                            <div class="special-preview">
                                <strong>⚡ Special:</strong> {algorithm.config.special}
                            </div>
                        </div>

                        <div class="entry-footer">
                            <img src="/icons/battle.png" alt="Battle" class="footer-icon" />
                            <span class="entry-hint">Click to view details →</span>
                        </div>
                    </div>
                {/each}

                {#if filteredAlgorithms.length === 0}
                    <div class="no-results">
                        <div class="no-results-icon">
                            <img src="/icons/pokedex.png" alt="No results" class="no-results-image" />
                        </div>
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
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
        border: 3px solid #2563eb;
        border-radius: 20px;
        width: 100%;
        max-width: 1200px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 30px;
        color: #f1f5f9;
        font-family: 'Courier New', monospace;
        box-shadow: 0 20px 60px rgba(37, 99, 235, 0.5);
    }

    :global(.theme-dark) .pokedex-container {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        border-color: #3b82f6;
    }

    .pokedex-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid rgba(148, 163, 184, 0.3);
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
        color: #f1f5f9;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .title-icon {
        width: 50px;
        height: 50px;
        filter: drop-shadow(0 0 10px rgba(37, 99, 235, 0.5));
    }

    .close-button {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 1.2rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
    }

    .close-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 18px rgba(220, 38, 38, 0.35);
    }

    .pokedex-subtitle {
        color: #cbd5e1;
        margin: 0;
        font-size: 1.1rem;
    }

    :global(.theme-dark) .pokedex-subtitle {
        color: #94a3b8;
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
        color: #94a3b8;
    }

    .search-input {
        width: 100%;
        padding: 12px 40px 12px 40px;
        background: rgba(148, 163, 184, 0.1);
        border: 2px solid #64748b;
        border-radius: 25px;
        color: #f1f5f9;
        font-family: inherit;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    .search-input:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 10px rgba(37, 99, 235, 0.3);
    }

    :global(.theme-dark) .search-input {
        background: rgba(71, 85, 105, 0.2);
        border-color: #475569;
        color: #e2e8f0;
    }

    .clear-search {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-size: 1rem;
        padding: 4px;
        transition: all 0.3s ease;
    }

    .clear-search:hover {
        color: #f1f5f9;
    }

    .type-filters {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
    }

    .type-filter {
        padding: 8px 16px;
        background: rgba(148, 163, 184, 0.1);
        border: 2px solid var(--filter-color, #64748b);
        border-radius: 20px;
        color: #f1f5f9;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .type-filter:hover {
        background: var(--filter-color);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .type-filter.active {
        background: var(--filter-color);
        color: #fff;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    /* Results */
    .results-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    }

    .results-count {
        color: #cbd5e1;
        font-size: 0.9rem;
    }

    .clear-filters {
        background: none;
        border: 1px solid #64748b;
        color: #cbd5e1;
        padding: 4px 12px;
        border-radius: 12px;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.8rem;
        transition: all 0.3s ease;
    }

    .clear-filters:hover {
        border-color: #2563eb;
        color: #3b82f6;
    }

    /* Algorithm Grid */
    .algorithms-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;
    }

    .algorithm-entry {
        background: rgba(148, 163, 184, 0.1);
        border: 2px solid rgba(148, 163, 184, 0.2);
        border-radius: 16px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(10px);
    }

    :global(.theme-dark) .algorithm-entry {
        background: rgba(71, 85, 105, 0.2);
        border-color: rgba(71, 85, 105, 0.3);
    }

    .algorithm-entry:hover {
        border-color: #2563eb;
        background: rgba(37, 99, 235, 0.15);
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3);
    }

    .entry-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    .sprite-container {
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%);
        border-radius: 50%;
        border: 2px solid #2563eb;
    }

    .algorithm-sprite {
        width: 60px;
        height: 60px;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
    }

    .entry-id {
        font-size: 1.2rem;
        color: #94a3b8;
        font-weight: 600;
    }

    .entry-info {
        margin-bottom: 15px;
    }

    .name-with-icon {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
    }

    .algorithm-icon {
        width: 24px;
        height: 24px;
        filter: drop-shadow(0 0 5px rgba(37, 99, 235, 0.3));
    }

    .entry-name {
        font-size: 1.3rem;
        margin: 0;
        color: #2563eb;
        font-weight: 600;
    }

    .entry-type {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #fff;
        text-transform: uppercase;
    }

    .entry-stats {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
    }

    .mini-stat {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .mini-stat-label {
        font-size: 0.7rem;
        color: #94a3b8;
        text-transform: uppercase;
        font-weight: 600;
    }

    .mini-stat-value {
        font-size: 1.1rem;
        font-weight: 600;
        color: #f1f5f9;
    }

    .mini-stat-bar {
        width: 100%;
        height: 4px;
        background: rgba(148, 163, 184, 0.3);
        border-radius: 2px;
        overflow: hidden;
    }

    .mini-stat-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.5s ease;
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
        color: #3b82f6;
    }

    .entry-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding-top: 10px;
        border-top: 1px solid rgba(148, 163, 184, 0.2);
    }

    .footer-icon {
        width: 16px;
        height: 16px;
        opacity: 0.7;
    }

    .entry-hint {
        color: #94a3b8;
        font-size: 0.8rem;
        font-style: italic;
    }

    /* No results */
    .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #64748b;
    }

    .no-results-image {
        width: 80px;
        height: 80px;
        opacity: 0.3;
        margin-bottom: 20px;
    }

    .no-results h3 {
        margin: 0 0 10px 0;
        color: #94a3b8;
    }

    .no-results p {
        margin: 0;
        color: #64748b;
    }

    /* Updated type colors to match algorithms.ts */
    .type-forest { background: #22c55e; }
    .type-neural { background: #3b82f6; }
    .type-svm { background: #ef4444; }
    .type-gradient { background: #f59e0b; }
    .type-bayes { background: #ec4899; }
    .type-kmeans { background: #8b5cf6; }

    /* Responsive */
    @media (max-width: 768px) {
        .pokedex-container {
            padding: 20px;
        }

        .pokedex-title {
            font-size: 2rem;
        }

        .title-icon {
            width: 40px;
            height: 40px;
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

        .sprite-container {
            width: 60px;
            height: 60px;
        }

        .algorithm-sprite {
            width: 45px;
            height: 45px;
        }
    }

    /* Scrollbar styling */
    .pokedex-container::-webkit-scrollbar {
        width: 8px;
    }

    .pokedex-container::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.5);
    }

    .pokedex-container::-webkit-scrollbar-thumb {
        background: #2563eb;
        border-radius: 4px;
    }

    .pokedex-container::-webkit-scrollbar-thumb:hover {
        background: #3b82f6;
    }
</style>