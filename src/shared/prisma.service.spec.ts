import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('disconnects from the database on shutdown', async () => {
        vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/db');
        const service = new PrismaService();
        const disconnect = vi.spyOn(service, '$disconnect').mockResolvedValue();

        await service.onModuleDestroy();

        expect(disconnect).toHaveBeenCalledOnce();
    });
});
