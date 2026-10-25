import type { SocialAccountsService } from '../../social-accounts/application/social-accounts.service.js';
import type { OpportunityFeedEntity } from '../domain/entities/opportunity-feed.entity.js';
import type { OpportunityStatus } from '../domain/entities/opportunity.entity.js';
import type { OpportunityReadFilter } from '../domain/ports/opportunity-repository.port.js';

const HOUR_MS = 60 * 60_000;

export async function readFilterFor(
    socialAccounts: SocialAccountsService,
    userId: string,
    feed: OpportunityFeedEntity,
    status: OpportunityStatus,
): Promise<OpportunityReadFilter | null> {
    if (status !== 'NEW') return null;

    const accounts = feed.socialAccountId ? await socialAccounts.list(userId) : [];

    return {
        minScore: feed.minScore,
        publishedSince: new Date(Date.now() - feed.freshnessHours * HOUR_MS),
        excludeAuthor: accounts.find((account) => account.id === feed.socialAccountId)?.username ?? null,
    };
}
