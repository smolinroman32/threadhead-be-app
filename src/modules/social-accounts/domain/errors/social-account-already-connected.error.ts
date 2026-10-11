import { DomainError } from '../../../../shared/errors/domain.error.js';

export class SocialAccountAlreadyConnectedError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('This account is already connected by another user.');
    }
}
