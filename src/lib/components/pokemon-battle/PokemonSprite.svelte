<!-- @file src/lib/components/pokemon-battle/PokemonSprite.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { getAlgorithmSprites } from '$lib/stores/theme';
    import type { Fighter } from '$lib/ml/algorithms';

    export let fighter: Fighter;
    export let isPlayer: boolean = false;
    export let isVisible: boolean = true;
    export let isAnimating: boolean = false;
    export let animationType: 'none' | 'slide-in' | 'damage' | 'faint' | 'attack' = 'none';
    export let healthPercentage: number = 100;

    let spriteElement: HTMLImageElement;
    let animationClass = '';

    $: sprites = getAlgorithmSprites(fighter.name);
    $: currentSprite = isPlayer ? sprites.back : sprites.front;
    $: currentHealthPercentage = (fighter.health / fighter.maxHealth) * 100;

    $: if (animationType !== 'none' && isAnimating) {
        handleAnimation(animationType);
    }

    onMount(() => {
        if (isVisible) {
            setTimeout(() => {
                animationType = 'slide-in';
                isAnimating = true;
            }, 100);
        }
    });

    function handleAnimation(type: typeof animationType) {
        animationClass = `animate-${type}`;
        const duration = getAnimationDuration(type);
        setTimeout(() => {
            animationClass = '';
            isAnimating = false;
        }, duration);
    }

    function getAnimationDuration(type: typeof animationType): number {
        switch (type) {
            case 'slide-in': return 800;
            case 'damage': return 500;
            case 'attack': return 600;
            case 'faint': return 1200;
            default: return 300;
        }
    }

    $: if (healthPercentage !== currentHealthPercentage && currentHealthPercentage < healthPercentage) {
        healthPercentage = currentHealthPercentage;
        if (!isAnimating && animationType === 'none') {
            animationType = 'damage';
            isAnimating = true;
        }
    }

    $: if (fighter.health <= 0 && animationType !== 'faint') {
        animationType = 'faint';
        isAnimating = true;
    }
</script>

<div
        class="sprite-wrapper"
        style="--x: {isPlayer ? '25' : '62'}%; --y: {isPlayer ? '72' : '34'}%;"
        class:visible={isVisible}
        class:fainted={fighter.health <= 0}
>
    <img
            bind:this={spriteElement}
            src={currentSprite}
            alt="{fighter.name} sprite"
            class="sprite-image {animationClass}"
            style="transform: scale({isPlayer ? '1.4' : '1.0'});"
            on:error={() => console.warn(`Failed to load sprite: ${currentSprite}`)}
    />

    <div class="sprite-shadow" class:fainted-shadow={fighter.health <= 0}></div>

    {#if fighter.health > 0}
        <div class="status-indicators"></div>
    {/if}
</div>

<style>
    .sprite-wrapper {
        position: absolute;
        left: var(--x);
        top: var(--y);
        transition: all 0.3s ease;
        z-index: 5;
        transform: translate(-50%, -50%);
    }

    .visible {
        opacity: 1;
    }

    .sprite-image {
        width: 120px;
        height: 120px;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3));
        transition: all 0.2s ease;
        display: block;
    }

    .sprite-shadow {
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 20px;
        background: radial-gradient(ellipse, rgba(0, 0, 0, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        transition: all 0.3s ease;
    }

    .fainted-shadow {
        opacity: 0.5;
        transform: translateX(-50%) scale(1.2);
    }

    .fainted {
        opacity: 0.7;
    }

    .status-indicators {
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 4px;
    }

    .animate-slide-in {
        animation: slideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .animate-damage {
        animation: damage 0.5s ease-in-out;
    }

    .animate-attack {
        animation: attack 0.6s ease-in-out;
    }

    .animate-faint {
        animation: faint 1.2s ease-in-out forwards;
    }

    @keyframes slideIn {
        0% {
            transform: translateX(100px) scale(0.8);
            opacity: 0;
        }
        100% {
            transform: translateX(0) scale(1);
            opacity: 1;
        }
    }

    @keyframes damage {
        0%, 100% {
            filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3));
            transform: translateX(0);
        }
        20%, 60% {
            filter: drop-shadow(2px 4px 6px rgba(255, 0, 0, 0.8)) brightness(1.5);
            transform: translateX(-8px);
        }
        40%, 80% {
            filter: drop-shadow(2px 4px 6px rgba(255, 0, 0, 0.8)) brightness(1.5);
            transform: translateX(8px);
        }
    }

    @keyframes attack {
        0%, 100% {
            transform: translateX(0) scale(1);
        }
        30% {
            transform: translateX(20px) scale(1.1);
        }
        60% {
            transform: translateX(-10px) scale(0.95);
        }
    }

    @keyframes faint {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: translateY(-20px) rotate(10deg);
            opacity: 0.8;
        }
        100% {
            transform: translateY(60px) rotate(90deg);
            opacity: 0.3;
        }
    }
</style>