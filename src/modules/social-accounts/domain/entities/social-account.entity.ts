export const SOCIAL_PROVIDERS = ['THREADS'] as const;
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

export interface SocialAccountProps {
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
}

export class SocialAccountEntity {
    constructor(
        public readonly id: string,
        private readonly props: SocialAccountProps,
    ) {}

    get userId() {
        return this.props.userId;
    }

    get provider() {
        return this.props.provider;
    }

    get providerAccountId() {
        return this.props.providerAccountId;
    }

    get username() {
        return this.props.username;
    }

    get avatarUrl() {
        return this.props.avatarUrl;
    }

    get accessTokenEncrypted() {
        return this.props.accessTokenEncrypted;
    }

    get refreshTokenEncrypted() {
        return this.props.refreshTokenEncrypted;
    }

    get tokenExpiresAt() {
        return this.props.tokenExpiresAt;
    }

    get scopes() {
        return this.props.scopes;
    }

    get isActive() {
        return this.props.isActive;
    }

    get createdAt() {
        return this.props.createdAt;
    }

    get updatedAt() {
        return this.props.updatedAt;
    }
}
