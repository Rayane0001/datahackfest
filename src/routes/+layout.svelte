<!-- @file src/routes/+layout.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { theme } from '$lib/stores/theme';
    import '../app.css';

    onMount(() => {
        theme.init();
    });
</script>

<!-- Global Theme Toggle -->
<button class="global-theme-toggle" on:click={theme.toggle}>
    {$theme === 'light' ? '🌙' : '☀️'}
</button>

<slot />

<style>
    .global-theme-toggle {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid #2563eb;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .global-theme-toggle:hover {
        transform: scale(1.1);
        background: white;
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
    }

    :global(.theme-dark) .global-theme-toggle {
        background: rgba(30, 41, 59, 0.95);
        border-color: #3b82f6;
        color: #f1f5f9;
    }

    :global(.theme-dark) .global-theme-toggle:hover {
        background: #1e293b;
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }
</style>