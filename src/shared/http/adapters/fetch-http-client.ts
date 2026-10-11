import { Injectable } from '@nestjs/common';
import { HttpTransportError } from '../errors/http-transport.error.js';
import type { HttpBodyOptions, HttpOptions, HttpResponse } from '../ports/http-client.port.js';
import { HttpClientPort } from '../ports/http-client.port.js';

const DEFAULT_TIMEOUT_MS = 10_000;

@Injectable()
export class FetchHttpClient extends HttpClientPort {
    get(url: string, options?: HttpOptions) {
        return this.send('GET', url, options);
    }

    post(url: string, options?: HttpBodyOptions) {
        return this.send('POST', url, options);
    }

    patch(url: string, options?: HttpBodyOptions) {
        return this.send('PATCH', url, options);
    }

    delete(url: string, options?: HttpOptions) {
        return this.send('DELETE', url, options);
    }

    private async send(
        method: string,
        url: string,
        options: (HttpOptions & HttpBodyOptions) | undefined,
    ): Promise<HttpResponse> {
        const target = new URL(url);
        for (const [key, value] of Object.entries(options?.query ?? {})) target.searchParams.set(key, value);

        const headers: Record<string, string> = { ...options?.headers };
        let body: string | undefined;
        if (options?.form) {
            headers['content-type'] = 'application/x-www-form-urlencoded';
            body = new URLSearchParams(options.form).toString();
        } else if (options?.json !== undefined) {
            headers['content-type'] = 'application/json';
            body = JSON.stringify(options.json);
        }

        try {
            const response = await fetch(target, {
                method,
                headers,
                body,
                signal: AbortSignal.timeout(options?.timeoutMs ?? DEFAULT_TIMEOUT_MS),
            });

            return { status: response.status, body: parseBody(await response.text()) };
        } catch (error) {
            throw new HttpTransportError(target.origin + target.pathname, error);
        }
    }
}

function parseBody(text: string): unknown {
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}
