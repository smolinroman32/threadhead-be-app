import type { SocialAccountsService } from '../../social-accounts/application/social-accounts.service.js';
import { SocialAccountNotFoundError } from '../../social-accounts/domain/errors/social-account-not-found.error.js';

export async function requireOwnedAccount(
    socialAccounts: SocialAccountsService,
    userId: string,
    accountId: string,
) {
    const accounts = await socialAccounts.list(userId);

    if (!accounts.some((account) => account.id === accountId)) throw new SocialAccountNotFoundError();

    return accountId;
}

export async function accountForNewFeed(
    socialAccounts: SocialAccountsService,
    userId: string,
    requested: string | undefined,
) {
    if (requested !== undefined) return requireOwnedAccount(socialAccounts, userId, requested);

    const active = (await socialAccounts.list(userId)).filter((account) => account.isActive);

    return active.length === 1 ? active[0].id : null;
}
