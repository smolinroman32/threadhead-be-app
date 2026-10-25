export class LlmRateLimitedError extends Error {
    constructor(detail?: string) {
        super(
            detail
                ? `The LLM provider rate limited the request. ${detail}`
                : 'The LLM provider rate limited the request.',
        );
        this.name = 'LlmRateLimitedError';
    }
}
