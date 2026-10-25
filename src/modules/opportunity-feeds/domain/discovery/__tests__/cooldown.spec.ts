import { cooldownEnd } from '../cooldown.js';

const NOW = new Date('2026-10-25T12:00:00Z');
const HOUR = 60 * 60_000;

describe('cooldownEnd', () => {
    it('is the run time plus six hours while that is still ahead', () => {
        expect(cooldownEnd(new Date(NOW.getTime() - HOUR), NOW)).toEqual(new Date(NOW.getTime() + 5 * HOUR));
        expect(cooldownEnd(NOW, NOW)).toEqual(new Date(NOW.getTime() + 6 * HOUR));
    });

    it('is null once the six hours passed, exactly at the boundary included', () => {
        expect(cooldownEnd(new Date(NOW.getTime() - 6 * HOUR), NOW)).toBeNull();
        expect(cooldownEnd(new Date(NOW.getTime() - 7 * HOUR), NOW)).toBeNull();
    });

    it('is null when no run counts', () => {
        expect(cooldownEnd(null, NOW)).toBeNull();
    });
});
