<!-- @file src/lib/components/arena/Arena.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import type { Fighter } from '$lib/ml/algorithms';
    import { CombatEngine } from '$lib/ml/combat';
    import { trainingResults } from '$lib/stores/trainingResults';
    import type { AILevel } from '$lib/ai/combat-ai';

    // Phase Components
    import DatasetPhase from './phases/DatasetPhase.svelte';
    import FighterSelection from './phases/FighterSelection.svelte';
    import BattleSetup from './phases/BattleSetup.svelte';
    import ArenaHeader from './ArenaHeader.svelte';

    // Battle Components
    import Pokedex from '../pokedex/Pokedex.svelte';
    import CombatInterface from '../combat/CombatInterface.svelte';
    import PokemonBattleInterface from '../pokemon-battle/PokemonBattleInterface.svelte';

    // App State
    type Phase = 'dataset' | 'selection' | 'setup' | 'pokemon-battle' | 'tactical-battle';

    let currentPhase: Phase = 'dataset';
    let combatEngine: CombatEngine;

    // Data State
    let currentDataset: any = null;
    let datasetAnalysis: any = null;

    // Fighter State
    let fighter1: Fighter | null = null;
    let fighter2: Fighter | null = null;
    let isLoading = false;

    // Battle State
    let selectedAILevel: AILevel = 'normal';
    let battleMode: 'tactical' | 'pokemon' = 'pokemon';
    let combatLog: string[] = [];

    // UI State
    let showPokedex = false;

    onMount(async () => {
        combatEngine = new CombatEngine();
        await combatEngine.initialize();
    });

    // Phase Navigation
    function handleDatasetAnalyzed(event: CustomEvent) {
        currentDataset = event.detail.data;
        datasetAnalysis = event.detail.analysis;

        // Start a new training session when dataset is analyzed
        trainingResults.startSession(datasetAnalysis?.name || 'Unknown Dataset');

        currentPhase = 'selection';
    }

    function handleFightersSelected(event: CustomEvent) {
        fighter1 = event.detail.fighter1;
        fighter2 = event.detail.fighter2;
        currentPhase = 'setup';
    }

    function handleBattleStart(event: CustomEvent) {
        battleMode = event.detail.mode;
        selectedAILevel = event.detail.aiLevel;

        if (battleMode === 'pokemon') {
            currentPhase = 'pokemon-battle';
        } else {
            currentPhase = 'tactical-battle';
        }
    }

    function handleBattleEnd() {
        // Keep fighters and stay in same battle mode
        combatLog = [...combatLog, `Battle completed!`];
    }

    function handleBackToMenu() {
        // Return to setup phase to choose new battle mode or fighters
        currentPhase = 'setup';
    }

    function handleResetBattle() {
        currentPhase = 'setup';
    }

    function backToDataset() {
        currentPhase = 'dataset';
        currentDataset = null;
        datasetAnalysis = null;
        fighter1 = null;
        fighter2 = null;
        combatLog = [];

        // Clear training session completely
        trainingResults.hideResults();
        trainingResults.clearSession();
    }

    function backToSelection() {
        currentPhase = 'selection';
        fighter1 = null;
        fighter2 = null;

        // Clear training results and hide modal
        trainingResults.hideResults();
        trainingResults.clearSession();

        // Start new session if dataset exists
        if (datasetAnalysis) {
            trainingResults.startSession(datasetAnalysis.name || 'Unknown Dataset');
        }
    }

    // Pokedex
    function openPokedex() {
        showPokedex = true;
    }

    function closePokedex() {
        showPokedex = false;
    }

    function useAlgorithmFromPokedex(event: CustomEvent) {
        // Handle algorithm selection from Pokedex
        closePokedex();
    }
</script>

<div class="arena-container">
    {#if currentPhase === 'dataset'}
        <DatasetPhase
                on:dataset-analyzed={handleDatasetAnalyzed}
        />

    {:else if currentPhase === 'selection'}
        <ArenaHeader
                {datasetAnalysis}
                showBackButton={true}
                showPokedexButton={true}
                on:back={backToDataset}
                on:pokedex={openPokedex}
        />

        <!-- FighterSelection with training visualization -->
        <FighterSelection
                {combatEngine}
                {currentDataset}
                {datasetAnalysis}
                {isLoading}
                on:fighters-selected={handleFightersSelected}
                on:loading={(e: CustomEvent) => isLoading = e.detail}
        />

    {:else if currentPhase === 'setup'}
        <ArenaHeader
                {datasetAnalysis}
                showBackButton={true}
                showPokedexButton={true}
                on:back={backToSelection}
                on:pokedex={openPokedex}
        />

        <BattleSetup
                {fighter1}
                {fighter2}
                {battleMode}
                {selectedAILevel}
                on:battle-start={handleBattleStart}
                on:back={backToSelection}
        />

        <!-- Training Results Summary Card -->
        {#if fighter1 && fighter2}
            <div class="training-summary-card">
                <h3>🏆 Training Results Summary</h3>
                <div class="summary-grid">
                    <div class="fighter-summary" style="border-color: {fighter1.color}">
                        <h4>{fighter1.name}</h4>
                        <div class="quick-stats">
                            <span>Accuracy: {(fighter1.precision * 100).toFixed(1)}%</span>
                            <span>Training: {fighter1.trainingTime.toFixed(2)}s</span>
                        </div>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="fighter-summary" style="border-color: {fighter2.color}">
                        <h4>{fighter2.name}</h4>
                        <div class="quick-stats">
                            <span>Accuracy: {(fighter2.precision * 100).toFixed(1)}%</span>
                            <span>Training: {fighter2.trainingTime.toFixed(2)}s</span>
                        </div>
                    </div>
                </div>
                <button class="view-detailed-results" on:click={() => trainingResults.toggleResults()}>
                    📊 View Detailed Analysis
                </button>
            </div>
        {/if}

    {:else if currentPhase === 'pokemon-battle'}
        {#if fighter1 && fighter2}
            <PokemonBattleInterface
                    playerFighter={fighter1}
                    aiFighter={fighter2}
                    aiLevel={selectedAILevel}
                    on:battle-end={handleBattleEnd}
                    on:back-to-menu={handleBackToMenu}
                    on:reset-battle={handleResetBattle}
            />
        {:else}
            <div class="loading-battle">
                <p>Initializing battle...</p>
                <button on:click={backToSelection}>Back to Selection</button>
            </div>
        {/if}

    {:else if currentPhase === 'tactical-battle'}
        {#if fighter1 && fighter2}
            <CombatInterface
                    playerFighter={fighter1}
                    aiFighter={fighter2}
                    aiLevel={selectedAILevel}
                    on:battle-end={handleBattleEnd}
                    on:back-to-menu={handleBackToMenu}
                    on:reset-battle={handleResetBattle}
            />
        {:else}
            <div class="loading-battle">
                <p>Initializing battle...</p>
                <button on:click={backToSelection}>Back to Selection</button>
            </div>
        {/if}
    {/if}
</div>

<!-- Pokedex Modal -->
{#if showPokedex}
    <Pokedex
            on:close={closePokedex}
            on:use-in-battle={useAlgorithmFromPokedex}
    />
{/if}

<style>
    .arena-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
        color: #f1f5f9;
        font-family: 'Courier New', monospace;
    }

    :global(.theme-dark) .arena-container {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
    }

    .loading-battle {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        gap: 20px;
    }

    .loading-battle p {
        font-size: 1.2rem;
        color: #3b82f6;
    }

    .loading-battle button {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.25);
    }

    .loading-battle button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.35);
    }

    /* Training Summary Card Styles */
    .training-summary-card {
        max-width: 1200px;
        margin: 40px auto;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        text-align: center;
    }

    :global(.theme-dark) .training-summary-card {
        background: rgba(30, 41, 59, 0.3);
        border-color: rgba(71, 85, 105, 0.3);
    }

    .training-summary-card h3 {
        color: #f1f5f9;
        font-size: 1.5rem;
        margin: 0 0 25px 0;
        font-weight: 600;
    }

    .summary-grid {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 30px;
        align-items: center;
        margin-bottom: 25px;
    }

    .fighter-summary {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid;
        border-radius: 15px;
        padding: 20px;
        transition: all 0.3s ease;
    }

    .fighter-summary:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .fighter-summary h4 {
        color: #f1f5f9;
        font-size: 1.2rem;
        margin: 0 0 15px 0;
        font-weight: 600;
    }

    .quick-stats {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .quick-stats span {
        color: #cbd5e1;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .vs-divider {
        font-size: 1.5rem;
        font-weight: 600;
        color: #fbbf24;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }

    .view-detailed-results {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
        font-family: 'Courier New', monospace;
    }

    .view-detailed-results:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
    }

    @media (max-width: 768px) {
        .summary-grid {
            grid-template-columns: 1fr;
            gap: 20px;
        }

        .vs-divider {
            order: 2;
        }

        .training-summary-card {
            margin: 20px;
            padding: 20px;
        }

        .training-summary-card h3 {
            font-size: 1.3rem;
        }

        .fighter-summary h4 {
            font-size: 1.1rem;
        }

        .quick-stats span {
            font-size: 0.8rem;
        }

        .view-detailed-results {
            padding: 12px 24px;
            font-size: 1rem;
        }
    }
</style>