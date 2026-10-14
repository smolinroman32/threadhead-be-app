import { NotFoundException } from '@nestjs/common';
import { ParseSocialProviderPipe } from '../parse-social-provider.pipe.js';

describe('ParseSocialProviderPipe', () => {
    const pipe = new ParseSocialProviderPipe();

    it('maps the path segment to the provider', () => {
        expect(pipe.transform('threads')).toBe('THREADS');
        expect(pipe.transform('THREADS')).toBe('THREADS');
    });

    it('answers 404 for an unknown provider', () => {
        expect(() => pipe.transform('myspace')).toThrow(NotFoundException);
    });
});
