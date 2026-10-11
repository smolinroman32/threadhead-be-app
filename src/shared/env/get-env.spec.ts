import { getSecret } from './get-env.js';

describe('getSecret', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('returns a secret of at least 32 characters', () => {
        vi.stubEnv('TEST_SECRET', 'x'.repeat(32));

        expect(getSecret('TEST_SECRET')).toBe('x'.repeat(32));
    });

    it('rejects a secret shorter than 32 characters', () => {
        vi.stubEnv('TEST_SECRET', 'x'.repeat(31));

        expect(() => getSecret('TEST_SECRET')).toThrow('TEST_SECRET must be at least 32 characters');
    });

    it('rejects a missing secret', () => {
        vi.stubEnv('TEST_SECRET', '');

        expect(() => getSecret('TEST_SECRET')).toThrow('Missing required environment variable: TEST_SECRET');
    });
});
