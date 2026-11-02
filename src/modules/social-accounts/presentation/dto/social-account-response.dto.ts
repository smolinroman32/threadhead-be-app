import type { SocialProvider } from '../../domain/entities/social-account.entity.js';

export class SocialAccountResponseDto {
    id: string;
    provider: SocialProvider;
    username: string;
    avatarUrl: string | null;
    scopes: string[];
    canReply: boolean;
    isActive: boolean;
    tokenExpiresAt: Date | null;
    createdAt: Date;
}
