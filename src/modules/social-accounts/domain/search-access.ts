export const SEARCH_ACCESS = ['OK', 'NARROWED', 'UNKNOWN'] as const;
export type SearchAccess = (typeof SEARCH_ACCESS)[number];

export const CONTROL_SEARCH = { query: 'today', limit: 25 };

export function searchAccessFromPosts(posts: { username: string }[], ownUsername: string): SearchAccess {
    if (posts.length === 0) return 'UNKNOWN';

    const own = ownUsername.toLowerCase();

    return posts.some((post) => post.username.toLowerCase() !== own) ? 'OK' : 'NARROWED';
}
