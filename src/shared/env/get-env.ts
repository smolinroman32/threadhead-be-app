export function getEnv(name: string): string;
export function getEnv(name: string, fallback: string): string;
export function getEnv(name: string, fallback?: string): string {
    const value = process.env[name];

    if (value !== undefined && value !== '') return value;
    if (fallback !== undefined) return fallback;

    throw new Error(`Missing required environment variable: ${name}`);
}


const MIN_SECRET_LENGTH = 32;

export function getSecret(name: string) {
    const secret = getEnv(name);

    if (secret.length < MIN_SECRET_LENGTH) {
        throw new Error(`${name} must be at least ${MIN_SECRET_LENGTH} characters`);
    }

    return secret;
}
