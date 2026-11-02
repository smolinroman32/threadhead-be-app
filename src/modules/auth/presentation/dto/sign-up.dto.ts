import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
    @IsString()
    @MinLength(2)
    @MaxLength(64)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(12)
    @MaxLength(128)
    password: string;
}
