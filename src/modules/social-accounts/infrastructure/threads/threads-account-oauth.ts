import { Injectable } from '@nestjs/common';
import { SocialAccountOauthPort } from '../../domain/ports/social-account-oauth.port.js';

@Injectable()
export class ThreadsAccountOAuth implements SocialAccountOauthPort {
    constructor() {}
}
