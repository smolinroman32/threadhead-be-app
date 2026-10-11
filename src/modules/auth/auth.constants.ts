export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
// Scoped so the browser sends the refresh token only to /auth/*, not on every request.
export const REFRESH_TOKEN_PATH = '/auth';
