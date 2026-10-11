import type { HttpClientPort } from '../../../../../shared/http/ports/http-client.port.js';
import { SocialProviderRejectedError } from '../../../domain/errors/social-provider-rejected.error.js';
import { SocialProviderUnavailableError } from '../../../domain/errors/social-provider-unavailable.error.js';
import { ThreadsAccountApi } from '../threads-account-api.js';

describe('ThreadsAccountApi', () => {
    const http = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
    const api = new ThreadsAccountApi(http as unknown as HttpClientPort);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('maps the profile', async () => {
        http.get.mockResolvedValue({
            status: 200,
            body: { id: '42', username: 'name', threads_profile_picture_url: 'https://img/x.png' },
        });

        await expect(api.getProfile('token')).resolves.toEqual({
            id: '42',
            username: 'name',
            avatarUrl: 'https://img/x.png',
        });
        expect(http.get).toHaveBeenCalledWith('https://graph.threads.net/v1.0/me', {
            query: { fields: 'id,username,threads_profile_picture_url', access_token: 'token' },
        });
    });

    it('uses a null avatar when the profile has none', async () => {
        http.get.mockResolvedValue({ status: 200, body: { id: '42', username: 'name' } });

        await expect(api.getProfile('token')).resolves.toMatchObject({ avatarUrl: null });
    });

    it('reports a 4xx as a rejection and a 5xx as unavailable', async () => {
        http.get.mockResolvedValueOnce({ status: 401, body: null });
        await expect(api.getProfile('token')).rejects.toBeInstanceOf(SocialProviderRejectedError);

        http.get.mockResolvedValueOnce({ status: 500, body: null });
        await expect(api.getProfile('token')).rejects.toBeInstanceOf(SocialProviderUnavailableError);
    });
});
