import { DomainError } from '../../../../shared/errors/domain.error.js';

export class UserEmailTakenError extends DomainError {
    readonly kind = 'conflict';

    constructor(public readonly email: string) {
        super(`User with email "${email}" already exists.`);
    }
}
