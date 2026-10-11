import { Injectable } from '@nestjs/common';
import { HttpClientPort } from '../../../../shared/http/ports/http-client.port.js';
import { SocialAccountApiPort } from '../../domain/ports/social-account-api.port.js';
import { readProviderBody } from '../providers/read-provider-body.js';

type ProfileBody = { id: string; username: string; threads_profile_picture_url?: string };

@Injectable()
export class ThreadsAccountApi implements SocialAccountApiPort {
    constructor(private readonly http: HttpClientPort) {}

    async getProfile(accessToken: string) {
        const response = await this.http.get('https://graph.threads.net/v1.0/me', {
            query: { fields: 'id,username,threads_profile_picture_url', access_token: accessToken },
        });

        const profile = readProviderBody<ProfileBody>(response);

        return {
            id: profile.id,
            username: profile.username,
            avatarUrl: profile.threads_profile_picture_url ?? null,
        };
    }
}
