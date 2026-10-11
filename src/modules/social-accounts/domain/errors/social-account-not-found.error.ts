import { DomainError } from '../../../../shared/errors/domain.error.js';

export class SocialAccountNotFoundError extends DomainError {
    readonly kind = 'not_found';

    constructor() {
        super('Social account was not found.');
    }
}
