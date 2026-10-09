import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { REFRESH_TOKEN_COOKIE } from '../auth.constants.js';
import { clearAuthCookies, setAuthCookies } from './auth-cookies.js';
import { Public } from './decorators/public.decorator.js';
import { AuthService } from '../application/auth.service.js';
import { UserResponseMapper } from '../../users/presentation/mappers/user-response.mapper.js';
import { SignUpDto } from './dto/sign-up.dto.js';
import { SignInDto } from './dto/sign-in.dto.js';

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

        setAuthCookies(res, tokens);

        return UserResponseMapper.toDto(user);
    }

    @Post('/refresh')
    @HttpCode(HttpStatus.NO_CONTENT)
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const { tokens } = await this.authService.refresh(req.cookies?.[REFRESH_TOKEN_COOKIE]);

        setAuthCookies(res, tokens);
    }

    @Post('/sign-out')
    @HttpCode(HttpStatus.NO_CONTENT)
    async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        await this.authService.signOut(req.cookies?.[REFRESH_TOKEN_COOKIE]);

        clearAuthCookies(res);
    }
}
