import { Injectable, Logger } from '@nestjs/common';
import { getEnv } from '../../../../shared/env/get-env.js';
import { HttpTransportError } from '../../../../shared/http/errors/http-transport.error.js';
import { SocialAccountsService } from '../../../social-accounts/application/social-accounts.service.js';
import { PostMetricsUnavailableError } from '../../../social-accounts/domain/errors/post-metrics-unavailable.error.js';
import type { OpportunityMetrics } from '../../domain/entities/opportunity.entity.js';
import { OpportunityNotFoundError } from '../../domain/errors/opportunity-not-found.error.js';
import { OpportunityRepositoryPort } from '../../domain/ports/opportunity-repository.port.js';

const METRICS_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class RefreshOpportunityMetricsUseCase {
    private readonly logger = new Logger(RefreshOpportunityMetricsUseCase.name);

    constructor(
        private readonly opportunities: OpportunityRepositoryPort,
        private readonly socialAccounts: SocialAccountsService,
    ) {}

    async execute(userId: string, id: string): Promise<OpportunityMetrics> {
        const opportunity = await this.opportunities.findByIdForUser(id, userId);

        if (!opportunity) throw new OpportunityNotFoundError();

        const stored = opportunity.metrics;

        if (getEnv('THREADS_POST_METRICS_ENABLED', 'false') !== 'true') return stored;
        if (stored.fetchedAt && Date.now() - stored.fetchedAt.getTime() < METRICS_TTL_MS) return stored;

        try {
            const metrics = {
                ...(await this.socialAccounts.getPostMetrics(opportunity.permalink)),
                fetchedAt: new Date(),
            };

            await this.opportunities.saveMetrics(id, metrics);

            return metrics;
        } catch (error) {
            if (!(error instanceof PostMetricsUnavailableError || error instanceof HttpTransportError))
                throw error;

            this.logger.warn(`Metrics refresh failed for opportunity ${id}: ${error.message}`);

            return stored;
        }
    }
}
