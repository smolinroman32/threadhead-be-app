import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { getEnv } from '../env/get-env.js';

const VERSION = 'v1';
const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const KEY_HEX_LENGTH = 64;

// Stored as `v1.<iv>.<tag>.<ciphertext>` (base64 parts). The prefix selects the algorithm and key, so a
// later rotation can write `v2` and still read `v1`.
@Injectable()
export class EncryptionService {
    private readonly key = this.loadKey();

    encrypt(plaintext: string) {
        const iv = randomBytes(IV_BYTES);
        const cipher = createCipheriv(ALGORITHM, this.key, iv);
        const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

        const parts = [iv, cipher.getAuthTag(), data].map((part) => part.toString('base64'));

        return [VERSION, ...parts].join('.');
    }

    decrypt(encrypted: string) {
        const [version, iv, tag, data] = encrypted.split('.');

        if (version !== VERSION) throw new Error(`Unsupported encryption version: ${version}`);
        if (!iv || !tag || !data) throw new Error('Malformed encrypted value');

        const decipher = createDecipheriv(ALGORITHM, this.key, Buffer.from(iv, 'base64'));
        decipher.setAuthTag(Buffer.from(tag, 'base64'));

        return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString(
            'utf8',
        );
    }

    private loadKey() {
        const hex = getEnv('ENCRYPTION_KEY');

        if (!new RegExp(`^[0-9a-fA-F]{${KEY_HEX_LENGTH}}$`).test(hex)) {
            throw new Error(`ENCRYPTION_KEY must be ${KEY_HEX_LENGTH} hex characters (32 bytes)`);
        }

        return Buffer.from(hex, 'hex');
    }
}
