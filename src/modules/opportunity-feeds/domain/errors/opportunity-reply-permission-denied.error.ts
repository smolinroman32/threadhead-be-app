import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OpportunityReplyPermissionDeniedError extends DomainError {
    readonly kind = 'forbidden';

    constructor() {
        super('The connected Threads account has not granted the permissions needed to reply.');
    }
}
