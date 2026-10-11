import type { CookieOptions, Response } from 'express';
import { getEnv } from '../../../shared/env/get-env.js';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_PATH } from '../auth.constants.js';

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function cookieOptions(path: string): CookieOptions {
    return {
        httpOnly: true,
        secure: getEnv('NODE_ENV', 'development') === 'production',
        sameSite: 'lax',
        path,
    };
}

export function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
        ...cookieOptions('/'),
        maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
        ...cookieOptions(REFRESH_TOKEN_PATH),
        maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
}

export function clearAuthCookies(res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions('/'));
    res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions(REFRESH_TOKEN_PATH));
}
