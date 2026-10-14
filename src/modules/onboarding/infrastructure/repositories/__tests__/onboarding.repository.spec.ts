import { Prisma } from '../../../../../generated/prisma/client.js';
import type { PrismaService } from '../../../../../shared/prisma.service.js';
import { OnboardingEntity } from '../../../domain/entities/onboarding.entity.js';
import { OnboardingVersionConflictError } from '../../../domain/errors/onboarding-version-conflict.error.js';
import { OnboardingRepository } from '../onboarding.repository.js';

const row = {
    id: 'onboarding-id',
    userId: 'user-id',
    currentStep: 'PREFERENCES' as const,
    status: 'IN_PROGRESS' as const,
    draft: { intent: 'Find people asking about AI agents', targetAudience: 'Founders' },
    version: 1,
    createdAt: new Date('2026-10-14'),
    updatedAt: new Date('2026-10-14'),
    completedAt: null,
};

const entity = (version: number) =>
    new OnboardingEntity({
        userId: 'user-id',
        currentStep: 'PREFERENCES',
        status: 'IN_PROGRESS',
        draft: row.draft,
        version,
    });

const knownError = (code: string) =>
    new Prisma.PrismaClientKnownRequestError('database error', { code, clientVersion: 'test' });

describe('OnboardingRepository', () => {
    const onboarding = { findUnique: vi.fn(), create: vi.fn(), updateMany: vi.fn() };
    const repository = new OnboardingRepository({ onboarding } as unknown as PrismaService);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('maps the row of the user to an entity', async () => {
        onboarding.findUnique.mockResolvedValue(row);

        const found = await repository.findByUserId('user-id');

        expect(onboarding.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-id' } });
        expect(found).toBeInstanceOf(OnboardingEntity);
        expect(found).toMatchObject({
            userId: 'user-id',
            currentStep: 'PREFERENCES',
            draft: row.draft,
            version: 1,
        });
    });

    it('returns null when the user has no row', async () => {
        onboarding.findUnique.mockResolvedValue(null);

        await expect(repository.findByUserId('user-id')).resolves.toBeNull();
    });

    it('inserts the first save', async () => {
        onboarding.create.mockResolvedValue(row);

        await repository.save(entity(1), 0);

        expect(onboarding.create).toHaveBeenCalledWith({
            data: {
                userId: 'user-id',
                currentStep: 'PREFERENCES',
                status: 'IN_PROGRESS',
                draft: row.draft,
                version: 1,
            },
        });
        expect(onboarding.updateMany).not.toHaveBeenCalled();
    });

    it('reports a lost first-insert race as a version conflict', async () => {
        onboarding.create.mockRejectedValue(knownError('P2002'));

        await expect(repository.save(entity(1), 0)).rejects.toBeInstanceOf(OnboardingVersionConflictError);
    });

    it('lets any other insert error through unchanged', async () => {
        const failure = knownError('P2003');
        onboarding.create.mockRejectedValue(failure);

        await expect(repository.save(entity(1), 0)).rejects.toBe(failure);
    });

    it('updates only the row with the expected version', async () => {
        onboarding.updateMany.mockResolvedValue({ count: 1 });

        await repository.save(entity(3), 2);

        expect(onboarding.updateMany).toHaveBeenCalledWith({
            where: { userId: 'user-id', version: 2 },
            data: { currentStep: 'PREFERENCES', status: 'IN_PROGRESS', draft: row.draft, version: 3 },
        });
        expect(onboarding.create).not.toHaveBeenCalled();
    });

    it('reports a version conflict when no row had the expected version', async () => {
        onboarding.updateMany.mockResolvedValue({ count: 0 });

        await expect(repository.save(entity(3), 2)).rejects.toBeInstanceOf(OnboardingVersionConflictError);
    });
});
