import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainError, DomainErrorKind } from './domain.error.js';

const STATUS_BY_KIND: Record<DomainErrorKind, HttpStatus> = {
    not_found: HttpStatus.NOT_FOUND,
    conflict: HttpStatus.CONFLICT,
    validation: HttpStatus.BAD_REQUEST,
    unauthorized: HttpStatus.UNAUTHORIZED,
    forbidden: HttpStatus.FORBIDDEN,
};

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
    catch(exception: DomainError, host: ArgumentsHost) {
        const status = STATUS_BY_KIND[exception.kind];

        host.switchToHttp().getResponse<Response>().status(status).json({
            statusCode: status,
            error: exception.name,
            message: exception.message,
        });
    }
}
