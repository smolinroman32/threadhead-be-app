import type { HttpResponse } from '../../../../shared/http/ports/http-client.port.js';
import { SocialProviderRejectedError } from '../../domain/errors/social-provider-rejected.error.js';
import { SocialProviderUnavailableError } from '../../domain/errors/social-provider-unavailable.error.js';

export function readProviderBody<T>(response: HttpResponse) {
    if (response.status >= 500) throw new SocialProviderUnavailableError();
    if (response.status >= 400) throw new SocialProviderRejectedError();

    return response.body as T;
}
