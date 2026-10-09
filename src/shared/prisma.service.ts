import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { getEnv } from './env/get-env.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
    constructor() {
        const adapter = new PrismaPg({
            connectionString: getEnv('DATABASE_URL'),
        });
        super({ adapter });
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
