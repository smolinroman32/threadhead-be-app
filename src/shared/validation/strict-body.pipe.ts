import { ValidationPipe, type PipeTransform, type Type } from '@nestjs/common';

export class StrictBodyPipe implements PipeTransform {
    private readonly strict = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    });

    constructor(private readonly metatype: Type<unknown>) {}

    transform(value: unknown) {
        return this.strict.transform(value, { type: 'body', metatype: this.metatype });
    }
}
