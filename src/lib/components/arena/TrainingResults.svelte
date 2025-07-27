<!-- @file src/lib/components/arena/TrainingResults.svelte -->
<script lang="ts">
    import { onDestroy } from 'svelte';
    import { trainingResults } from '$lib/stores/trainingResults';
    import { playAudio } from '$lib/stores/audioPlayer';
    import type { TrainingProgress, TrainingSession } from '$lib/stores/trainingResults';

    export let visible = false;
    export let datasetAnalysis: any = null; // Pass this from parent component

    let currentSession: TrainingSession | null = null;
    let progressMap: Record<string, TrainingProgress> = {};
    let showResults = false;
    let comparisonData: Array<{
        algorithm: string;
        accuracy: number;
        precision: number;
        recall: number;
        f1Score: number;
        trainingTime: number;
        color: string;
        fullName: string;
    }> = [];

    // Subscribe to store
    const unsubscribe = trainingResults.subscribe(store => {
        currentSession = store.currentSession;
        progressMap = store.progressMap;
        showResults = store.showResults;

        if (store.currentSession?.algorithms.length) {
            comparisonData = store.currentSession.algorithms.map(algo => ({
                algorithm: algo.algorithmName.replace(' ', '\n'),
                accuracy: Math.round(algo.accuracy * 100),
                precision: Math.round(algo.precision * 100),
                recall: Math.round(algo.recall * 100),
                f1Score: Math.round(algo.f1Score * 100),
                trainingTime: Number(algo.trainingTime.toFixed(2)),
                color: algo.fighter?.color || '#3b82f6',
                fullName: algo.algorithmName
            }));
        }
    });

    onDestroy(unsubscribe);

    function closeResults() {
        playAudio('/audio/button_real.wav');
        trainingResults.hideResults();
    }

    function clearSession() {
        playAudio('/audio/button_real.wav');
        trainingResults.clearSession();
    }

    function getMaxValue(metric: 'accuracy' | 'precision' | 'recall' | 'f1Score' | 'trainingTime') {
        if (comparisonData.length === 0) return 100;
        return Math.max(...comparisonData.map(d => d[metric]));
    }
</script>

{#if visible && showResults && comparisonData.length > 0}
    <div class="training-results-overlay">
        <div class="training-results-modal">
            <div class="modal-header">
                <h2>🏆 Training Results Dashboard</h2>
                <button class="close-button" on:click={closeResults}>✕</button>
            </div>

            <div class="modal-content">
                {#if Object.keys(progressMap).some(key => progressMap[key].isTraining)}
                    <!-- Training Progress -->
                    <div class="training-progress-section">
                        <h3>🔥 Live Training Progress</h3>

                        {#each Object.values(progressMap).filter((p: TrainingProgress) => p.isTraining || p.completed) as progress}
                            <div class="progress-item">
                                <div class="progress-header">
                                    <span class="algorithm-name">{progress.algorithmName}</span>
                                    <span class="progress-percentage">{Math.round(progress.progress)}%</span>
                                </div>

                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: {progress.progress}%"></div>
                                </div>

                                <div class="progress-status">
                                    {#if progress.isTraining}
                                        <span class="status-training">⚡ {progress.currentMetric}</span>
                                    {:else if progress.completed}
                                        <span class="status-complete">✅ Training Complete!</span>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <!-- Results Dashboard -->
                    <div class="results-dashboard">
                        <div class="dashboard-header">
                            <h3>📊 Performance Analysis</h3>
                            <p class="dataset-info">
                                <img src="/icons/dataset.png" alt="Dataset" class="dataset-icon" />
                                <strong>
                                    {datasetAnalysis?.name || currentSession?.datasetName || 'Unknown Dataset'}
                                    {#if datasetAnalysis?.difficulty}
                                        <span class="difficulty-badge">Level {datasetAnalysis.difficulty}</span>
                                    {/if}
                                </strong>
                            </p>
                        </div>

                        <div class="charts-grid">
                            <!-- Performance Radar Chart (CSS) -->
                            <div class="chart-container">
                                <h4>📈 Performance Comparison</h4>
                                <div class="radar-chart">
                                    {#each comparisonData as algo}
                                        <div class="radar-algorithm" style="border-color: {algo.color}">
                                            <div class="algo-header">
                                                <span class="algo-name" style="color: {algo.color}">{algo.fullName}</span>
                                            </div>
                                            <div class="radar-metrics">
                                                <div class="metric-row">
                                                    <span>Accuracy</span>
                                                    <div class="metric-bar">
                                                        <div class="bar-fill" style="width: {algo.accuracy}%; background: {algo.color}"></div>
                                                    </div>
                                                    <span>{algo.accuracy}%</span>
                                                </div>
                                                <div class="metric-row">
                                                    <span>Precision</span>
                                                    <div class="metric-bar">
                                                        <div class="bar-fill" style="width: {algo.precision}%; background: {algo.color}"></div>
                                                    </div>
                                                    <span>{algo.precision}%</span>
                                                </div>
                                                <div class="metric-row">
                                                    <span>Recall</span>
                                                    <div class="metric-bar">
                                                        <div class="bar-fill" style="width: {algo.recall}%; background: {algo.color}"></div>
                                                    </div>
                                                    <span>{algo.recall}%</span>
                                                </div>
                                                <div class="metric-row">
                                                    <span>F1-Score</span>
                                                    <div class="metric-bar">
                                                        <div class="bar-fill" style="width: {algo.f1Score}%; background: {algo.color}"></div>
                                                    </div>
                                                    <span>{algo.f1Score}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>

                            <!-- Accuracy Comparison -->
                            <div class="chart-container">
                                <h4>🎯 Accuracy Ranking</h4>
                                <div class="bar-chart">
                                    {#each comparisonData.sort((a, b) => b.accuracy - a.accuracy) as algo, index}
                                        <div class="bar-item">
                                            <div class="bar-label">
                                                <span class="rank">#{index + 1}</span>
                                                <span class="name">{algo.fullName}</span>
                                                <span class="value">{algo.accuracy}%</span>
                                            </div>
                                            <div class="bar-visual">
                                                <div
                                                        class="bar-fill-animated"
                                                        style="width: {(algo.accuracy / getMaxValue('accuracy')) * 100}%; background: {algo.color}"
                                                ></div>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>

                            <!-- Training Time -->
                            <div class="chart-container">
                                <h4>⏱️ Training Speed</h4>
                                <div class="time-chart">
                                    {#each comparisonData.sort((a, b) => a.trainingTime - b.trainingTime) as algo, index}
                                        <div class="time-item">
                                            <div class="time-label">
                                                <span class="speed-rank">#{index + 1}</span>
                                                <span class="algo-name">{algo.fullName}</span>
                                                <span class="time-value">{algo.trainingTime}s</span>
                                            </div>
                                            <div class="time-bar">
                                                <div
                                                        class="time-fill"
                                                        style="width: {(algo.trainingTime / getMaxValue('trainingTime')) * 100}%; background: linear-gradient(90deg, {algo.color}, #fbbf24)"
                                                ></div>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>

                            <!-- Stats Table -->
                            <div class="stats-table-container">
                                <h4>📈 Detailed Metrics</h4>
                                <div class="stats-table">
                                    <div class="table-header">
                                        <span>Algorithm</span>
                                        <span>Accuracy</span>
                                        <span>Precision</span>
                                        <span>Recall</span>
                                        <span>F1-Score</span>
                                        <span>Time (s)</span>
                                    </div>
                                    {#each comparisonData as algo}
                                        <div class="table-row" style="border-left: 4px solid {algo.color}">
                                            <span class="algo-name">{algo.fullName}</span>
                                            <span class="metric">{algo.accuracy}%</span>
                                            <span class="metric">{algo.precision}%</span>
                                            <span class="metric">{algo.recall}%</span>
                                            <span class="metric">{algo.f1Score}%</span>
                                            <span class="metric">{algo.trainingTime}s</span>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>

                        <div class="action-buttons">
                            <button class="action-button secondary" on:click={clearSession}>
                                🔄 New Session
                            </button>
                            <button class="action-button primary" on:click={closeResults}>
                                ⚔️ Continue to Battle
                            </button>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .training-results-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
        backdrop-filter: blur(10px);
    }

    .training-results-modal {
        background: linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(30, 64, 175, 0.95) 100%);
        border-radius: 20px;
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-family: 'Courier New', monospace;
    }

    :global(.theme-dark) .training-results-modal {
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30px 40px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .modal-header h2 {
        color: #f1f5f9;
        font-size: 1.8rem;
        margin: 0;
        font-weight: 600;
    }

    .close-button {
        background: none;
        border: none;
        color: #f1f5f9;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .close-button:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.1);
    }

    .modal-content {
        padding: 30px 40px;
    }

    .training-progress-section h3,
    .dashboard-header h3 {
        color: #f1f5f9;
        font-size: 1.4rem;
        margin: 0 0 20px 0;
        font-weight: 600;
    }

    .dashboard-header p {
        color: #cbd5e1;
        margin: 0 0 30px 0;
        font-size: 1.1rem;
    }

    .dataset-info {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .dataset-icon {
        height: 30px;
        width: 30px;
        object-fit: contain;
    }

    .difficulty-badge {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-left: 8px;
        box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
    }

    .progress-item {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .algorithm-name {
        color: #f1f5f9;
        font-weight: 600;
        font-size: 1.1rem;
    }

    .progress-percentage {
        color: #3b82f6;
        font-weight: 600;
        font-size: 1.1rem;
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 10px;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6 0%, #1e40af 100%);
        border-radius: 4px;
        transition: width 0.5s ease;
        animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: 200px 0; }
    }

    .progress-status {
        font-size: 0.9rem;
    }

    .status-training {
        color: #fbbf24;
        animation: pulse 2s infinite;
    }

    .status-complete {
        color: #10b981;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }

    .charts-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;
        margin-bottom: 30px;
    }

    .chart-container {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .chart-container h4 {
        color: #f1f5f9;
        font-size: 1.1rem;
        margin: 0 0 20px 0;
        font-weight: 600;
        text-align: center;
    }

    /* Radar Chart Styles */
    .radar-chart {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .radar-algorithm {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid;
        border-radius: 12px;
        padding: 15px;
        transition: all 0.3s ease;
    }

    .radar-algorithm:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }

    .algo-header {
        margin-bottom: 15px;
    }

    .algo-name {
        font-weight: 600;
        font-size: 1rem;
    }

    .radar-metrics {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .metric-row {
        display: grid;
        grid-template-columns: 80px 1fr 50px;
        align-items: center;
        gap: 10px;
        font-size: 0.9rem;
    }

    .metric-bar {
        height: 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        overflow: hidden;
    }

    .bar-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.8s ease;
        animation: fillUp 1s ease;
    }

    @keyframes fillUp {
        from { width: 0%; }
    }

    /* Bar Chart Styles */
    .bar-chart {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .bar-item {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 12px;
        transition: all 0.3s ease;
    }

    .bar-item:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .bar-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 0.9rem;
    }

    .rank {
        background: #3b82f6;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.8rem;
    }

    .name {
        flex: 1;
        margin-left: 10px;
        color: #f1f5f9;
        font-weight: 500;
    }

    .value {
        color: #3b82f6;
        font-weight: 600;
    }

    .bar-visual {
        height: 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        overflow: hidden;
    }

    .bar-fill-animated {
        height: 100%;
        border-radius: 4px;
        transition: width 1s ease;
        animation: slideIn 1.2s ease;
    }

    @keyframes slideIn {
        from { width: 0%; }
    }

    /* Time Chart Styles */
    .time-chart {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .time-item {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 10px;
    }

    .time-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        font-size: 0.9rem;
    }

    .speed-rank {
        background: #fbbf24;
        color: #1f2937;
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 0.8rem;
    }

    .time-value {
        color: #fbbf24;
        font-weight: 600;
    }

    .time-bar {
        height: 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        overflow: hidden;
    }

    .time-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 1s ease;
        animation: timeGrow 1.5s ease;
    }

    @keyframes timeGrow {
        from { width: 0%; }
    }

    /* Stats Table */
    .stats-table-container {
        grid-column: 1 / -1;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .stats-table-container h4 {
        color: #f1f5f9;
        font-size: 1.2rem;
        margin: 0 0 20px 0;
        font-weight: 600;
        text-align: center;
    }

    .stats-table {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
        gap: 10px;
    }

    .table-header {
        display: contents;
        font-weight: 600;
        color: #cbd5e1;
        font-size: 0.9rem;
    }

    .table-header > span {
        padding: 10px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        text-align: center;
    }

    .table-row {
        display: contents;
    }

    .table-row > span {
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        color: #f1f5f9;
        font-size: 0.9rem;
        text-align: center;
        margin-bottom: 5px;
        transition: background 0.3s ease;
    }

    .table-row:hover > span {
        background: rgba(255, 255, 255, 0.1);
    }

    .table-row .algo-name {
        text-align: left !important;
        font-weight: 600;
    }

    .metric {
        font-weight: 600;
        color: #3b82f6;
    }

    .action-buttons {
        display: flex;
        gap: 20px;
        justify-content: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .action-button {
        padding: 15px 30px;
        border: none;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Courier New', monospace;
    }

    .action-button.primary {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
    }

    .action-button.primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
    }

    .action-button.secondary {
        background: rgba(255, 255, 255, 0.1);
        color: #f1f5f9;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .action-button.secondary:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }

    @media (max-width: 1200px) {
        .charts-grid {
            grid-template-columns: 1fr;
        }

        .training-results-modal {
            max-width: 95vw;
        }

        .modal-header,
        .modal-content {
            padding: 20px 25px;
        }
    }

    @media (max-width: 768px) {
        .stats-table {
            grid-template-columns: 1fr;
            gap: 5px;
        }

        .table-header {
            display: none;
        }

        .table-row > span {
            display: flex;
            justify-content: space-between;
            text-align: left !important;
        }

        .action-buttons {
            flex-direction: column;
        }

        .metric-row {
            grid-template-columns: 70px 1fr 40px;
            gap: 8px;
            font-size: 0.8rem;
        }

        .bar-label {
            font-size: 0.8rem;
        }

        .time-label {
            font-size: 0.8rem;
        }
    }
</style>