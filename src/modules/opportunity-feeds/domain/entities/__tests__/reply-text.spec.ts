import { OpportunityReplyTextInvalidError } from '../../errors/opportunity-reply-text-invalid.error.js';
import { REPLY_TEXT_MAX_LENGTH, replyText } from '../reply-text.js';

describe('replyText', () => {
    it('trims the text', () => {
        expect(replyText('  Hello there \n')).toBe('Hello there');
    });

    it.each(['', '   \n\t'])('rejects text that is empty after trimming (%j)', (raw) => {
        expect(() => replyText(raw)).toThrow(OpportunityReplyTextInvalidError);
    });

    it('counts code points, so 500 emoji pass and 501 characters do not', () => {
        expect(replyText('😀'.repeat(REPLY_TEXT_MAX_LENGTH))).toHaveLength(REPLY_TEXT_MAX_LENGTH * 2);
        expect(() => replyText('a'.repeat(REPLY_TEXT_MAX_LENGTH + 1))).toThrow(
            OpportunityReplyTextInvalidError,
        );
    });
});
