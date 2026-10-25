import { Injectable } from '@nestjs/common';
import { getEnv } from '../../env/get-env.js';
import { HttpTransportError } from '../../http/errors/http-transport.error.js';
import { HttpClientPort, type HttpResponse } from '../../http/ports/http-client.port.js';
import { LlmInvalidResponseError } from '../errors/llm-invalid-response.error.js';
import { LlmRateLimitedError } from '../errors/llm-rate-limited.error.js';
import { LlmUnavailableError } from '../errors/llm-unavailable.error.js';
import { type LlmJsonRequest, LlmPort } from '../ports/llm.port.js';

type CompletionBody = {
    choices?: { message?: { content?: string | null; refusal?: string | null }; finish_reason?: string }[];
};

const COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 30_000;
const RETRY_DELAYS_MS = [1_000, 2_000];

@Injectable()
export class OpenAiLlmClient extends LlmPort {
    constructor(private readonly http: HttpClientPort) {
        super();
    }

    async completeJson<T>(request: LlmJsonRequest): Promise<T> {
        const response = await this.sendWithRetries(request);

        return parseCompletion<T>(response.body as CompletionBody);
    }

    private async sendWithRetries(request: LlmJsonRequest) {
        for (let attempt = 0; ; attempt++) {
            const failure = await this.send(request);

            if (!(failure instanceof Error)) return failure;
            if (!isRetryable(failure) || attempt >= RETRY_DELAYS_MS.length) throw failure;

            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
        }
    }

    private async send(request: LlmJsonRequest): Promise<HttpResponse | Error> {
        let response: HttpResponse;

        try {
            response = await this.http.post(COMPLETIONS_URL, {
                headers: { authorization: `Bearer ${getEnv('OPENAI_API_KEY')}` },
                json: {
                    model: request.model,
                    messages: [
                        { role: 'system', content: request.system },
                        { role: 'user', content: request.user },
                    ],
                    response_format: {
                        type: 'json_schema',
                        json_schema: { name: request.schemaName, schema: request.schema, strict: true },
                    },
                },
                timeoutMs: TIMEOUT_MS,
            });
        } catch (error) {
            if (error instanceof HttpTransportError) return new RetryableUnavailable(error.message);

            throw error;
        }

        if (response.status === 429) return new LlmRateLimitedError();
        if (response.status >= 500) return new RetryableUnavailable(`status ${response.status}`);
        if (response.status >= 400) return new LlmUnavailableError(`status ${response.status}`);

        return response;
    }
}

class RetryableUnavailable extends LlmUnavailableError {}

function isRetryable(error: Error) {
    return error instanceof LlmRateLimitedError || error instanceof RetryableUnavailable;
}

function parseCompletion<T>(body: CompletionBody | null): T {
    const choice = body?.choices?.[0];
    const content = choice?.message?.content;

    if (!choice || choice.message?.refusal) throw new LlmInvalidResponseError('refused or empty');
    if (choice.finish_reason !== 'stop' || !content) throw new LlmInvalidResponseError('incomplete');

    try {
        return JSON.parse(content) as T;
    } catch {
        throw new LlmInvalidResponseError('not JSON');
    }
}
