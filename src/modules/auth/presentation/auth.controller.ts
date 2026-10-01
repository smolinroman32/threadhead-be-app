import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { getEnv } from '../../../shared/env/get-env.js';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../auth.constants.js';
import { Public } from './decorators/public.decorator.js';
import { AuthService } from '../application/auth.service.js';
import { UserResponseMapper } from '../../users/presentation/mappers/user-response.mapper.js';
import { SignUpDto } from './dto/sign-up.dto.js';
import { SignInDto } from './dto/sign-in.dto.js';

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

@Public()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/sign-up')
    async signUp(@Body() body: SignUpDto) {
        const { name, age, email, password } = body;
        const user = await this.authService.signUp({ name, age, email, password });

        return UserResponseMapper.toDto(user);
    }

    @Post('/sign-in')
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() body: SignInDto, @Res({ passthrough: true }) res: Response) {
        const { email, password } = body;
        const { user, tokens } = await this.authService.signIn({ email, password });

        res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, this.cookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
        res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, this.cookieOptions(REFRESH_TOKEN_MAX_AGE_MS));

        return UserResponseMapper.toDto(user);
    }

    private cookieOptions(maxAge: number): CookieOptions {
        return {
            httpOnly: true,
            secure: getEnv('NODE_ENV', 'development') === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge,
        };
    }
}
