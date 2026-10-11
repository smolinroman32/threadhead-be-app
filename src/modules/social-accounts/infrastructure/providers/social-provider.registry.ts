import { Injectable } from '@nestjs/common';
import type { SocialProvider } from '../../domain/entities/social-account.entity.js';
import { SocialAccountApiPort } from '../../domain/ports/social-account-api.port.js';
import { SocialProviderRegistryPort } from '../../domain/ports/social-provider-registry.port.js';
import { SocialAccountOauthPort } from '../../domain/ports/social-account-oauth.port.js';
import { ThreadsAccountApi } from '../threads/threads-account-api.js';
import { ThreadsAccountOAuth } from '../threads/threads-account-oauth.js';

@Injectable()
export class SocialProviderRegistry implements SocialProviderRegistryPort {
    private readonly oauthAdapters: Record<SocialProvider, SocialAccountOauthPort>;
    private readonly apiAdapters: Record<SocialProvider, SocialAccountApiPort>;

    constructor(threadsOauth: ThreadsAccountOAuth, threadsApi: ThreadsAccountApi) {
        this.oauthAdapters = { THREADS: threadsOauth };
        this.apiAdapters = { THREADS: threadsApi };
    }

    oauth(provider: SocialProvider) {
        return this.oauthAdapters[provider];
    }

    api(provider: SocialProvider) {
        return this.apiAdapters[provider];
    }
}
