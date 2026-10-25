import { OpportunityFeedEntity } from '../../../domain/entities/opportunity-feed.entity.js';
import { MAX_FEEDS_PER_USER } from '../../../domain/entities/opportunity-feed-fields.js';
import { OpportunityFeedInvalidError } from '../../../domain/errors/opportunity-feed-invalid.error.js';
import { OpportunityFeedNotFoundError } from '../../../domain/errors/opportunity-feed-not-found.error.js';
import type { SocialAccountsService } from '../../../../social-accounts/application/social-accounts.service.js';
import { SocialAccountNotFoundError } from '../../../../social-accounts/domain/errors/social-account-not-found.error.js';
import { OpportunityFeedAccountLockedError } from '../../../domain/errors/opportunity-feed-account-locked.error.js';
import type {
    OpportunityFeedRepositoryPort,
    OpportunityFeedUpdate,
} from '../../../domain/ports/opportunity-feed-repository.port.js';
import { CreateFeedFromOnboardingUseCase } from '../create-feed-from-onboarding.use-case.js';
import { CreateOpportunityFeedUseCase } from '../create-opportunity-feed.use-case.js';
import { DeleteOpportunityFeedUseCase } from '../delete-opportunity-feed.use-case.js';
import { FindFeedByOnboardingUseCase } from '../find-feed-by-onboarding.use-case.js';
import { GetOpportunityFeedUseCase } from '../get-opportunity-feed.use-case.js';
import { ListOpportunityFeedsUseCase } from '../list-opportunity-feeds.use-case.js';
import type { QueueDiscoveryRunUseCase } from '../queue-discovery-run.use-case.js';
import { UpdateOpportunityFeedUseCase } from '../update-opportunity-feed.use-case.js';

const entity = new OpportunityFeedEntity('feed-id', {
    userId: 'user-id',
    name: 'AI agents',
    description: '',
    color: '#5F947B',
    intent: 'Find people asking about AI agents',
    targetAudience: 'Founders',
    includeTerms: ['ai agents'],
    excludeTerms: [],
    languages: ['en'],
    socialAccountId: null,
    scoringVersion: 1,
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
    const socialAccounts = { list: vi.fn() };
    const accounts = socialAccounts as unknown as SocialAccountsService;
    const discoveryRuns = { afterChange: vi.fn() };
    const discovery = discoveryRuns as unknown as QueueDiscoveryRunUseCase;
    const account = (id: string, isActive = true) => ({ id, isActive });
    const mutationOf = () =>
        repository.updateLocked.mock.calls[0][2] as (current: OpportunityFeedEntity) => OpportunityFeedUpdate;
    const feedWith = (overrides: Partial<{ socialAccountId: string | null; isActive: boolean }>) =>
        new OpportunityFeedEntity('feed-id', {
            userId: entity.userId,
            ...entity.fields,
            languages: entity.languages,
            socialAccountId: entity.socialAccountId,
            scoringVersion: entity.scoringVersion,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            ...overrides,
        });

    beforeEach(() => {
        vi.resetAllMocks();
        socialAccounts.list.mockResolvedValue([]);
    });

    it('create applies the defaults, the language and no onboarding id', async () => {
        repository.createWithinLimit.mockResolvedValue(entity);

        const created = await new CreateOpportunityFeedUseCase(port, accounts, discovery).execute('user-id', {
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
                socialAccountId: null,
                languages: ['en'],
                name: 'AI agents',
                description: '',
                color: '#5F947B',
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

    it('create binds the only active account when none is sent', async () => {
        repository.createWithinLimit.mockResolvedValue(entity);
        socialAccounts.list.mockResolvedValue([account('account-a'), account('stale', false)]);

        await new CreateOpportunityFeedUseCase(port, accounts, discovery).execute('user-id', {
            name: 'AI agents',
            intent: 'Find people asking about AI agents',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
        });

        expect(repository.createWithinLimit.mock.calls[0][0]).toMatchObject({ socialAccountId: 'account-a' });
    });

    it('create leaves the account unset when the user has several active ones', async () => {
        repository.createWithinLimit.mockResolvedValue(entity);
        socialAccounts.list.mockResolvedValue([account('account-a'), account('account-b')]);

        await new CreateOpportunityFeedUseCase(port, accounts, discovery).execute('user-id', {
            name: 'AI agents',
            intent: 'Find people asking about AI agents',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
        });

        expect(repository.createWithinLimit.mock.calls[0][0]).toMatchObject({ socialAccountId: null });
    });

    it('create binds a sent account the user owns and refuses a foreign one', async () => {
        repository.createWithinLimit.mockResolvedValue(entity);
        socialAccounts.list.mockResolvedValue([account('account-a'), account('account-b')]);
        const useCase = new CreateOpportunityFeedUseCase(port, accounts, discovery);
        const input = {
            name: 'AI agents',
            intent: 'Find people asking about AI agents',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
        };

        await useCase.execute('user-id', { ...input, socialAccountId: 'account-b' });
        expect(repository.createWithinLimit.mock.calls[0][0]).toMatchObject({ socialAccountId: 'account-b' });

        await expect(
            useCase.execute('user-id', { ...input, socialAccountId: 'foreign' }),
        ).rejects.toBeInstanceOf(SocialAccountNotFoundError);
        expect(repository.createWithinLimit).toHaveBeenCalledTimes(1);
    });

    it('create and createFromOnboarding queue the first discovery run of the new feed', async () => {
        repository.createWithinLimit.mockResolvedValue(entity);

        await new CreateOpportunityFeedUseCase(port, accounts, discovery).execute('user-id', {
            name: 'AI agents',
            intent: 'Find people asking about AI agents',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
        });
        await new CreateFeedFromOnboardingUseCase(port, accounts, discovery).execute({
            userId: 'user-id',
            onboardingId: 'onboarding-id',
            intent: 'Find people asking about AI agents',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
            excludeTerms: [],
        });

        expect(discoveryRuns.afterChange.mock.calls).toEqual([
            ['feed-id', { criteriaChanged: true, resumed: false }],
            ['feed-id', { criteriaChanged: true, resumed: false }],
        ]);
    });

    it('update reports a criteria change and a resume to the discovery trigger', async () => {
        repository.updateLocked.mockImplementation(async (_id, _user, mutate) => {
            mutate(feedWith({ isActive: false }));
            return entity;
        });

        await new UpdateOpportunityFeedUseCase(port, accounts, discovery).execute('user-id', 'feed-id', {
            isActive: true,
            intent: 'Find people comparing AI agent frameworks',
        });

        expect(discoveryRuns.afterChange).toHaveBeenCalledWith('feed-id', {
            criteriaChanged: true,
            resumed: true,
        });
    });

    it('create rejects an invalid input before it touches the repository', async () => {
        await expect(
            Promise.resolve().then(() =>
                new CreateOpportunityFeedUseCase(port, accounts, discovery).execute('user-id', {
                    name: '',
                    intent: 'Find people asking about AI agents',
                    targetAudience: 'Founders',
                    includeTerms: ['ai agents'],
                }),
            ),
        ).rejects.toBeInstanceOf(OpportunityFeedInvalidError);
        expect(repository.createWithinLimit).not.toHaveBeenCalled();
    });

    it('createFromOnboarding names the feed, passes the onboarding id and binds the only account', async () => {
        repository.createWithinLimit.mockResolvedValue(entity);
        socialAccounts.list.mockResolvedValue([account('account-a')]);

        await new CreateFeedFromOnboardingUseCase(port, accounts, discovery).execute({
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
            socialAccountId: 'account-a',
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

    it('update merges the changes into the locked feed and keeps the criteria version', async () => {
        repository.updateLocked.mockResolvedValue(entity);

        await new UpdateOpportunityFeedUseCase(port, accounts, discovery).execute('user-id', 'feed-id', {
            minScore: 80,
        });

        expect(repository.updateLocked).toHaveBeenCalledWith('feed-id', 'user-id', expect.any(Function));
        expect(mutationOf()(entity)).toEqual({
            fields: expect.objectContaining({ minScore: 80, name: 'AI agents' }),
            socialAccountId: null,
            criteriaChanged: false,
        });
        expect(socialAccounts.list).not.toHaveBeenCalled();
    });

    it('update reports a criteria change only for a real change of the criteria', async () => {
        repository.updateLocked.mockResolvedValue(entity);
        const useCase = new UpdateOpportunityFeedUseCase(port, accounts, discovery);

        await useCase.execute('user-id', 'feed-id', { includeTerms: ['AI AGENTS'] });
        await useCase.execute('user-id', 'feed-id', { intent: 'Find people comparing AI agent frameworks' });

        const [same, changed] = repository.updateLocked.mock.calls.map((call) =>
            (call[2] as (current: OpportunityFeedEntity) => OpportunityFeedUpdate)(entity),
        );
        expect(same.criteriaChanged).toBe(false);
        expect(changed.criteriaChanged).toBe(true);
    });

    it('update binds an owned account once and refuses to replace it', async () => {
        repository.updateLocked.mockResolvedValue(entity);
        socialAccounts.list.mockResolvedValue([account('account-a'), account('account-b')]);

        await new UpdateOpportunityFeedUseCase(port, accounts, discovery).execute('user-id', 'feed-id', {
            socialAccountId: 'account-b',
        });

        expect(socialAccounts.list).toHaveBeenCalledWith('user-id');
        expect(mutationOf()(feedWith({ socialAccountId: null })).socialAccountId).toBe('account-b');
        expect(() => mutationOf()(feedWith({ socialAccountId: 'account-a' }))).toThrow(
            OpportunityFeedAccountLockedError,
        );
    });

    it('update refuses an account the user does not own before it locks the feed', async () => {
        socialAccounts.list.mockResolvedValue([account('account-a')]);

        await expect(
            new UpdateOpportunityFeedUseCase(port, accounts, discovery).execute('user-id', 'feed-id', {
                socialAccountId: 'foreign',
            }),
        ).rejects.toBeInstanceOf(SocialAccountNotFoundError);
        expect(repository.updateLocked).not.toHaveBeenCalled();
    });

    it('update throws not found when the repository finds no feed of the user', async () => {
        repository.updateLocked.mockResolvedValue(null);

        await expect(
            new UpdateOpportunityFeedUseCase(port, accounts, discovery).execute('user-id', 'feed-id', {
                minScore: 80,
            }),
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
