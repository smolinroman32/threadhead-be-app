import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OpportunityNotFoundError extends DomainError {
    readonly kind = 'not_found';

    constructor() {
        super('Opportunity was not found.');
    }
}
