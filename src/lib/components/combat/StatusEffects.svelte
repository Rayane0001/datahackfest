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
        overfitting: '#dc2626',
        underfitting: '#2563eb',
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
        return statusColors[statusName] || '#64748b';
    }

    function getStatusTypeClass(type: string): string {
        switch (type) {
            case 'positive': return 'status-positive';
            case 'negative': return 'status-negative';
            default: return 'status-neutral';
        }
    }

    function formatStatusName(name: string): string {
        return name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
</script>

{#if statusEffects.length > 0}
    <div class="status-effects-container">
        <div class="status-header">
            <span class="status-title">🎯 {fighterName}'s Status Effects</span>
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
                            {formatStatusName(status.name)}
                        </div>
                        <div class="status-duration">
                            {status.turnsRemaining} turn{status.turnsRemaining !== 1 ? 's' : ''} remaining
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
                                        stroke="rgba(148, 163, 184, 0.2)"
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
                                        stroke-dasharray="{Math.min(100, (status.turnsRemaining / 5) * 100)}, 100"
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
        background: rgba(148, 163, 184, 0.1);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 12px;
        padding: 18px;
        margin: 15px 0;
        font-family: 'Courier New', monospace;
        backdrop-filter: blur(5px);
    }

    :global(.theme-dark) .status-effects-container {
        background: rgba(71, 85, 105, 0.15);
        border-color: rgba(71, 85, 105, 0.3);
    }

    .status-header {
        text-align: center;
        margin-bottom: 18px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.3);
    }

    .status-title {
        color: #3b82f6;
        font-weight: 600;
        font-size: 1.1rem;
    }

    .status-effects-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 18px;
    }

    .status-effect {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px;
        background: rgba(148, 163, 184, 0.05);
        border: 1px solid var(--status-color);
        border-radius: 10px;
        transition: all 0.3s ease;
        position: relative;
        backdrop-filter: blur(3px);
    }

    .status-effect:hover {
        background: rgba(148, 163, 184, 0.1);
        transform: translateX(3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .status-effect.status-positive {
        background: rgba(34, 197, 94, 0.12);
        border-color: #22c55e;
    }

    .status-effect.status-negative {
        background: rgba(220, 38, 38, 0.12);
        border-color: #dc2626;
    }

    .status-effect.status-neutral {
        background: rgba(100, 116, 139, 0.12);
        border-color: #64748b;
    }

    .status-icon {
        font-size: 1.6rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 45px;
        height: 45px;
        background: rgba(148, 163, 184, 0.1);
        border-radius: 50%;
        border: 2px solid var(--status-color);
        flex-shrink: 0;
    }

    .status-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .status-name {
        color: #f1f5f9;
        font-weight: 600;
        font-size: 0.95rem;
    }

    .status-duration {
        color: #cbd5e1;
        font-size: 0.85rem;
    }

    .status-timer {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .timer-circle {
        position: relative;
        width: 35px;
        height: 35px;
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
        font-size: 0.8rem;
        font-weight: 600;
    }

    .status-education {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(37, 99, 235, 0.1);
        border: 1px solid #2563eb;
        border-radius: 8px;
        margin-top: 12px;
    }

    .education-icon {
        font-size: 1.3rem;
        color: #3b82f6;
        flex-shrink: 0;
    }

    .education-text {
        color: #e2e8f0;
        font-size: 0.9rem;
        line-height: 1.5;
    }

    /* Animations for different status types */
    .status-effect.status-negative .status-icon {
        animation: shake 2.5s ease-in-out infinite;
    }

    .status-effect.status-positive .status-icon {
        animation: glow 2.5s ease-in-out infinite;
    }

    .status-effect.status-neutral .status-icon {
        animation: pulse 3s ease-in-out infinite;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
        20%, 40%, 60%, 80% { transform: translateX(2px); }
    }

    @keyframes glow {
        0%, 100% {
            box-shadow: 0 0 8px var(--status-color);
            transform: scale(1);
        }
        50% {
            box-shadow: 0 0 20px var(--status-color);
            transform: scale(1.05);
        }
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.8;
            transform: scale(0.98);
        }
    }

    /* Responsive */
    @media (max-width: 768px) {
        .status-effects-container {
            padding: 15px;
            margin: 12px 0;
        }

        .status-effect {
            gap: 12px;
            padding: 10px;
        }

        .status-icon {
            width: 40px;
            height: 40px;
            font-size: 1.4rem;
        }

        .timer-circle {
            width: 30px;
            height: 30px;
        }

        .timer-number {
            font-size: 0.75rem;
        }

        .education-text {
            font-size: 0.85rem;
        }

        .status-name {
            font-size: 0.9rem;
        }

        .status-duration {
            font-size: 0.8rem;
        }
    }

    @media (max-width: 480px) {
        .status-effects-container {
            padding: 12px;
        }

        .status-effect {
            gap: 10px;
            padding: 8px;
        }

        .status-icon {
            width: 35px;
            height: 35px;
            font-size: 1.2rem;
        }

        .timer-circle {
            width: 28px;
            height: 28px;
        }

        .status-name {
            font-size: 0.85rem;
        }

        .status-duration {
            font-size: 0.75rem;
        }

        .education-text {
            font-size: 0.8rem;
        }
    }
</style>