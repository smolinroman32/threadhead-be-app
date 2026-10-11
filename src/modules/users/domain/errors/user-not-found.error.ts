import { DomainError } from '../../../../shared/errors/domain.error.js';

export class UserNotFoundError extends DomainError {
    readonly kind = 'not_found';

    constructor(public readonly userId: string) {
        super(`User "${userId}" was not found.`);
    }
}
