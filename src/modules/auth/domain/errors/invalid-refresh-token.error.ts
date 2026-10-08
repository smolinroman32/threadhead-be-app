import { DomainError } from '../../../../shared/errors/domain.error.js';

export class InvalidRefreshTokenError extends DomainError {
    readonly kind = 'unauthorized';

    constructor() {
        super('Invalid or expired refresh token.');
    }
}
