import { EncryptionService } from '../encryption.service.js';

const KEY = 'a'.repeat(64);

describe('EncryptionService', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    const service = () => {
        vi.stubEnv('ENCRYPTION_KEY', KEY);
        return new EncryptionService();
    };

    it('round-trips a value and tags it with the v1 version', () => {
        const encrypted = service().encrypt('threads-access-token');

        expect(encrypted.startsWith('v1.')).toBe(true);
        expect(encrypted).not.toContain('threads-access-token');
        expect(service().decrypt(encrypted)).toBe('threads-access-token');
    });

    it('produces a different ciphertext for the same value each time', () => {
        const s = service();

        expect(s.encrypt('same')).not.toBe(s.encrypt('same'));
    });

    it('rejects a tampered ciphertext', () => {
        const s = service();
        const [version, iv, tag, data] = s.encrypt('secret').split('.');
        const flipped = data.startsWith('A') ? `B${data.slice(1)}` : `A${data.slice(1)}`;

        expect(() => s.decrypt([version, iv, tag, flipped].join('.'))).toThrow();
    });

    it('rejects an unknown version and a malformed value', () => {
        const s = service();
        const [, iv, tag, data] = s.encrypt('secret').split('.');

        expect(() => s.decrypt(['v9', iv, tag, data].join('.'))).toThrow('Unsupported encryption version');
        expect(() => s.decrypt('not-encrypted')).toThrow();
    });

    it('rejects a value encrypted with another key', () => {
        const encrypted = service().encrypt('secret');
        vi.stubEnv('ENCRYPTION_KEY', 'b'.repeat(64));

        expect(() => new EncryptionService().decrypt(encrypted)).toThrow();
    });

    it('refuses to start with a key that is not 32 bytes of hex', () => {
        vi.stubEnv('ENCRYPTION_KEY', 'abcd');
        expect(() => new EncryptionService()).toThrow('ENCRYPTION_KEY must be 64 hex characters');

        vi.stubEnv('ENCRYPTION_KEY', 'z'.repeat(64));
        expect(() => new EncryptionService()).toThrow('ENCRYPTION_KEY must be 64 hex characters');
    });
});
