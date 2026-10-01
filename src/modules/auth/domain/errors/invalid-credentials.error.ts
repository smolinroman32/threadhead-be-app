import { DomainError } from '../../../../shared/errors/domain.error.js';

export class InvalidCredentialsError extends DomainError {
    readonly kind = 'unauthorized';

    constructor() {
        super('Invalid email or password.');
    }
}
