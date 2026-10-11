import { CredentialsService } from './credential.service.js';

describe('CredentialsService', () => {
    const service = new CredentialsService();

    it('verifies a correct password against its hash', async () => {
        const hash = await service.hashPassword('correct horse battery');

        expect(await service.checkPassword('correct horse battery', hash)).toBe(true);
    });

    it('rejects a wrong password', async () => {
        const hash = await service.hashPassword('correct horse battery');

        expect(await service.checkPassword('wrong password here', hash)).toBe(false);
    });

    it('rejects when there is no stored hash', async () => {
        expect(await service.checkPassword('anything', undefined)).toBe(false);
        expect(await service.checkPassword('anything', 'not-a-hash')).toBe(false);
    });

    it('salts every hash', async () => {
        expect(await service.hashPassword('same')).not.toBe(await service.hashPassword('same'));
    });
});
