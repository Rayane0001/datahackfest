<!-- @file src/lib/components/arena/DatasetUpload.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { DatasetAnalyzer } from '$lib/ml/dataset-analyzer';
    import { playAudio } from '$lib/stores/audioPlayer';

    const dispatch = createEventDispatcher();

    let dragActive = false;
    let isAnalyzing = false;
    let analysisResult: any = null;
    let uploadedFile: File | null = null;
    let error = '';

    const analyzer = new DatasetAnalyzer();

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        dragActive = true;
    }

    function handleDragLeave(e: DragEvent) {
        e.preventDefault();
        dragActive = false;
    }

    async function handleDrop(e: DragEvent) {
        e.preventDefault();
        dragActive = false;

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            await processFile(files[0]);
        }
    }

    async function handleFileSelect(e: Event) {
        const target = e.target as HTMLInputElement;
        const files = target.files;
        if (files && files.length > 0) {
            await processFile(files[0]);
        }
    }

    async function processFile(file: File) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            error = 'Please upload a CSV file';
            return;
        }

        uploadedFile = file;
        error = '';
        isAnalyzing = true;

        try {
            const analysisResults = await analyzer.analyzeDataset(file);
            analysisResult = analysisResults;

            // Dispatch the dataset to parent component
            dispatch('dataset-analyzed', {
                file: file,
                analysis: analysisResults,
                data: analysisResults.parsedData
            });
        } catch (err) {
            error = 'Failed to analyze dataset: ' + (err as Error).message;
            console.error('Dataset analysis error:', err);
        } finally {
            isAnalyzing = false;
        }
    }

    function reset() {
        uploadedFile = null;
        analysisResult = null;
        error = '';
    }
</script>

<div class="dataset-upload">
    {#if !analysisResult}
        <div class="upload-container">
            <div
                    class="upload-zone"
                    class:drag-active={dragActive}
                    on:dragover={handleDragOver}
                    on:dragleave={handleDragLeave}
                    on:drop={handleDrop}
                    role="button"
                    tabindex="0"
            >
                {#if isAnalyzing}
                    <div class="analyzing">
                        <div class="pokeball-spinner">⚡</div>
                        <h3>Analyzing Dataset...</h3>
                        <p>Processing your data for combat analysis...</p>
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                    </div>
                {:else}
                    <div class="upload-content">
                        <div class="upload-icon">📊</div>
                        <h3>Upload Dataset</h3>
                        <p>Drop your CSV file here or click to select</p>
                        <button class="upload-button" on:click={() => {
                            document.getElementById('file-input')?.click()
                            playAudio('/audio/super_mario.mp3', true);
                            }}>
                            Choose Dataset
                        </button>
                        <input
                                id="file-input"
                                type="file"
                                accept=".csv"
                                on:change={handleFileSelect}
                                style="display: none;"
                        />
                        <div class="supported-formats">
                            <small>Supported: CSV files</small>
                        </div>
                    </div>
                {/if}
            </div>

            {#if error}
                <div class="error-message">
                    ❌ {error}
                </div>
            {/if}
        </div>
    {:else}
        <div class="analysis-results">
            <div class="dataset-card">
                <div class="card-header">
                    <div class="dataset-avatar">
                        {analysisResult.problemType === 'classification' ? '🎯' : '📈'}
                    </div>
                    <div class="dataset-info">
                        <h3 class="dataset-name">{analysisResult.name || uploadedFile?.name}</h3>
                        <div class="dataset-level">Level {analysisResult.difficulty} Dataset</div>
                        <div class="dataset-type">{analysisResult.problemType.toUpperCase()}</div>
                    </div>
                    <button class="reset-button" on:click={reset}>🔄</button>
                </div>

                <div class="dataset-stats">
                    <div class="stat">
                        <span class="stat-label">Samples</span>
                        <span class="stat-value">{analysisResult.shape.rows}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Features</span>
                        <span class="stat-value">{analysisResult.shape.cols}</span>
                    </div>
                    {#if analysisResult.problemType === 'classification'}
                        <div class="stat">
                            <span class="stat-label">Classes</span>
                            <span class="stat-value">{analysisResult.classes?.length || 'N/A'}</span>
                        </div>
                    {/if}
                </div>

                <div class="dataset-description">
                    <h4>📋 Dataset Analysis:</h4>
                    <p>{analysisResult.description}</p>
                </div>

                {#if analysisResult.challenges?.length > 0}
                    <div class="challenges">
                        <h4>⚠️ Challenges:</h4>
                        <ul>
                            {#each analysisResult.challenges as challenge}
                                <li>{challenge}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}

                {#if analysisResult.recommendations?.length > 0}
                    <div class="recommendations">
                        <h4>💡 Recommended Algorithms:</h4>
                        <div class="recommended-algos">
                            {#each analysisResult.recommendations as rec}
                                <div class="algo-recommendation">
                                    <span class="algo-name">{rec.algorithm}</span>
                                    <span class="reason">{rec.reason}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}

                <button class="battle-ready-button" on:click={() => dispatch('ready-for-battle')}>
                    ⚔️ Choose Your Fighters!
                </button>
            </div>
        </div>
    {/if}
</div>

<style>
    .dataset-upload {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
    }

    .upload-zone {
        border: 3px dashed #64748b;
        border-radius: 15px;
        padding: 40px 20px;
        text-align: center;
        background: rgba(148, 163, 184, 0.1);
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .upload-zone.drag-active {
        border-color: #2563eb;
        background: rgba(37, 99, 235, 0.15);
        transform: scale(1.02);
    }

    .upload-content h3 {
        color: #2563eb;
        margin: 20px 0 10px;
        font-size: 1.5rem;
    }

    .upload-icon {
        font-size: 4rem;
        margin-bottom: 20px;
    }

    .upload-button {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        margin: 20px 0;
        transition: all 0.3s ease;
        box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.25);
    }

    .upload-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.35);
    }

    .supported-formats {
        color: #64748b;
        margin-top: 15px;
    }

    .analyzing {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
    }

    .pokeball-spinner {
        font-size: 3rem;
        animation: spin 2s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .progress-bar {
        width: 100%;
        max-width: 300px;
        height: 8px;
        background: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #2563eb, #1e40af);
        animation: progress 3s ease-in-out infinite;
    }

    @keyframes progress {
        0% { width: 0%; }
        50% { width: 70%; }
        100% { width: 100%; }
    }

    .error-message {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
        padding: 15px;
        border-radius: 8px;
        margin-top: 15px;
        border: 1px solid #dc2626;
    }

    .dataset-card {
        background: rgba(148, 163, 184, 0.1);
        border-radius: 15px;
        padding: 25px;
        border: 2px solid #334155;
    }

    .card-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
    }

    .dataset-avatar {
        font-size: 3rem;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(37, 99, 235, 0.2);
        border-radius: 50%;
        border: 3px solid #2563eb;
    }

    .dataset-info {
        flex: 1;
    }

    .dataset-name {
        color: #2563eb;
        margin: 0 0 5px;
        font-size: 1.3rem;
    }

    .dataset-level {
        color: #3b82f6;
        font-weight: 600;
        margin-bottom: 5px;
    }

    .dataset-type {
        color: #64748b;
        font-size: 0.9rem;
        background: rgba(148, 163, 184, 0.2);
        padding: 2px 8px;
        border-radius: 4px;
        display: inline-block;
    }

    .reset-button {
        background: #475569;
        color: #e2e8f0;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .reset-button:hover {
        background: #64748b;
    }

    .dataset-stats {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(15, 23, 42, 0.3);
        border-radius: 8px;
    }

    .stat {
        text-align: center;
    }

    .stat-label {
        display: block;
        color: #64748b;
        font-size: 0.9rem;
        margin-bottom: 5px;
    }

    .stat-value {
        display: block;
        color: #2563eb;
        font-size: 1.2rem;
        font-weight: 600;
    }

    .dataset-description,
    .challenges,
    .recommendations {
        margin-bottom: 20px;
    }

    .dataset-description h4,
    .challenges h4,
    .recommendations h4 {
        color: #3b82f6;
        margin: 0 0 10px;
    }

    .challenges ul {
        list-style: none;
        padding: 0;
    }

    .challenges li {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
        padding: 8px 12px;
        border-radius: 6px;
        margin-bottom: 5px;
        border-left: 3px solid #dc2626;
    }

    .recommended-algos {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .algo-recommendation {
        background: rgba(34, 197, 94, 0.1);
        padding: 10px;
        border-radius: 6px;
        border-left: 3px solid #059669;
    }

    .algo-name {
        color: #059669;
        font-weight: 600;
        margin-right: 10px;
    }

    .reason {
        color: #64748b;
        font-size: 0.9rem;
    }

    .battle-ready-button {
        width: 100%;
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
        border: none;
        padding: 15px;
        border-radius: 8px;
        font-size: 1.2rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.25);
    }

    .battle-ready-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.35);
    }

    /* Dark theme */
    :global(.theme-dark) .upload-zone {
        border-color: #475569;
        background: rgba(71, 85, 105, 0.1);
        color: #e2e8f0;
    }

    :global(.theme-dark) .upload-zone.drag-active {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.15);
    }

    :global(.theme-dark) .upload-content h3 {
        color: #3b82f6;
    }

    :global(.theme-dark) .supported-formats {
        color: #94a3b8;
    }

    :global(.theme-dark) .dataset-card {
        background: rgba(71, 85, 105, 0.1);
        border-color: #475569;
        color: #e2e8f0;
    }

    :global(.theme-dark) .dataset-name {
        color: #3b82f6;
    }

    :global(.theme-dark) .dataset-level {
        color: #60a5fa;
    }

    :global(.theme-dark) .dataset-type {
        color: #94a3b8;
        background: rgba(71, 85, 105, 0.3);
    }

    :global(.theme-dark) .stat-label {
        color: #94a3b8;
    }

    :global(.theme-dark) .stat-value {
        color: #3b82f6;
    }

    :global(.theme-dark) .dataset-description h4,
    :global(.theme-dark) .challenges h4,
    :global(.theme-dark) .recommendations h4 {
        color: #60a5fa;
    }

    :global(.theme-dark) .reason {
        color: #94a3b8;
    }
</style>