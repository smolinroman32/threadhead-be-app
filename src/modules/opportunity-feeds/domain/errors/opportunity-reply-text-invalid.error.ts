import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OpportunityReplyTextInvalidError extends DomainError {
    readonly kind = 'validation';

    constructor() {
        super('A reply must have between 1 and 500 characters.');
    }
}
