import { DomainError } from '../../../../shared/errors/domain.error.js';

export class DiscoveryRunNotFoundError extends DomainError {
    readonly kind = 'not_found';

    constructor() {
        super('Discovery run was not found.');
    }
}
