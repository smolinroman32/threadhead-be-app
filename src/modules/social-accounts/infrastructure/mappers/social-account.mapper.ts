import type { SocialAccount } from '../../../../generated/prisma/client.js';
import { SocialAccountEntity } from '../../domain/entities/social-account.entity.js';

export class SocialAccountMapper {
    static toDomain(raw: SocialAccount): SocialAccountEntity {
        return new SocialAccountEntity({
            id: raw.id,
            userId: raw.userId,
            provider: raw.provider,
            providerAccountId: raw.providerAccountId,
            username: raw.username,
            avatarUrl: raw.avatarUrl,
            accessTokenEncrypted: raw.accessTokenEncrypted,
            refreshTokenEncrypted: raw.refreshTokenEncrypted,
            tokenExpiresAt: raw.tokenExpiresAt,
            scopes: raw.scopes,
            isActive: raw.isActive,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
}
