import type { SocialAccountEntity, SocialProvider } from '../entities/social-account.entity.js';

export type NewSocialAccount = Omit<SocialAccountEntity, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>;
export type SocialAccountChanges = Partial<
    Pick<
        SocialAccountEntity,
        | 'username'
        | 'avatarUrl'
        | 'accessTokenEncrypted'
        | 'refreshTokenEncrypted'
        | 'tokenExpiresAt'
        | 'scopes'
        | 'isActive'
    >
>;

export abstract class SocialAccountRepositoryPort {
    abstract listByUser(userId: string): Promise<SocialAccountEntity[]>;
    abstract findById(id: string): Promise<SocialAccountEntity | null>;
    abstract findByProviderAccount(
        provider: SocialProvider,
        providerAccountId: string,
    ): Promise<SocialAccountEntity | null>;
    abstract create(data: NewSocialAccount): Promise<SocialAccountEntity>;
    abstract update(id: string, changes: SocialAccountChanges): Promise<SocialAccountEntity>;
    abstract deleteByIdForUser(id: string, userId: string): Promise<boolean>;
    abstract mutateLocked(
        id: string,
        mutate: (account: SocialAccountEntity) => Promise<SocialAccountChanges | null>,
    ): Promise<SocialAccountEntity | null>;
}
