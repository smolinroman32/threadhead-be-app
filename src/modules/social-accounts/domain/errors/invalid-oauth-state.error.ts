import { DomainError } from '../../../../shared/errors/domain.error.js';

export class InvalidOAuthStateError extends DomainError {
    readonly kind = 'validation';

    constructor() {
        super('The OAuth state is invalid or expired.');
    }
}
