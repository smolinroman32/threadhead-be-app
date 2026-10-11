import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

// Global so every module shares one PrismaService (one connection pool) without importing this.
@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {}
