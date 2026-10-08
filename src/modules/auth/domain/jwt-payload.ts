// Claims put into both tokens; `sub` is the user id.
export type JwtPayload = {
    sub: string;
    email: string;
};
