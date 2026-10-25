import type { CreateFeedFromOnboardingUseCase } from '../use-cases/create-feed-from-onboarding.use-case.js';
import type { CreateOpportunityFeedUseCase } from '../use-cases/create-opportunity-feed.use-case.js';
import type { DeleteOpportunityFeedUseCase } from '../use-cases/delete-opportunity-feed.use-case.js';
import type { FindFeedByOnboardingUseCase } from '../use-cases/find-feed-by-onboarding.use-case.js';
import type { GetOpportunityFeedUseCase } from '../use-cases/get-opportunity-feed.use-case.js';
import type { ListOpportunityFeedsUseCase } from '../use-cases/list-opportunity-feeds.use-case.js';
import type { UpdateOpportunityFeedUseCase } from '../use-cases/update-opportunity-feed.use-case.js';
import type { ChangeOpportunityStatusUseCase } from '../use-cases/change-opportunity-status.use-case.js';
import type { CountOpportunitiesUseCase } from '../use-cases/count-opportunities.use-case.js';
import type { GetDiscoveryRunUseCase } from '../use-cases/get-discovery-run.use-case.js';
import type { ListOpportunitiesUseCase } from '../use-cases/list-opportunities.use-case.js';
import type { RequestDiscoveryRunUseCase } from '../use-cases/request-discovery-run.use-case.js';
import { OpportunityFeedsService } from '../opportunity-feeds.service.js';

describe('OpportunityFeedsService', () => {
    const useCases = {
        create: { execute: vi.fn() },
        fromOnboarding: { execute: vi.fn() },
        list: { execute: vi.fn() },
        get: { execute: vi.fn() },
        update: { execute: vi.fn() },
        remove: { execute: vi.fn() },
        byOnboarding: { execute: vi.fn() },
        requestRun: { execute: vi.fn() },
        getRun: { execute: vi.fn() },
        listOpportunities: { execute: vi.fn() },
        countOpportunities: { execute: vi.fn() },
        changeStatus: { execute: vi.fn() },
    };
    const service = new OpportunityFeedsService(
        useCases.create as unknown as CreateOpportunityFeedUseCase,
        useCases.fromOnboarding as unknown as CreateFeedFromOnboardingUseCase,
        useCases.list as unknown as ListOpportunityFeedsUseCase,
        useCases.get as unknown as GetOpportunityFeedUseCase,
        useCases.update as unknown as UpdateOpportunityFeedUseCase,
        useCases.remove as unknown as DeleteOpportunityFeedUseCase,
        useCases.byOnboarding as unknown as FindFeedByOnboardingUseCase,
        useCases.requestRun as unknown as RequestDiscoveryRunUseCase,
        useCases.getRun as unknown as GetDiscoveryRunUseCase,
        useCases.listOpportunities as unknown as ListOpportunitiesUseCase,
        useCases.countOpportunities as unknown as CountOpportunitiesUseCase,
        useCases.changeStatus as unknown as ChangeOpportunityStatusUseCase,
    );

    it('delegates every operation to its use case', async () => {
        const input = {
            name: 'AI agents',
            intent: 'Find people asking about AI agents',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
        };
        const fromOnboarding = {
            userId: 'user-id',
            onboardingId: 'onboarding-id',
            intent: input.intent,
            targetAudience: input.targetAudience,
            includeTerms: input.includeTerms,
            excludeTerms: [],
        };

        await service.create('user-id', input);
        await service.createFromOnboarding(fromOnboarding);
        await service.list('user-id');
        await service.get('user-id', 'feed-id');
        await service.update('user-id', 'feed-id', { minScore: 80 });
        await service.delete('user-id', 'feed-id');
        await service.findByOnboardingId('user-id', 'onboarding-id');
        await service.requestRun('user-id', 'feed-id');
        await service.getRun('user-id', 'feed-id', 'latest');
        await service.listOpportunities('user-id', 'feed-id', 'SAVED', 2);
        await service.countOpportunities('user-id', 'feed-id');
        await service.changeOpportunityStatus('user-id', 'opportunity-id', 'DISMISSED');

        expect(useCases.create.execute).toHaveBeenCalledWith('user-id', input);
        expect(useCases.fromOnboarding.execute).toHaveBeenCalledWith(fromOnboarding);
        expect(useCases.list.execute).toHaveBeenCalledWith('user-id');
        expect(useCases.get.execute).toHaveBeenCalledWith('user-id', 'feed-id');
        expect(useCases.update.execute).toHaveBeenCalledWith('user-id', 'feed-id', { minScore: 80 });
        expect(useCases.remove.execute).toHaveBeenCalledWith('user-id', 'feed-id');
        expect(useCases.byOnboarding.execute).toHaveBeenCalledWith('user-id', 'onboarding-id');
        expect(useCases.requestRun.execute).toHaveBeenCalledWith('user-id', 'feed-id');
        expect(useCases.getRun.execute).toHaveBeenCalledWith('user-id', 'feed-id', 'latest');
        expect(useCases.listOpportunities.execute).toHaveBeenCalledWith('user-id', 'feed-id', 'SAVED', 2);
        expect(useCases.countOpportunities.execute).toHaveBeenCalledWith('user-id', 'feed-id');
        expect(useCases.changeStatus.execute).toHaveBeenCalledWith('user-id', 'opportunity-id', 'DISMISSED');
    });
});
