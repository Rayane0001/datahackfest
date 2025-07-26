// @file src/lib/stores/theme.ts

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
    // Get initial theme from localStorage or default to light
    const getInitialTheme = (): Theme => {
        if (!browser) return 'light';

        const stored = localStorage.getItem('pokemon-battle-theme');
        if (stored === 'dark' || stored === 'light') return stored;

        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    };

    const { subscribe, set, update } = writable<Theme>(getInitialTheme());

    return {
        subscribe,
        setTheme: (theme: Theme) => {
            if (browser) {
                localStorage.setItem('pokemon-battle-theme', theme);
                // Update CSS class on body
                document.body.classList.remove('theme-light', 'theme-dark');
                document.body.classList.add(`theme-${theme}`);
            }
            set(theme);
        },
        toggle: () => {
            update(current => {
                const newTheme = current === 'light' ? 'dark' : 'light';
                if (browser) {
                    localStorage.setItem('pokemon-battle-theme', newTheme);
                    document.body.classList.remove('theme-light', 'theme-dark');
                    document.body.classList.add(`theme-${newTheme}`);
                }
                return newTheme;
            });
        },
        init: () => {
            // Initialize theme class on body
            if (browser) {
                const theme = getInitialTheme();
                document.body.classList.add(`theme-${theme}`);
                set(theme);
            }
        }
    };
}

export const theme = createThemeStore();

// Helper function to get sprite paths based on theme
export function getBackgroundSprites(currentTheme: Theme) {
    const timeOfDay = currentTheme === 'dark' ? 'night' : 'day';

    return {
        field: `/sprites/Fight background/field-${timeOfDay}.png`,
        playerGrass: `/sprites/Fight background/grass-${timeOfDay}-ally.png`,
        enemyGrass: `/sprites/Fight background/grass-${timeOfDay}-enemy.png` // Fixed: "enemy" not "ennemy"
    };
}

// Helper function to get ML algorithm sprites
export function getAlgorithmSprites(algorithmName: string) {
    const spriteMap: Record<string, string> = {
        'Random Forest': 'random-forest',
        'Neural Network': 'neural-network',
        'Support Vector Machine': 'support-vector-machine',
        'Gradient Boosting': 'gradient-boosting',
        'Naive Bayes': 'naive-bayes',
        'K-Means Clustering': 'k-means'
    };

    const spriteName = spriteMap[algorithmName] || 'neural-network';

    return {
        front: `/sprites/ML/${spriteName}-front.png`,
        back: `/sprites/ML/${spriteName}-back.png`
    };
}