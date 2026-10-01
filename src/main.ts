import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DomainExceptionFilter } from './shared/errors/domain-exception.filter.js';
import { PrismaClientExceptionFilter } from './shared/prisma-client-exception/prisma-client-exception.filter.js';
import cookieParser from 'cookie-parser';
import { getEnv } from './shared/env/get-env.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    const { httpAdapter } = app.get(HttpAdapterHost)

    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter), new DomainExceptionFilter())

    await app.listen(Number(getEnv('PORT', '3000')));
}
await bootstrap();
