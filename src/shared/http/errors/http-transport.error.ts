export class HttpTransportError extends Error {
    constructor(
        public readonly url: string,
        cause: unknown,
    ) {
        super(`HTTP request to ${url} failed`, { cause });
        this.name = 'HttpTransportError';
    }
}
