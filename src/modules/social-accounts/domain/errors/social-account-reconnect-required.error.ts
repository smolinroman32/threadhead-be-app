import { DomainError } from '../../../../shared/errors/domain.error.js';

export class SocialAccountReconnectRequiredError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('The provider rejected the stored token. Reconnect the account.');
    }
}
