export class PostMetricsUnavailableError extends Error {
    constructor(reason: string) {
        super(`Post metrics are unavailable: ${reason}.`);
        this.name = 'PostMetricsUnavailableError';
    }
}
