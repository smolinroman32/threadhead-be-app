import type { OpportunityFeedsService } from '../../../../opportunity-feeds/application/opportunity-feeds.service.js';
import { OnboardingFeedAdapter } from '../onboarding-feed.adapter.js';

describe('OnboardingFeedAdapter', () => {
    const feeds = { createFromOnboarding: vi.fn(), findByOnboardingId: vi.fn() };
    const adapter = new OnboardingFeedAdapter(feeds as unknown as OpportunityFeedsService);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('creates the feed from the draft and returns only its id', async () => {
        feeds.createFromOnboarding.mockResolvedValue({ id: 'feed-id', name: 'AI agents' });
        const draft = {
            intent: 'Find people asking about AI agents',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
            excludeTerms: [],
        };

        await expect(
            adapter.createFromOnboarding({ userId: 'user-id', onboardingId: 'onboarding-id', draft }),
        ).resolves.toEqual({ feedId: 'feed-id' });
        expect(feeds.createFromOnboarding).toHaveBeenCalledWith({
            userId: 'user-id',
            onboardingId: 'onboarding-id',
            ...draft,
        });
    });

    it('returns the id of the existing feed or null', async () => {
        feeds.findByOnboardingId.mockResolvedValueOnce({ id: 'feed-id' }).mockResolvedValueOnce(null);

        await expect(adapter.findFeedId('user-id', 'onboarding-id')).resolves.toBe('feed-id');
        await expect(adapter.findFeedId('user-id', 'onboarding-id')).resolves.toBeNull();
        expect(feeds.findByOnboardingId).toHaveBeenCalledWith('user-id', 'onboarding-id');
    });
});
