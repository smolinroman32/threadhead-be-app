import type { CreateFeedFromOnboardingUseCase } from '../use-cases/create-feed-from-onboarding.use-case.js';
import type { CreateOpportunityFeedUseCase } from '../use-cases/create-opportunity-feed.use-case.js';
import type { DeleteOpportunityFeedUseCase } from '../use-cases/delete-opportunity-feed.use-case.js';
import type { FindFeedByOnboardingUseCase } from '../use-cases/find-feed-by-onboarding.use-case.js';
import type { GetOpportunityFeedUseCase } from '../use-cases/get-opportunity-feed.use-case.js';
import type { ListOpportunityFeedsUseCase } from '../use-cases/list-opportunity-feeds.use-case.js';
import type { UpdateOpportunityFeedUseCase } from '../use-cases/update-opportunity-feed.use-case.js';
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
    };
    const service = new OpportunityFeedsService(
        useCases.create as unknown as CreateOpportunityFeedUseCase,
        useCases.fromOnboarding as unknown as CreateFeedFromOnboardingUseCase,
        useCases.list as unknown as ListOpportunityFeedsUseCase,
        useCases.get as unknown as GetOpportunityFeedUseCase,
        useCases.update as unknown as UpdateOpportunityFeedUseCase,
        useCases.remove as unknown as DeleteOpportunityFeedUseCase,
        useCases.byOnboarding as unknown as FindFeedByOnboardingUseCase,
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

        expect(useCases.create.execute).toHaveBeenCalledWith('user-id', input);
        expect(useCases.fromOnboarding.execute).toHaveBeenCalledWith(fromOnboarding);
        expect(useCases.list.execute).toHaveBeenCalledWith('user-id');
        expect(useCases.get.execute).toHaveBeenCalledWith('user-id', 'feed-id');
        expect(useCases.update.execute).toHaveBeenCalledWith('user-id', 'feed-id', { minScore: 80 });
        expect(useCases.remove.execute).toHaveBeenCalledWith('user-id', 'feed-id');
        expect(useCases.byOnboarding.execute).toHaveBeenCalledWith('user-id', 'onboarding-id');
    });
});
