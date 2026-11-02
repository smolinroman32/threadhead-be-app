export type PostMetrics = {
    likeCount: number | null;
    replyCount: number | null;
    repostCount: number | null;
    authorDisplayName: string | null;
};

export abstract class PostPagePort {
    abstract getMetrics(permalink: string): Promise<PostMetrics>;
}
