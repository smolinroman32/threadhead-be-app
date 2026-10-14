import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OpportunityFeedLimitReachedError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('The limit of opportunity feeds is reached. Delete a feed first.');
    }
}
