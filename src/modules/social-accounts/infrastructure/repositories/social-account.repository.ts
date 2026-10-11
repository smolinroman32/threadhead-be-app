import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma.service.js';
import type { SocialProvider } from '../../domain/entities/social-account.entity.js';
import {
    SocialAccountRepositoryPort,
    type NewSocialAccount,
    type SocialAccountChanges,
} from '../../domain/ports/social-account-repository.port.js';
import { SocialAccountMapper } from '../mappers/social-account.mapper.js';

@Injectable()
export class SocialAccountRepository implements SocialAccountRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async listByUser(userId: string) {
        const rows = await this.prisma.socialAccount.findMany({
            where: { userId },
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

    async deleteByIdForUser(id: string, userId: string) {
        const { count } = await this.prisma.socialAccount.deleteMany({ where: { id, userId } });

        return count > 0;
    }
}
