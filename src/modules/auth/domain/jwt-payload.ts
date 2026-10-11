// Claims put into both tokens; `sub` is the user id.
export type JwtPayload = {
    sub: string;
    email: string;
    // Bumped on sign-out; a refresh token with an older version is rejected.
    tokenVersion: number;
};
