import { HttpTransportError } from '../../../http/errors/http-transport.error.js';
import type { HttpClientPort } from '../../../http/ports/http-client.port.js';
import { LlmInvalidResponseError } from '../../errors/llm-invalid-response.error.js';
import { LlmRateLimitedError } from '../../errors/llm-rate-limited.error.js';
import { LlmUnavailableError } from '../../errors/llm-unavailable.error.js';
import { OpenAiLlmClient } from '../openai-llm.client.js';

describe('OpenAiLlmClient', () => {
    const http = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
    const client = new OpenAiLlmClient(http as unknown as HttpClientPort);
    const schema = { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'] };
    const input = { model: 'model-x', system: 'sys', user: 'usr', schemaName: 'answer', schema };
    const completion = (message: Record<string, unknown>, finishReason = 'stop') => ({
        status: 200,
        body: { choices: [{ message, finish_reason: finishReason }] },
    });

    const run = async () => {
        const result = client.completeJson(input);
        result.catch(() => {});
        await vi.runAllTimersAsync();
        return result;
    };

    beforeEach(() => {
        vi.resetAllMocks();
        vi.useFakeTimers();
        vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
    });

    it('posts a strict JSON schema request and returns the parsed content', async () => {
        http.post.mockResolvedValue(completion({ content: '{"ok":true}' }));

        await expect(run()).resolves.toEqual({ ok: true });
        expect(http.post).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', {
            headers: { authorization: 'Bearer sk-test' },
            json: {
                model: 'model-x',
                messages: [
                    { role: 'system', content: 'sys' },
                    { role: 'user', content: 'usr' },
                ],
                response_format: {
                    type: 'json_schema',
                    json_schema: { name: 'answer', schema, strict: true },
                },
            },
            timeoutMs: 30_000,
        });
    });

    it('retries a rate limit, a server error and a transport error, then succeeds', async () => {
        http.post
            .mockResolvedValueOnce({ status: 429, body: null })
            .mockResolvedValueOnce({ status: 503, body: null })
            .mockResolvedValueOnce(completion({ content: '{"ok":false}' }));

        await expect(run()).resolves.toEqual({ ok: false });
        expect(http.post).toHaveBeenCalledTimes(3);

        http.post
            .mockRejectedValueOnce(new HttpTransportError('https://api.openai.com', new Error('timeout')))
            .mockResolvedValueOnce(completion({ content: '{"ok":true}' }));

        await expect(run()).resolves.toEqual({ ok: true });
    });

    it('gives up after two retries with the error of the last failure', async () => {
        http.post.mockResolvedValue({ status: 429, body: null });
        await expect(run()).rejects.toBeInstanceOf(LlmRateLimitedError);
        expect(http.post).toHaveBeenCalledTimes(3);

        http.post.mockReset();
        http.post.mockResolvedValue({ status: 500, body: null });
        await expect(run()).rejects.toBeInstanceOf(LlmUnavailableError);

        http.post.mockReset();
        http.post.mockRejectedValue(new HttpTransportError('https://api.openai.com', new Error('down')));
        await expect(run()).rejects.toBeInstanceOf(LlmUnavailableError);
    });

    it('does not retry another client error', async () => {
        http.post.mockResolvedValue({ status: 401, body: { error: { message: 'bad key' } } });

        await expect(run()).rejects.toBeInstanceOf(LlmUnavailableError);
        expect(http.post).toHaveBeenCalledTimes(1);
    });

    it.each([
        { name: 'a refusal', response: completion({ refusal: 'no', content: null }) },
        { name: 'a truncated answer', response: completion({ content: '{"ok":' }, 'length') },
        { name: 'content that is not JSON', response: completion({ content: 'sure!' }) },
        { name: 'no choices', response: { status: 200, body: { choices: [] } } },
    ])('reports $name as an invalid response without a retry', async ({ response }) => {
        http.post.mockResolvedValue(response);

        await expect(run()).rejects.toBeInstanceOf(LlmInvalidResponseError);
        expect(http.post).toHaveBeenCalledTimes(1);
    });
});
