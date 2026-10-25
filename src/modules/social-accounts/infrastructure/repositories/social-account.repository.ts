import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma.service.js';
import type { SocialAccountEntity, SocialProvider } from '../../domain/entities/social-account.entity.js';
import {
    SocialAccountRepositoryPort,
    type NewSocialAccount,
    type SocialAccountChanges,
} from '../../domain/ports/social-account-repository.port.js';
import { SocialAccountMapper } from '../mappers/social-account.mapper.js';

const TRANSACTION_TIMEOUT_MS = 15_000;

@Injectable()
export class SocialAccountRepository implements SocialAccountRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async listByUser(userId: string) {
        const rows = await this.prisma.socialAccount.findMany({
            where: { userId, disconnectedAt: null },
            orderBy: { createdAt: 'desc' },
        });

        return rows.map(SocialAccountMapper.toDomain);
    }

    async findById(id: string) {
        const row = await this.prisma.socialAccount.findUnique({ where: { id } });

        return row && SocialAccountMapper.toDomain(row);
    }

    async findByProviderAccount(provider: SocialProvider, providerAccountId: string) {
        const row = await this.prisma.socialAccount.findUnique({
            where: { provider_providerAccountId: { provider, providerAccountId } },
        });

        return row && SocialAccountMapper.toDomain(row);
    }

    async create(data: NewSocialAccount) {
        const account = await this.prisma.socialAccount.create({ data });

        return SocialAccountMapper.toDomain(account);
    }

    async update(id: string, changes: SocialAccountChanges) {
        const account = await this.prisma.socialAccount.update({ where: { id }, data: changes });

        return SocialAccountMapper.toDomain(account);
    }

    mutateLocked(id: string, mutate: (account: SocialAccountEntity) => Promise<SocialAccountChanges | null>) {
        return this.prisma.$transaction(
            async (tx) => {
                const locked = await tx.$queryRaw<{ id: string }[]>`
                    SELECT "id" FROM "SocialAccount" WHERE "id" = ${id}::uuid FOR UPDATE
                `;

                if (locked.length === 0) return null;

                const row = await tx.socialAccount.findUniqueOrThrow({ where: { id } });
                const account = SocialAccountMapper.toDomain(row);
                const changes = await mutate(account);

                if (!changes) return account;

                const updated = await tx.socialAccount.update({ where: { id }, data: changes });

                return SocialAccountMapper.toDomain(updated);
            },
            { timeout: TRANSACTION_TIMEOUT_MS },
        );
    }

    async disconnectForUser(id: string, userId: string) {
        const { count } = await this.prisma.socialAccount.updateMany({
            where: { id, userId, disconnectedAt: null },
            data: {
                disconnectedAt: new Date(),
                isActive: false,
                accessTokenEncrypted: null,
                refreshTokenEncrypted: null,
                tokenExpiresAt: null,
            },
        });

        return count > 0;
    }
}
