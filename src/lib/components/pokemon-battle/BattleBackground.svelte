<!-- @file src/lib/components/pokemon-battle/BattleBackground.svelte -->
<script lang="ts">
    import { theme, getBackgroundSprites } from '$lib/stores/theme';

    $: backgroundSprites = getBackgroundSprites($theme);
</script>

<div class="battle-background">
    <!-- Main battlefield background -->
    <img
            src={backgroundSprites.field}
            alt="Battle field background"
            class="field-background"
    />

    <!-- Player/Ally grass patch (bottom left) -->
    <img
            src={backgroundSprites.playerGrass}
            alt="Ally grass patch"
            class="grass-patch ally-grass"
    />

    <!-- Enemy grass patch (top right) -->
    <img
            src={backgroundSprites.enemyGrass}
            alt="Enemy grass patch"
            class="grass-patch enemy-grass"
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
        image-rendering: pixelated;
        z-index: 2;
    }

    .ally-grass {
        bottom: 10%;
        left: 8%;
        width: 200px;
        height: 120px;
        object-fit: contain;
    }

    .enemy-grass {
        top: 15%;
        right: 20%;
        width: 160px;
        height: 100px;
        object-fit: contain;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .ally-grass {
            bottom: 10%;
            left: 10%;
            width: 160px;
            height: 110px;
        }

        .enemy-grass {
            top: 10%;
            right: 15%;
            width: 140px;
            height: 95px;
        }
    }
</style>