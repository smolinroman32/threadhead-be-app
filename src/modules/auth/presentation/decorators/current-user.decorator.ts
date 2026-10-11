import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../../domain/jwt-payload.js';

// `request.user` is set by JwtStrategy. Do not use on @Public() routes: it is undefined there.
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
    return context.switchToHttp().getRequest<Request>().user as JwtPayload;
});
