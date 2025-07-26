<!-- @file src/lib/components/arena/ArenaHeader.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let datasetAnalysis: any = null;
    export let showBackButton: boolean = false;
    export let showPokedexButton: boolean = false;

    const dispatch = createEventDispatcher();

    function handleBack() {
        dispatch('back');
    }

    function handlePokedex() {
        dispatch('pokedex');
    }
</script>

<div class="arena-header">
    <h1>🥊 Predictive Combat Arena</h1>

    {#if datasetAnalysis}
        <div class="dataset-info">
            {#if showBackButton}
                <button class="back-button" on:click={handleBack}>
                    ← Back
                </button>
            {/if}

            {#if showPokedexButton}
                <button class="pokedex-button" on:click={handlePokedex}>
                    📖 Pokedex
                </button>
            {/if}

            <div class="current-dataset">
                📊 {datasetAnalysis.name} (Level {datasetAnalysis.difficulty})
            </div>
        </div>
    {:else}
        <p>Upload your dataset to begin the ultimate ML battle!</p>
    {/if}
</div>

<style>
    .arena-header {
        text-align: center;
        margin-bottom: 30px;
        padding: 20px;
    }

    .arena-header h1 {
        font-size: 2.5rem;
        margin: 0 0 20px 0;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .dataset-info {
        display: flex;
        align-items: center;
        gap: 20px;
        justify-content: center;
        flex-wrap: wrap;
    }

    .back-button {
        background: #333;
        color: #ccc;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.3s ease;
    }

    .back-button:hover {
        background: #444;
        transform: translateX(-2px);
    }

    .pokedex-button {
        background: linear-gradient(45deg, #4ecdc4, #45b7d1);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-family: inherit;
        font-weight: bold;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .pokedex-button:hover {
        background: linear-gradient(45deg, #45b7d1, #4ecdc4);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
    }

    .current-dataset {
        color: #4ecdc4;
        font-weight: bold;
        background: rgba(78, 205, 196, 0.1);
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid #4ecdc4;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .arena-header h1 {
            font-size: 2rem;
        }

        .dataset-info {
            flex-direction: column;
            gap: 15px;
        }
    }
</style>