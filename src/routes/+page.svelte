<!-- @file src/routes/+page.svelte -->
<script lang="ts">
    import Arena from '$lib/components/arena/Arena.svelte';
    import { onMount } from 'svelte';

    let isLoading = true;
    let loadingMessage = 'Initializing Combat Arena...';

    onMount(async () => {
        // Simulate loading time for dramatic effect
        setTimeout(() => {
            isLoading = false;
        }, 2000);
    });
</script>

<svelte:head>
    <title>Predictive Combat Arena - Where Algorithms Fight!</title>
    <meta name="description" content="Watch machine learning algorithms battle it out in an epic combat arena!" />
</svelte:head>

{#if isLoading}
    <div class="loading-screen">
        <div class="loading-content">
            <div class="logo">
                <h1>🥊 PREDICTIVE COMBAT ARENA</h1>
                <div class="subtitle">Where Algorithms Fight for Supremacy</div>
            </div>

            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>

            <div class="loading-text">{loadingMessage}</div>

            <div class="loading-tips">
                <h3>Combat Tips:</h3>
                <ul>
                    <li>🌳 Random Forest excels in defense with ensemble power</li>
                    <li>🧠 Neural Networks pack devastating attack combos</li>
                    <li>⚔️ SVM has incredible precision strikes</li>
                    <li>⚡ Gradient Boosting builds power over time</li>
                    <li>🎯 Naive Bayes is lightning fast</li>
                    <li>🎲 K-Means clusters enemies for strategic advantage</li>
                </ul>
            </div>
        </div>
    </div>
{:else}
    <main class="app">
        <Arena />
    </main>
{/if}

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        background: #0a0a0a;
        font-family: 'Courier New', monospace;
        color: #fff;
        overflow-x: hidden;
    }

    .loading-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .loading-content {
        text-align: center;
        max-width: 600px;
        padding: 20px;
    }

    .logo h1 {
        font-size: 3rem;
        margin: 0;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f39c12, #e74c3c);
        background-size: 300% 300%;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradient-shift 3s ease-in-out infinite;
    }

    @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }

    .subtitle {
        font-size: 1.2rem;
        color: #ccc;
        margin-top: 10px;
        letter-spacing: 2px;
    }

    .loading-spinner {
        margin: 40px 0;
    }

    .spinner {
        width: 60px;
        height: 60px;
        border: 4px solid #333;
        border-top: 4px solid #ff6b6b;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .loading-text {
        font-size: 1.1rem;
        color: #4ecdc4;
        margin: 20px 0;
        animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
    }

    .loading-tips {
        margin-top: 40px;
        text-align: left;
        background: rgba(255, 255, 255, 0.05);
        padding: 20px;
        border-radius: 10px;
        border: 1px solid #333;
    }

    .loading-tips h3 {
        color: #f39c12;
        margin-top: 0;
        text-align: center;
    }

    .loading-tips ul {
        list-style: none;
        padding: 0;
    }

    .loading-tips li {
        padding: 8px 0;
        color: #ccc;
        border-bottom: 1px solid #222;
    }

    .loading-tips li:last-child {
        border-bottom: none;
    }

    .app {
        min-height: 100vh;
        background: #0a0a0a;
    }

    /* Scrollbar styling */
    :global(::-webkit-scrollbar) {
        width: 8px;
    }

    :global(::-webkit-scrollbar-track) {
        background: #1a1a1a;
    }

    :global(::-webkit-scrollbar-thumb) {
        background: #333;
        border-radius: 4px;
    }

    :global(::-webkit-scrollbar-thumb:hover) {
        background: #555;
    }
</style>