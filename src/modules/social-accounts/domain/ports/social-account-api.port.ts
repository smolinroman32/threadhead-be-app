export type SocialProfile = {
    id: string;
    username: string;
    avatarUrl: string | null;
};

export type SocialPost = {
    id: string;
    text: string;
    username: string;
    publishedAt: Date;
    permalink: string;
    hasReplies: boolean | null;
    isReply: boolean;
    mediaType: string | null;
    isQuotePost: boolean;
};

export type PostSearch = {
    query: string;
    since?: Date;
    limit: number;
};

export type ReplyDraft = {
    replyToId: string;
    text: string;
};

export abstract class SocialAccountApiPort {
    abstract getProfile(accessToken: string): Promise<SocialProfile>;
    abstract searchPosts(accessToken: string, search: PostSearch): Promise<SocialPost[]>;
    abstract publishReply(accessToken: string, reply: ReplyDraft): Promise<{ id: string }>;
}
