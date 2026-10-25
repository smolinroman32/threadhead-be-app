import { DomainError } from '../../../../shared/errors/domain.error.js';

export class DiscoveryCooldownError extends DomainError {
    readonly kind = 'conflict';

    constructor(readonly nextRunAt: Date) {
        super(`The feed was searched recently. The next search opens at ${nextRunAt.toISOString()}.`);
    }
}
