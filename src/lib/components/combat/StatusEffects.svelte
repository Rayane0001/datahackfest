<!-- @file src/lib/components/combat/StatusEffects.svelte -->
<script lang="ts">
    export let statusEffects: Array<{
        name: string;
        turnsRemaining: number;
        description: string;
        type: 'positive' | 'negative' | 'neutral';
    }> = [];
    export let fighterName: string;

    const statusIcons: Record<string, string> = {
        overfitting: '🔥',
        underfitting: '❄️',
        'curse-dimensionality': '🌪️',
        'data-leakage': '💀',
        'dropout-defense': '🛡️',
        'bootstrap-boost': '💪',
        'gradient-flow': '⚡',
        poisoned: '☠️',
        paralyzed: '⚡',
        burned: '🔥',
        frozen: '🧊'
    };

    const statusColors: Record<string, string> = {
        overfitting: '#ef4444',
        underfitting: '#3b82f6',
        'curse-dimensionality': '#8b5cf6',
        'data-leakage': '#991b1b',
        'dropout-defense': '#22c55e',
        'bootstrap-boost': '#f59e0b',
        'gradient-flow': '#06b6d4',
        poisoned: '#7c3aed',
        paralyzed: '#eab308',
        burned: '#dc2626',
        frozen: '#0ea5e9'
    };

    function getStatusIcon(statusName: string): string {
        return statusIcons[statusName] || '❓';
    }

    function getStatusColor(statusName: string): string {
        return statusColors[statusName] || '#6b7280';
    }

    function getStatusTypeClass(type: string): string {
        switch (type) {
            case 'positive': return 'status-positive';
            case 'negative': return 'status-negative';
            default: return 'status-neutral';
        }
    }
</script>

{#if statusEffects.length > 0}
    <div class="status-effects-container">
        <div class="status-header">
            <span class="status-title">🎯 {fighterName}'s Status</span>
        </div>

        <div class="status-effects-grid">
            {#each statusEffects as status}
                <div
                        class="status-effect {getStatusTypeClass(status.type)}"
                        style="--status-color: {getStatusColor(status.name)}"
                        title={status.description}
                >
                    <div class="status-icon">
                        {getStatusIcon(status.name)}
                    </div>

                    <div class="status-info">
                        <div class="status-name">
                            {status.name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div class="status-duration">
                            {status.turnsRemaining} turn{status.turnsRemaining !== 1 ? 's' : ''} left
                        </div>
                    </div>

                    <div class="status-timer">
                        <div class="timer-circle">
                            <svg class="timer-svg" viewBox="0 0 36 36">
                                <path
                                        class="timer-bg"
                                        d="M18 2.0845
									a 15.9155 15.9155 0 0 1 0 31.831
									a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="rgba(255, 255, 255, 0.1)"
                                        stroke-width="2"
                                />
                                <path
                                        class="timer-progress"
                                        d="M18 2.0845
									a 15.9155 15.9155 0 0 1 0 31.831
									a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="var(--status-color)"
                                        stroke-width="2"
                                        stroke-dasharray="{(status.turnsRemaining / 5) * 100}, 100"
                                        stroke-linecap="round"
                                />
                            </svg>
                            <div class="timer-number">{status.turnsRemaining}</div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <!-- Educational tooltip -->
        <div class="status-education">
            <div class="education-icon">🎓</div>
            <div class="education-text">
                Status effects represent real ML challenges and benefits that algorithms face during training and inference.
            </div>
        </div>
    </div>
{/if}

<style>
    .status-effects-container {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid #333;
        border-radius: 10px;
        padding: 15px;
        margin: 15px 0;
        font-family: 'Courier New', monospace;
    }

    .status-header {
        text-align: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #333;
    }

    .status-title {
        color: #4ecdc4;
        font-weight: bold;
        font-size: 1rem;
    }

    .status-effects-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 15px;
    }

    .status-effect {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--status-color);
        border-radius: 8px;
        transition: all 0.3s ease;
        position: relative;
    }

    .status-effect:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateX(2px);
    }

    .status-effect.status-positive {
        background: rgba(34, 197, 94, 0.1);
    }

    .status-effect.status-negative {
        background: rgba(239, 68, 68, 0.1);
    }

    .status-effect.status-neutral {
        background: rgba(107, 114, 128, 0.1);
    }

    .status-icon {
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        border: 2px solid var(--status-color);
    }

    .status-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .status-name {
        color: #fff;
        font-weight: bold;
        font-size: 0.9rem;
    }

    .status-duration {
        color: #ccc;
        font-size: 0.8rem;
    }

    .status-timer {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .timer-circle {
        position: relative;
        width: 30px;
        height: 30px;
    }

    .timer-svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
    }

    .timer-progress {
        transition: stroke-dasharray 0.3s ease;
    }

    .timer-number {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--status-color);
        font-size: 0.7rem;
        font-weight: bold;
    }

    .status-education {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: rgba(78, 205, 196, 0.1);
        border: 1px solid #4ecdc4;
        border-radius: 6px;
        margin-top: 10px;
    }

    .education-icon {
        font-size: 1.2rem;
        color: #4ecdc4;
    }

    .education-text {
        color: #e5e7eb;
        font-size: 0.85rem;
        line-height: 1.4;
    }

    /* Animations for different status types */
    .status-effect.status-negative .status-icon {
        animation: shake 2s ease-in-out infinite;
    }

    .status-effect.status-positive .status-icon {
        animation: glow 2s ease-in-out infinite;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
    }

    @keyframes glow {
        0%, 100% {
            box-shadow: 0 0 5px var(--status-color);
            transform: scale(1);
        }
        50% {
            box-shadow: 0 0 15px var(--status-color);
            transform: scale(1.05);
        }
    }

    /* Responsive */
    @media (max-width: 768px) {
        .status-effects-container {
            padding: 12px;
        }

        .status-effect {
            gap: 8px;
            padding: 8px;
        }

        .status-icon {
            width: 35px;
            height: 35px;
            font-size: 1.2rem;
        }

        .timer-circle {
            width: 25px;
            height: 25px;
        }

        .education-text {
            font-size: 0.8rem;
        }
    }
</style>