export class SocialProviderUnavailableError extends Error {
    constructor() {
        super('The provider is temporarily unavailable.');
        this.name = 'SocialProviderUnavailableError';
    }
}
