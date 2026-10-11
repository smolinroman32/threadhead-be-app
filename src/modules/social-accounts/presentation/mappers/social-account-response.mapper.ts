import type { SocialAccountEntity } from '../../domain/entities/social-account.entity.js';
import type { SocialAccountResponseDto } from '../dto/social-account-response.dto.js';

export class SocialAccountResponseMapper {
    static toDto(account: SocialAccountEntity): SocialAccountResponseDto {
        return {
            id: account.id,
            provider: account.provider,
            username: account.username,
            avatarUrl: account.avatarUrl,
            scopes: account.scopes,
            isActive: account.isActive,
            tokenExpiresAt: account.tokenExpiresAt,
            createdAt: account.createdAt,
        };
    }
}
