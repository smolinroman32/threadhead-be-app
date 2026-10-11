import { Injectable, NotFoundException, type PipeTransform } from '@nestjs/common';
import { SOCIAL_PROVIDERS, type SocialProvider } from '../../domain/entities/social-account.entity.js';

@Injectable()
export class ParseSocialProviderPipe implements PipeTransform<string, SocialProvider> {
    transform(value: string) {
        const provider = SOCIAL_PROVIDERS.find((candidate) => candidate === value.toUpperCase());

        if (!provider) throw new NotFoundException();

        return provider;
    }
}
