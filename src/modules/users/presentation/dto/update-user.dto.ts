import { IsEmail, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(64)
    name?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(13)
    @Max(120)
    age?: number;

    @IsOptional()
    @IsEmail()
    email?: string;
}
