<!-- @file src/lib/components/arena/phases/DatasetPhase.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import DatasetUpload from '../DatasetUpload.svelte';

    const dispatch = createEventDispatcher();

    function handleDatasetAnalyzed(event: CustomEvent) {
        dispatch('dataset-analyzed', event.detail);
    }

    function handleReadyForBattle() {
        // Dataset is ready, move to next phase
    }
</script>

<div class="dataset-phase">
    <div class="phase-header">
        <h1><img src="icons/battle.png" style="height:60px" /> Predictive Combat Arena</h1>
        <p>Upload your dataset to begin the ultimate ML battle!</p>
    </div>

    <DatasetUpload
            on:dataset-analyzed={handleDatasetAnalyzed}
            on:ready-for-battle={handleReadyForBattle}
    />
</div>

<style>
    .dataset-phase {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .phase-header {
        text-align: center;
        margin-bottom: 30px;
    }

    .phase-header h1 {
        font-size: 2.5rem;
        margin: 0 0 20px 0;
        color: #f1f5f9;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .phase-header p {
        color: #cbd5e1;
        font-size: 1.1rem;
        margin: 0;
    }

    /* Dark theme */
    :global(.theme-dark) .phase-header h1 {
        color: #e2e8f0;
    }

    :global(.theme-dark) .phase-header p {
        color: #94a3b8;
    }
</style>