import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OnboardingNotEditableError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('Onboarding is already being completed or is completed and cannot be edited.');
    }
}
