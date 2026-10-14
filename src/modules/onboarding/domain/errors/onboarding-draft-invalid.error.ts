import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OnboardingDraftInvalidError extends DomainError {
    readonly kind = 'validation';
}
