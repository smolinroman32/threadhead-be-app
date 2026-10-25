import { DomainError } from '../../../../shared/errors/domain.error.js';

export class SocialProviderPermissionDeniedError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('The provider refused the request for a missing permission.');
    }
}
