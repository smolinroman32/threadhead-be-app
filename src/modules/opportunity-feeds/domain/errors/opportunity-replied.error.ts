import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OpportunityRepliedError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('The opportunity was already replied to and cannot change its status.');
    }
}
