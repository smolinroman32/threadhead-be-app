import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OnboardingVersionConflictError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('Onboarding changed since it was read. Load it again and retry.');
    }
}
