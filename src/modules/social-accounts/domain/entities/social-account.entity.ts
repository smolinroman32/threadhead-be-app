export const SOCIAL_PROVIDERS = ['THREADS'] as const;
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

// Tokens are stored encrypted; decrypting is the job of the use case, never of the repository.
export type SocialAccountEntity = {
    id: string;
    userId: string;
    provider: SocialProvider;
    providerAccountId: string;
    username: string;
    avatarUrl: string | null;
    accessTokenEncrypted: string;
    refreshTokenEncrypted: string | null;
    tokenExpiresAt: Date;
    scopes: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};
