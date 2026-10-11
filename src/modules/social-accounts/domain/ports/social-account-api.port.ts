export type SocialProfile = {
    id: string;
    username: string;
    avatarUrl: string | null;
};

export abstract class SocialAccountApiPort {
    abstract getProfile(accessToken: string): Promise<SocialProfile>;
}
