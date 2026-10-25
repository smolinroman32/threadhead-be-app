export class LlmUnavailableError extends Error {
    constructor(detail?: string) {
        super(
            detail
                ? `The LLM provider is unavailable or refused the request. ${detail}`
                : 'The LLM provider is unavailable or refused the request.',
        );
        this.name = 'LlmUnavailableError';
    }
}
