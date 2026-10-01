import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const SCRYPT_PARAMS = { N: 2 ** 15, r: 8, p: 1 } as const;
const SCRYPT_MAX_MEMORY = 128 * SCRYPT_PARAMS.N * SCRYPT_PARAMS.r * 2;

// Hash format: scrypt$<N>$<r>$<p>$<salt base64>$<key base64>, so parameters can be raised later.
@Injectable()
export class CredentialsService {
    async hashPassword(password: string) {
        const salt = randomBytes(SALT_LENGTH);
        const key = await this.derive(password, salt, SCRYPT_PARAMS);

        return ['scrypt', SCRYPT_PARAMS.N, SCRYPT_PARAMS.r, SCRYPT_PARAMS.p, salt.toString('base64'), key.toString('base64')].join('$');
    }

    // Pass `undefined` for an unknown user: a dummy hash is checked instead,
    // so response time does not reveal which accounts exist.
    async checkPassword(password: string, storedHash: string | undefined) {
        const parsed = this.parse(storedHash);

        if (!parsed) {
            await this.derive(password, Buffer.alloc(SALT_LENGTH), SCRYPT_PARAMS);
            return false;
        }

        const key = await this.derive(password, parsed.salt, parsed.params);

        return key.length === parsed.key.length && timingSafeEqual(key, parsed.key);
    }

    private parse(encoded: string | undefined) {
        if (!encoded) return null;

        const [scheme, N, r, p, salt, key] = encoded.split('$');

        if (scheme !== 'scrypt' || !N || !r || !p || !salt || !key) return null;

        return {
            params: { N: Number(N), r: Number(r), p: Number(p) },
            salt: Buffer.from(salt, 'base64'),
            key: Buffer.from(key, 'base64'),
        };
    }

    private derive(password: string, salt: Buffer, params: { N: number; r: number; p: number }) {
        const options: ScryptOptions = { ...params, maxmem: SCRYPT_MAX_MEMORY };

        return new Promise<Buffer>((resolve, reject) => {
            scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, options, (error, key) =>
                error ? reject(error) : resolve(key),
            );
        });
    }
}
