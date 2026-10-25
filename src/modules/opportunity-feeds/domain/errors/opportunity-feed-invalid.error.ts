import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OpportunityFeedInvalidError extends DomainError {
    readonly kind = 'validation';
}
