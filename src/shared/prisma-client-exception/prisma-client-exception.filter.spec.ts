import { HttpStatus, type ArgumentsHost } from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter.js';

describe('PrismaClientExceptionFilter', () => {
    it('should be defined', () => {
        expect(new PrismaClientExceptionFilter()).toBeDefined();
    });

    it.each([
        ['P2000', HttpStatus.BAD_REQUEST, 'A provided value is too long.'],
        ['P2002', HttpStatus.CONFLICT, 'A record with this value already exists.'],
        ['P2003', HttpStatus.CONFLICT, 'This operation violates a relation constraint.'],
        ['P2011', HttpStatus.BAD_REQUEST, 'A required field cannot be null.'],
        ['P2025', HttpStatus.NOT_FOUND, 'The requested record was not found.'],
    ])('returns the expected response for %s', (code, statusCode, message) => {
        const response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;
        const host = {
            switchToHttp: () => ({ getResponse: () => response }),
        } as ArgumentsHost;
        const exception = { code, message: 'Prisma error' } as Prisma.PrismaClientKnownRequestError;
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        new PrismaClientExceptionFilter().catch(exception, host);

        expect(response.status).toHaveBeenCalledWith(statusCode);
        expect(response.json).toHaveBeenCalledWith({ statusCode, message });
        errorSpy.mockRestore();
    });
});
