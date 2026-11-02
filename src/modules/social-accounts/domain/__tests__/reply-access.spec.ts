import { canReplyWithScopes } from '../reply-access.js';

describe('canReplyWithScopes', () => {
    it('requires both publish and manage replies scopes', () => {
        expect(
            canReplyWithScopes(['threads_basic', 'threads_content_publish', 'threads_manage_replies']),
        ).toBe(true);
        expect(canReplyWithScopes(['threads_basic', 'threads_content_publish'])).toBe(false);
        expect(canReplyWithScopes(['threads_basic', 'threads_manage_replies'])).toBe(false);
        expect(canReplyWithScopes([])).toBe(false);
    });
});
