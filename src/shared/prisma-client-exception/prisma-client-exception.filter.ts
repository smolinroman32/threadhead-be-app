import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { Prisma } from '../../../prisma/generated/prisma/client.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        console.error(exception.message);

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        switch (exception.code) {
            case 'P2000': {
                this.respond(response, HttpStatus.BAD_REQUEST, 'A provided value is too long.');
                break;
            }
            case 'P2002': {
                this.respond(response, HttpStatus.CONFLICT, 'A record with this value already exists.');
                break;
            }
            case 'P2003': {
                this.respond(response, HttpStatus.CONFLICT, 'This operation violates a relation constraint.');
                break;
            }
            case 'P2011': {
                this.respond(response, HttpStatus.BAD_REQUEST, 'A required field cannot be null.');
                break;
            }
            case 'P2025': {
                this.respond(response, HttpStatus.NOT_FOUND, 'The requested record was not found.');
                break;
            }
            default:
                super.catch(exception, host);
        }
    }

    private respond(response: Response, status: HttpStatus, message: string) {
        response.status(status).json({
            statusCode: status,
            message,
        });
    }
}
