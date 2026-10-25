import { MANUAL_RUN_COOLDOWN_MS } from './discovery.constants.js';

export function cooldownEnd(countedRunAt: Date | null, now: Date) {
    if (!countedRunAt) return null;

    const end = new Date(countedRunAt.getTime() + MANUAL_RUN_COOLDOWN_MS);

    return end.getTime() > now.getTime() ? end : null;
}
