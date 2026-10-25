import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OpportunityFeedPausedError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('The feed is paused. Resume it to run discovery.');
    }
}
