import { OpportunityFeedEntity } from '../../../domain/entities/opportunity-feed.entity.js';
import { MAX_FEEDS_PER_USER } from '../../../domain/entities/opportunity-feed-fields.js';
import { OpportunityFeedInvalidError } from '../../../domain/errors/opportunity-feed-invalid.error.js';
import { OpportunityFeedNotFoundError } from '../../../domain/errors/opportunity-feed-not-found.error.js';
import type { OpportunityFeedRepositoryPort } from '../../../domain/ports/opportunity-feed-repository.port.js';
import { CreateFeedFromOnboardingUseCase } from '../create-feed-from-onboarding.use-case.js';
import { CreateOpportunityFeedUseCase } from '../create-opportunity-feed.use-case.js';
import { DeleteOpportunityFeedUseCase } from '../delete-opportunity-feed.use-case.js';
import { FindFeedByOnboardingUseCase } from '../find-feed-by-onboarding.use-case.js';
import { GetOpportunityFeedUseCase } from '../get-opportunity-feed.use-case.js';
import { ListOpportunityFeedsUseCase } from '../list-opportunity-feeds.use-case.js';
import { UpdateOpportunityFeedUseCase } from '../update-opportunity-feed.use-case.js';

const entity = new OpportunityFeedEntity('feed-id', {
    userId: 'user-id',
    name: 'AI agents',
    intent: 'Find people asking about AI agents',
    targetAudience: 'Founders',
    includeTerms: ['ai agents'],
    excludeTerms: [],
    languages: ['en'],
    freshnessHours: 24,
    minScore: 60,
    isActive: true,
    createdAt: new Date('2026-10-14'),
    updatedAt: new Date('2026-10-14'),
});

describe('opportunity feed use cases', () => {
    const repository = {
        listByUser: vi.fn(),
        findByIdForUser: vi.fn(),
        findByOnboardingId: vi.fn(),
        createWithinLimit: vi.fn(),
        updateLocked: vi.fn(),
        deleteByIdForUser: vi.fn(),
    };
    const port = repository as unknown as OpportunityFeedRepositoryPort;

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('create applies the defaults, the language and no onboarding id', async () => {
        repository.createWithinLimit.mockResolvedValue(entity);

        const created = await new CreateOpportunityFeedUseCase(port).execute('user-id', {
            name: 'AI agents',
            intent: 'Find people asking about AI agents',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
        });

        expect(created).toBe(entity);
        expect(repository.createWithinLimit).toHaveBeenCalledWith(
            {
                userId: 'user-id',
                onboardingId: null,
                languages: ['en'],
                name: 'AI agents',
                intent: 'Find people asking about AI agents',
                targetAudience: 'Founders',
                includeTerms: ['ai agents'],
                excludeTerms: [],
                freshnessHours: 24,
                minScore: 60,
                isActive: true,
            },
            MAX_FEEDS_PER_USER,
        );
    });

    it('create rejects an invalid input before it touches the repository', async () => {
        await expect(
            Promise.resolve().then(() =>
                new CreateOpportunityFeedUseCase(port).execute('user-id', {
                    name: '',
                    intent: 'Find people asking about AI agents',
                    targetAudience: 'Founders',
                    includeTerms: ['ai agents'],
                }),
            ),
        ).rejects.toBeInstanceOf(OpportunityFeedInvalidError);
        expect(repository.createWithinLimit).not.toHaveBeenCalled();
    });

    it('createFromOnboarding names the feed from the intent and passes the onboarding id', async () => {
        repository.createWithinLimit.mockResolvedValue(entity);

        await new CreateFeedFromOnboardingUseCase(port).execute({
            userId: 'user-id',
            onboardingId: 'onboarding-id',
            intent: 'Find people who are asking how to evaluate and compare AI agent frameworks for teams',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
            excludeTerms: ['crypto'],
        });

        const [data, limit] = repository.createWithinLimit.mock.calls[0];
        expect(data).toMatchObject({
            userId: 'user-id',
            onboardingId: 'onboarding-id',
            languages: ['en'],
            excludeTerms: ['crypto'],
            freshnessHours: 24,
            minScore: 60,
            isActive: true,
        });
        expect(data.name.length).toBeLessThanOrEqual(60);
        expect(limit).toBe(MAX_FEEDS_PER_USER);
    });

    it('list returns the feeds of the user', async () => {
        repository.listByUser.mockResolvedValue([entity]);

        await expect(new ListOpportunityFeedsUseCase(port).execute('user-id')).resolves.toEqual([entity]);
        expect(repository.listByUser).toHaveBeenCalledWith('user-id');
    });

    it('get returns the feed or throws not found', async () => {
        repository.findByIdForUser.mockResolvedValueOnce(entity).mockResolvedValueOnce(null);
        const useCase = new GetOpportunityFeedUseCase(port);

        await expect(useCase.execute('user-id', 'feed-id')).resolves.toBe(entity);
        await expect(useCase.execute('user-id', 'missing')).rejects.toBeInstanceOf(
            OpportunityFeedNotFoundError,
        );
    });

    it('update merges the changes into the locked feed', async () => {
        repository.updateLocked.mockResolvedValue(entity);

        await new UpdateOpportunityFeedUseCase(port).execute('user-id', 'feed-id', { minScore: 80 });

        expect(repository.updateLocked).toHaveBeenCalledWith('feed-id', 'user-id', expect.any(Function));
        const mutate = repository.updateLocked.mock.calls[0][2] as (
            current: OpportunityFeedEntity,
        ) => unknown;
        expect(mutate(entity)).toMatchObject({ minScore: 80, name: 'AI agents' });
    });

    it('update throws not found when the repository finds no feed of the user', async () => {
        repository.updateLocked.mockResolvedValue(null);

        await expect(
            new UpdateOpportunityFeedUseCase(port).execute('user-id', 'feed-id', { minScore: 80 }),
        ).rejects.toBeInstanceOf(OpportunityFeedNotFoundError);
    });

    it('delete succeeds for an owned feed and throws not found otherwise', async () => {
        repository.deleteByIdForUser.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        const useCase = new DeleteOpportunityFeedUseCase(port);

        await expect(useCase.execute('user-id', 'feed-id')).resolves.toBeUndefined();
        await expect(useCase.execute('user-id', 'feed-id')).rejects.toBeInstanceOf(
            OpportunityFeedNotFoundError,
        );
    });

    it('findByOnboardingId returns the feed or null', async () => {
        repository.findByOnboardingId.mockResolvedValueOnce(entity).mockResolvedValueOnce(null);
        const useCase = new FindFeedByOnboardingUseCase(port);

        await expect(useCase.execute('user-id', 'onboarding-id')).resolves.toBe(entity);
        await expect(useCase.execute('user-id', 'onboarding-id')).resolves.toBeNull();
    });
});
