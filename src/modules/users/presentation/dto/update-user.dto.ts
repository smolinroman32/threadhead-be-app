import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(64)
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;
}
