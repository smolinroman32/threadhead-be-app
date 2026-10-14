import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { FetchHttpClient } from '../fetch-http-client.js';
import { HttpTransportError } from '../../errors/http-transport.error.js';

describe('FetchHttpClient', () => {
    let server: Server;
    let base: string;
    const client = new FetchHttpClient();

    beforeAll(async () => {
        server = createServer((req, res) => {
            const chunks: Buffer[] = [];
            req.on('data', (chunk: Buffer) => chunks.push(chunk));
            req.on('end', () => {
                if (req.url?.startsWith('/slow')) return;
                const status = req.url?.startsWith('/status/') ? Number(req.url.split('/')[2]) : 200;
                res.writeHead(status, { 'content-type': 'application/json' });
                res.end(
                    JSON.stringify({
                        method: req.method,
                        url: req.url,
                        contentType: req.headers['content-type'] ?? null,
                        custom: req.headers['x-custom'] ?? null,
                        body: Buffer.concat(chunks).toString(),
                    }),
                );
            });
        });
        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
        base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
    });

    it('sends query and headers on GET and parses the JSON body', async () => {
        const response = await client.get(`${base}/path`, {
            query: { a: '1', b: 'x y' },
            headers: { 'x-custom': 'v' },
        });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ method: 'GET', url: '/path?a=1&b=x+y', custom: 'v' });
    });

    it('sends a form body on POST', async () => {
        const response = await client.post(`${base}/token`, {
            form: { code: 'abc', grant_type: 'authorization_code' },
        });

        expect(response.body).toMatchObject({
            method: 'POST',
            contentType: 'application/x-www-form-urlencoded',
            body: 'code=abc&grant_type=authorization_code',
        });
    });

    it('sends a JSON body on PATCH and uses the DELETE method', async () => {
        const patched = await client.patch(`${base}/x`, { json: { name: 'n' } });
        const deleted = await client.delete(`${base}/x`);

        expect(patched.body).toMatchObject({
            method: 'PATCH',
            contentType: 'application/json',
            body: '{"name":"n"}',
        });
        expect(deleted.body).toMatchObject({ method: 'DELETE' });
    });

    it('returns 4xx and 5xx responses instead of throwing', async () => {
        await expect(client.get(`${base}/status/400`)).resolves.toMatchObject({ status: 400 });
        await expect(client.get(`${base}/status/503`)).resolves.toMatchObject({ status: 503 });
    });

    it('throws HttpTransportError on a timeout', async () => {
        await expect(client.get(`${base}/slow`, { timeoutMs: 50 })).rejects.toBeInstanceOf(
            HttpTransportError,
        );
    });

    it('throws HttpTransportError when the host is unreachable', async () => {
        await expect(client.get('http://127.0.0.1:1/', { timeoutMs: 1000 })).rejects.toBeInstanceOf(
            HttpTransportError,
        );
    });
});
