import 'reflect-metadata';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants.js';
import type { ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../../domain/jwt-payload.js';
import { CurrentUser } from './current-user.decorator.js';

class Probe {
    handler(@CurrentUser() _user: JwtPayload) {}
}

function resolveCurrentUser(request: object) {
    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, Probe, 'handler');
    const { factory } = Object.values(metadata)[0] as {
        factory: (data: unknown, context: ExecutionContext) => JwtPayload;
    };
    const context = {
        switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    return factory(undefined, context);
}

describe('CurrentUser', () => {
    it('returns the payload that the JWT strategy attached to request.user', () => {
        const payload: JwtPayload = { sub: 'user-id', email: 'user@example.com' };

        expect(resolveCurrentUser({ user: payload })).toBe(payload);
    });
});
