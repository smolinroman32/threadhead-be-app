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
    hasReplies: boolean;
    isReply: boolean;
    mediaType: string | null;
    isQuotePost: boolean;
};

export type PostSearch = {
    query: string;
    since?: Date;
    limit: number;
};

export abstract class SocialAccountApiPort {
    abstract getProfile(accessToken: string): Promise<SocialProfile>;
    abstract searchPosts(accessToken: string, search: PostSearch): Promise<SocialPost[]>;
}
