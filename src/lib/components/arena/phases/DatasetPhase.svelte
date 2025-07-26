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
        <h1>🥊 Predictive Combat Arena</h1>
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
    }

    .phase-header {
        text-align: center;
        margin-bottom: 30px;
    }

    .phase-header h1 {
        font-size: 2.5rem;
        margin: 0 0 20px 0;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .phase-header p {
        color: #ccc;
        font-size: 1.1rem;
        margin: 0;
    }
</style>