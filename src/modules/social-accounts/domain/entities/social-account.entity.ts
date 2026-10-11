export const SOCIAL_PROVIDERS = ['THREADS'] as const;
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

// Tokens are stored encrypted; decrypting is the job of the use case, never of the repository.
export class SocialAccountEntity {
    readonly id: string;
    readonly userId: string;
    readonly provider: SocialProvider;
    readonly providerAccountId: string;
    readonly username: string;
    readonly avatarUrl: string | null;
    readonly accessTokenEncrypted: string;
    readonly refreshTokenEncrypted: string | null;
    readonly tokenExpiresAt: Date;
    readonly scopes: string[];
    readonly isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: SocialAccountProps) {
        Object.assign(this, props);
    }
}

export type SocialAccountProps = {
    -readonly [K in keyof SocialAccountEntity]: SocialAccountEntity[K];
};
