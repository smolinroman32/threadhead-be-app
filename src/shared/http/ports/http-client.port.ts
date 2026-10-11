export type HttpOptions = {
    query?: Record<string, string>;
    headers?: Record<string, string>;
    timeoutMs?: number;
};

export type HttpBodyOptions = HttpOptions & {
    json?: unknown;
    form?: Record<string, string>;
};

export type HttpResponse = {
    status: number;
    body: unknown;
};

// 4xx and 5xx are returned, not thrown, so the caller decides whether a failure is final or transient.
// A timeout or network failure throws HttpTransportError.
export abstract class HttpClientPort {
    abstract get(url: string, options?: HttpOptions): Promise<HttpResponse>;
    abstract post(url: string, options?: HttpBodyOptions): Promise<HttpResponse>;
    abstract patch(url: string, options?: HttpBodyOptions): Promise<HttpResponse>;
    abstract delete(url: string, options?: HttpOptions): Promise<HttpResponse>;
}
