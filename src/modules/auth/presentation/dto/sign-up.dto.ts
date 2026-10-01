import { Type } from 'class-transformer';
import {
    IsEmail,
    IsInt,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class SignUpDto {
    @IsString()
    @MinLength(2)
    @MaxLength(64)
    name: string;

    @Type(() => Number)
    @IsInt()
    @Min(13)
    @Max(120)
    age: number;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(12)
    @MaxLength(128)
    password: string;
}
