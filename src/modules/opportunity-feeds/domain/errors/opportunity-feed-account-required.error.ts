import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OpportunityFeedAccountRequiredError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('Connect a Threads account and bind it to the feed to run discovery.');
    }
}
