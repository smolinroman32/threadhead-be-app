import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../../domain/jwt-payload.js';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
    return context.switchToHttp().getRequest<Request>().user as JwtPayload;
});
