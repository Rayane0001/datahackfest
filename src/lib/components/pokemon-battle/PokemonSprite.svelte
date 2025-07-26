<!-- @file src/lib/components/pokemon-battle/PokemonSprite.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { getAlgorithmSprites } from '$lib/stores/theme';
    import type { Fighter } from '$lib/ml/algorithms';

    export let fighter: Fighter;
    export let isPlayer: boolean = false; // false = enemy (back sprite), true = player (front sprite)
    export let isVisible: boolean = true;
    export let isAnimating: boolean = false;
    export let animationType: 'none' | 'slide-in' | 'damage' | 'faint' | 'attack' = 'none';
    export let healthPercentage: number = 100;

    let spriteElement: HTMLImageElement;
    let animationClass = '';

    $: sprites = getAlgorithmSprites(fighter.name);
    $: currentSprite = isPlayer ? sprites.back : sprites.front;
    $: currentHealthPercentage = (fighter.health / fighter.maxHealth) * 100;

    // Handle animations
    $: if (animationType !== 'none' && isAnimating) {
        handleAnimation(animationType);
    }

    onMount(() => {
        // Slide in animation when component mounts
        if (isVisible) {
            setTimeout(() => {
                animationType = 'slide-in';
                isAnimating = true;
            }, 100);
        }
    });

    function handleAnimation(type: typeof animationType) {
        animationClass = `animate-${type}`;

        // Reset animation after it completes
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

    // Trigger damage flash when health decreases
    $: if (healthPercentage !== currentHealthPercentage && currentHealthPercentage < healthPercentage) {
        healthPercentage = currentHealthPercentage;
        if (!isAnimating && animationType === 'none') {
            animationType = 'damage';
            isAnimating = true;
        }
    }

    // Trigger faint animation when health reaches 0
    $: if (fighter.health <= 0 && animationType !== 'faint') {
        animationType = 'faint';
        isAnimating = true;
    }
</script>

<div
        class="pokemon-sprite-container"
        class:player-position={isPlayer}
        class:enemy-position={!isPlayer}
        class:visible={isVisible}
        class:fainted={fighter.health <= 0}
>
    <img
            bind:this={spriteElement}
            src={currentSprite}
            alt="{fighter.name} sprite"
            class="pokemon-sprite {animationClass}"
            class:player-sprite={isPlayer}
            class:enemy-sprite={!isPlayer}
            on:error={() => console.warn(`Failed to load sprite: ${currentSprite}`)}
    />

    <!-- Pokemon shadow/ground circle -->
    <div class="pokemon-shadow" class:fainted-shadow={fighter.health <= 0}></div>

    <!-- Status effect indicators -->
    {#if fighter.health > 0}
        <div class="status-indicators">
            <!-- Add status effect icons here if needed -->
        </div>
    {/if}
</div>

<style>
    .pokemon-sprite-container {
        position: absolute;
        transition: all 0.3s ease;
        z-index: 5;
    }

    .player-position {
        bottom: 10%;
        left: 10.5%;
        transform: scale(1.4);
    }

    .enemy-position {
        top: 15%;
        right: 17%;
        transform: scale(1.0);
    }

    .visible {
        opacity: 1;
    }

    .pokemon-sprite {
        width: 120px;
        height: 120px;
        object-fit: contain;
        image-rendering: pixelated; /* Preserve pixel art quality */
        filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3));
        transition: all 0.2s ease;
    }

    .player-sprite {
        transform: scaleX(1); /* Player de dos (back sprite) */
    }

    .enemy-sprite {
        transform: scaleX(1); /* Enemy de face (front sprite) */
    }

    .pokemon-shadow {
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

    /* Animations */
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

    .enemy-position .animate-slide-in {
        animation: slideInEnemy 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    @keyframes slideInEnemy {
        0% {
            transform: translateX(-100px) scale(0.8);
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

    .enemy-position .animate-attack {
        animation: attackEnemy 0.6s ease-in-out;
    }

    @keyframes attackEnemy {
        0%, 100% {
            transform: translateX(0) scale(1);
        }
        30% {
            transform: translateX(-20px) scale(1.1);
        }
        60% {
            transform: translateX(10px) scale(0.95);
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

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .player-position {
            bottom: 12%;
            left: 10%;
            transform: scale(1.1);
        }

        .enemy-position {
            top: 15%;
            right: 20%;
            transform: scale(0.8);
        }

        .pokemon-sprite {
            width: 100px;
            height: 100px;
        }

        .pokemon-shadow {
            width: 50px;
            height: 16px;
        }
    }
</style>