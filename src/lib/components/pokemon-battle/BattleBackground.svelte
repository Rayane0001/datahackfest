<!-- @file src/lib/components/pokemon-battle/BattleBackground.svelte -->
<script lang="ts">
    import { theme, getBackgroundSprites } from '$lib/stores/theme';

    $: backgroundSprites = getBackgroundSprites($theme);

    // Force reactivity when theme changes
    $: if ($theme) {
        console.log('Theme changed to:', $theme);
    }
</script>

<div class="battle-background">
    <img
            src={backgroundSprites.field}
            alt="Battle field background"
            class="field-background"
    />

    <img
            src={backgroundSprites.playerGrass}
            alt="Ally grass patch"
            class="grass-patch"
            style="--x: 25%; --y: 85%; --size: 200px;"
    />

    <img
            src={backgroundSprites.enemyGrass}
            alt="Enemy grass patch"
            class="grass-patch"
            style="--x: 62%; --y: 45%; --size: 160px;"
    />
</div>

<style>
    .battle-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 1;
    }

    .field-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        image-rendering: pixelated;
    }

    .grass-patch {
        position: absolute;
        left: var(--x);
        top: var(--y);
        width: var(--size);
        height: calc(var(--size) * 0.6);
        object-fit: contain;
        image-rendering: pixelated;
        z-index: 2;
        transform: translate(-50%, -50%);
    }
</style>