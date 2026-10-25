import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OpportunityFeedAccountLockedError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('The feed is already bound to another account. Create a new feed for that account.');
    }
}
