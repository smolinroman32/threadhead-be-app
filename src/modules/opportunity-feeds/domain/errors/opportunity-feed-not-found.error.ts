import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OpportunityFeedNotFoundError extends DomainError {
    readonly kind = 'not_found';

    constructor() {
        super('The opportunity feed was not found.');
    }
}
