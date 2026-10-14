import { BadRequestException } from '@nestjs/common';
import { ParseSaveOnboardingStepPipe } from '../parse-save-onboarding-step.pipe.js';

const intent = { intent: 'Find people asking about AI agents', targetAudience: 'Founders' };

describe('ParseSaveOnboardingStepPipe', () => {
    const pipe = new ParseSaveOnboardingStepPipe();

    it('accepts an INTENT step', async () => {
        await expect(pipe.transform({ step: 'INTENT', version: 0, data: intent })).resolves.toEqual({
            step: 'INTENT',
            version: 0,
            data: intent,
        });
    });

    it('accepts a PREFERENCES step with or without excludeTerms', async () => {
        await expect(
            pipe.transform({
                step: 'PREFERENCES',
                version: 1,
                data: { includeTerms: ['ai'], excludeTerms: ['x y'] },
            }),
        ).resolves.toMatchObject({ data: { includeTerms: ['ai'], excludeTerms: ['x y'] } });
        await expect(
            pipe.transform({ step: 'PREFERENCES', version: 1, data: { includeTerms: ['ai'] } }),
        ).resolves.toMatchObject({ data: { includeTerms: ['ai'] } });
        await expect(
            pipe.transform({
                step: 'PREFERENCES',
                version: 1,
                data: { includeTerms: ['ai'], excludeTerms: null },
            }),
        ).resolves.toMatchObject({ data: { includeTerms: ['ai'] } });
    });

    it.each([
        ['an array body', []],
        ['a null body', null],
        ['step REVIEW', { step: 'REVIEW', version: 0, data: {} }],
        ['an unknown step', { step: 'DONE', version: 0, data: intent }],
        ['a missing version', { step: 'INTENT', data: intent }],
        ['a string version', { step: 'INTENT', version: '0', data: intent }],
        ['a negative version', { step: 'INTENT', version: -1, data: intent }],
        ['a fractional version', { step: 'INTENT', version: 1.5, data: intent }],
        ['data as an array', { step: 'INTENT', version: 0, data: [] }],
        ['data as null', { step: 'INTENT', version: 0, data: null }],
        ['an unknown field in the body', { step: 'INTENT', version: 0, data: intent, extra: true }],
        ['an unknown field in data', { step: 'INTENT', version: 0, data: { ...intent, extra: true } }],
        ['a missing targetAudience', { step: 'INTENT', version: 0, data: { intent: intent.intent } }],
        ['a missing includeTerms', { step: 'PREFERENCES', version: 1, data: { excludeTerms: [] } }],
        ['a non-string term', { step: 'PREFERENCES', version: 1, data: { includeTerms: [42] } }],
        ['INTENT fields under PREFERENCES', { step: 'PREFERENCES', version: 1, data: intent }],
    ])('rejects %s with 400', async (_case, body) => {
        await expect(pipe.transform(body)).rejects.toBeInstanceOf(BadRequestException);
    });
});
