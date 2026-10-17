import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../shared/prisma.service.js';
import type { OnboardingEntity } from '../../domain/entities/onboarding.entity.js';
import { OnboardingVersionConflictError } from '../../domain/errors/onboarding-version-conflict.error.js';
import { OnboardingRepositoryPort } from '../../domain/ports/onboarding-repository.port.js';
import { OnboardingMapper } from '../mappers/onboarding.mapper.js';

@Injectable()
export class OnboardingRepository implements OnboardingRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async findByUserId(userId: string) {
        const row = await this.prisma.onboarding.findUnique({ where: { userId } });

        return row && OnboardingMapper.toDomain(row);
    }

    async save(onboarding: OnboardingEntity, expectedVersion: number) {
        const data = {
            currentStep: onboarding.currentStep,
            status: onboarding.status,
            draft: onboarding.draft,
            version: onboarding.version,
            completedAt: onboarding.completedAt,
        };

        if (expectedVersion === 0) {
            await this.prisma.onboarding
                .create({ data: { userId: onboarding.userId, ...data } })
                .catch((error: unknown) => {
                    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                        throw new OnboardingVersionConflictError();
                    }

                    throw error;
                });

            return;
        }

        const { count } = await this.prisma.onboarding.updateMany({
            where: { userId: onboarding.userId, version: expectedVersion },
            data,
        });

        if (count === 0) throw new OnboardingVersionConflictError();
    }
}
