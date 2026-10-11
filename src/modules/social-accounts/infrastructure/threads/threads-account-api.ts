import { Injectable } from '@nestjs/common';
import { SocialAccountApiPort } from '../../domain/ports/social-account-api.port.js';

@Injectable()
export class ThreadsAccountApi implements SocialAccountApiPort {}
