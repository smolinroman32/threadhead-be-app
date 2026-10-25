export class LlmInvalidResponseError extends Error {
    constructor(detail?: string) {
        super(
            detail
                ? `The LLM answer did not match the requested schema. ${detail}`
                : 'The LLM answer did not match the requested schema.',
        );
        this.name = 'LlmInvalidResponseError';
    }
}
