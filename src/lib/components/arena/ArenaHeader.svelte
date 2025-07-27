<!-- @file src/lib/components/arena/ArenaHeader.svelte -->
<script lang="ts">
	import { playAudio } from '$lib/stores/audioPlayer';
    import { createEventDispatcher } from 'svelte';

    export let datasetAnalysis: any = null;
    export let showBackButton: boolean = false;
    export let showPokedexButton: boolean = false;

    const dispatch = createEventDispatcher();

    function handleBack() {
        playAudio('/audio/button_real.wav')
        dispatch('back');
    }

    function handlePokedex() {
        playAudio('/audio/button_real.wav')
        dispatch('pokedex');
    }
</script>

<div class="arena-header">
    <h1>⚔️ Predictive Combat Arena</h1>

    {#if datasetAnalysis}
        <div class="dataset-info">
            {#if showBackButton}
                <button class="back-button" on:click={handleBack}>
                    ← Back
                </button>
            {/if}

            {#if showPokedexButton}
                <button class="pokedex-button" on:click={handlePokedex}>
                    📖 Algorithm Database
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
        color: #f1f5f9;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .arena-header p {
        color: #cbd5e1;
        font-size: 1.1rem;
        margin: 0;
    }

    .dataset-info {
        display: flex;
        align-items: center;
        gap: 20px;
        justify-content: center;
        flex-wrap: wrap;
    }

    .back-button {
        background: rgba(71, 85, 105, 0.8);
        color: #e2e8f0;
        border: 2px solid #475569;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.3s ease;
        font-weight: 500;
    }

    .back-button:hover {
        background: #64748b;
        border-color: #64748b;
        transform: translateX(-2px);
    }

    .pokedex-button {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-family: inherit;
        font-weight: 600;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.25);
    }

    .pokedex-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.35);
    }

    .current-dataset {
        color: #3b82f6;
        font-weight: 600;
        background: rgba(59, 130, 246, 0.1);
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid #3b82f6;
    }

    /* Dark theme */
    :global(.theme-dark) .arena-header h1 {
        color: #e2e8f0;
    }

    :global(.theme-dark) .arena-header p {
        color: #94a3b8;
    }

    :global(.theme-dark) .back-button {
        background: rgba(30, 41, 59, 0.8);
        color: #f1f5f9;
        border-color: #334155;
    }

    :global(.theme-dark) .back-button:hover {
        background: #1e293b;
        border-color: #475569;
    }

    :global(.theme-dark) .current-dataset {
        color: #60a5fa;
        background: rgba(59, 130, 246, 0.15);
        border-color: #60a5fa;
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