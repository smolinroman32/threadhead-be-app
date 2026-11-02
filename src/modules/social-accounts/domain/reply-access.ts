export const REPLY_SCOPES = ['threads_content_publish', 'threads_manage_replies'] as const;

export function canReplyWithScopes(scopes: readonly string[]) {
    return REPLY_SCOPES.every((scope) => scopes.includes(scope));
}
