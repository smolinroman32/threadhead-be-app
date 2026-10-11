import { DomainError } from '../../../../shared/errors/domain.error.js';

export class SocialProviderRejectedError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('The provider rejected the request or the token.');
    }
}
