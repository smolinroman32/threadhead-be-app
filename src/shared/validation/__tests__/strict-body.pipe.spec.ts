import { BadRequestException } from '@nestjs/common';
import { IsInt, IsString } from 'class-validator';
import { StrictBodyPipe } from '../strict-body.pipe.js';

class SampleDto {
    @IsString()
    name: string;

    @IsInt()
    size: number;
}

describe('StrictBodyPipe', () => {
    const pipe = new StrictBodyPipe(SampleDto);

    it('returns a valid body', async () => {
        await expect(pipe.transform({ name: 'a', size: 1 })).resolves.toMatchObject({ name: 'a', size: 1 });
    });

    it.each([
        ['an unknown field', { name: 'a', size: 1, extra: true }],
        ['a wrong type', { name: 'a', size: '1' }],
        ['a missing field', { name: 'a' }],
        ['an array body', []],
        ['a null body', null],
    ])('rejects %s with 400', async (_case, body) => {
        await expect(pipe.transform(body)).rejects.toBeInstanceOf(BadRequestException);
    });
});
