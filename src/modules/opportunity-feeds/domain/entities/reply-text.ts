import { OpportunityReplyTextInvalidError } from '../errors/opportunity-reply-text-invalid.error.js';

export const REPLY_TEXT_MAX_LENGTH = 500;

export function replyText(raw: string) {
    const text = raw.trim();
    const length = Array.from(text).length;

    if (length === 0 || length > REPLY_TEXT_MAX_LENGTH) throw new OpportunityReplyTextInvalidError();

    return text;
}
