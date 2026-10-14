import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OnboardingStepAheadError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('Save the current onboarding step first.');
    }
}
