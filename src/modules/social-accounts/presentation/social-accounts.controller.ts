import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
    Req,
    Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { getEnv } from '../../../shared/env/get-env.js';
import { AuthService } from '../../auth/application/auth.service.js';
import { ACCESS_TOKEN_COOKIE } from '../../auth/auth.constants.js';
import type { JwtPayload } from '../../auth/domain/jwt-payload.js';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator.js';
import { Public } from '../../auth/presentation/decorators/public.decorator.js';
import { SocialAccountsService } from '../application/social-accounts.service.js';
import type { SocialProvider } from '../domain/entities/social-account.entity.js';
import { InvalidOAuthStateError } from '../domain/errors/invalid-oauth-state.error.js';
import { SocialAccountAlreadyConnectedError } from '../domain/errors/social-account-already-connected.error.js';
import { SocialAccountResponseMapper } from './mappers/social-account-response.mapper.js';
import { ParseSocialProviderPipe } from './pipes/parse-social-provider.pipe.js';

type CallbackQuery = { code?: string; state?: string; error?: string };
type FailureReason = 'denied' | 'invalid_state' | 'already_connected' | 'failed';

@Controller('social-accounts')
export class SocialAccountsController {
    private readonly logger = new Logger(SocialAccountsController.name);

    constructor(
        private readonly socialAccountsService: SocialAccountsService,
        private readonly authService: AuthService,
    ) {}

    @Post(':provider/authorize')
    @HttpCode(HttpStatus.OK)
    async authorize(
        @Param('provider', ParseSocialProviderPipe) provider: SocialProvider,
        @CurrentUser() currentUser: JwtPayload,
    ) {
        const url = await this.socialAccountsService.authorize(currentUser.sub, provider);

        this.logger.log(
            `Authorization URL issued for ${provider}, user ${currentUser.sub}, redirect_uri=${new URL(url).searchParams.get('redirect_uri')}`,
        );

        return { url };
    }

    @Public()
    @Get(':provider/callback')
    async callback(@Query() query: CallbackQuery, @Req() req: Request, @Res() res: Response) {
        this.logger.log(
            `Callback received: code=${Boolean(query.code)}, state=${Boolean(query.state)}, providerError=${query.error ?? 'none'}`,
        );

        const failure = await this.connect(query, req);

        if (failure) this.logger.warn(`Connect failed: reason=${failure}`);
        else this.logger.log('Connect succeeded, redirecting to the frontend');

        res.redirect(this.resultUrl(failure));
    }

    @Get()
    async list(@CurrentUser() currentUser: JwtPayload) {
        const accounts = await this.socialAccountsService.list(currentUser.sub);

        return accounts.map(SocialAccountResponseMapper.toDto);
    }

    @Post(':id/search-access-check')
    @HttpCode(HttpStatus.OK)
    async checkSearchAccess(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() currentUser: JwtPayload) {
        const { searchAccess, checkedAt } = await this.socialAccountsService.checkSearchAccess(
            id,
            currentUser.sub,
        );

        return { searchAccess: searchAccess.toLowerCase(), checkedAt };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async disconnect(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() currentUser: JwtPayload) {
        await this.socialAccountsService.disconnect(currentUser.sub, id);
    }

    private async connect(
        { code, state, error }: CallbackQuery,
        req: Request,
    ): Promise<FailureReason | null> {
        if (error) return 'denied';
        if (!state) return 'invalid_state';
        if (!code) return 'failed';

        try {
            const currentUser = await this.authService.verifyAccessToken(req.cookies?.[ACCESS_TOKEN_COOKIE]);

            if (!currentUser) this.logger.warn('Callback arrived without a valid access token cookie');

            await this.socialAccountsService.connect({
                state,
                code,
                currentUserId: currentUser?.sub ?? null,
            });

            return null;
        } catch (failure) {
            if (failure instanceof InvalidOAuthStateError) return 'invalid_state';
            if (failure instanceof SocialAccountAlreadyConnectedError) return 'already_connected';

            this.logger.error(failure instanceof Error ? failure.message : 'Unknown error');

            return 'failed';
        }
    }

    private resultUrl(failure: FailureReason | null) {
        const url = new URL(getEnv('FRONTEND_SOCIAL_RESULT_PATH'), getEnv('FRONTEND_URL'));

        if (failure) {
            url.searchParams.set('social', 'error');
            url.searchParams.set('reason', failure);
        } else {
            url.searchParams.set('social', 'connected');
        }

        return url.toString();
    }
}
