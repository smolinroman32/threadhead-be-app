import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OpportunityReplyOutcomeUnknownError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super(
            'Threads did not answer in time; the reply may have been published. Check the post before retrying.',
        );
    }
}
