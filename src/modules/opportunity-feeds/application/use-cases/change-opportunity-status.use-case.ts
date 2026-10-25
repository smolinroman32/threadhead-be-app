import { Injectable } from '@nestjs/common';
import { nextOpportunityStatus, type ReviewStatus } from '../../domain/entities/opportunity.entity.js';
import { OpportunityNotFoundError } from '../../domain/errors/opportunity-not-found.error.js';
import { OpportunityRepositoryPort } from '../../domain/ports/opportunity-repository.port.js';

@Injectable()
export class ChangeOpportunityStatusUseCase {
    constructor(private readonly opportunities: OpportunityRepositoryPort) {}

    async execute(userId: string, id: string, status: ReviewStatus) {
        const opportunity = await this.opportunities.findByIdForUser(id, userId);

        if (!opportunity) throw new OpportunityNotFoundError();

        const next = nextOpportunityStatus(opportunity.status, status);

        return next === opportunity.status ? opportunity : this.opportunities.updateStatus(id, next);
    }
}
