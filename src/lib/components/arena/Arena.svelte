<!-- @file src/lib/components/arena/Arena.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import type { Fighter } from '$lib/ml/algorithms';
    import { CombatEngine } from '$lib/ml/combat';
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
    }

    function backToSelection() {
        currentPhase = 'selection';
        fighter1 = null;
        fighter2 = null;
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

        <FighterSelection
                {combatEngine}
                {currentDataset}
                {isLoading}
                on:fighters-selected={handleFightersSelected}
                on:loading={(e) => isLoading = e.detail}
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
</style>