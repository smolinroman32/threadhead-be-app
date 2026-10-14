import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { StrictBodyPipe } from '../../../shared/validation/strict-body.pipe.js';
import type { JwtPayload } from '../../auth/domain/jwt-payload.js';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator.js';
import { OnboardingService } from '../application/onboarding.service.js';
import type { SaveOnboardingStepInput } from '../domain/entities/onboarding.entity.js';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto.js';
import { OnboardingResponseMapper } from './mappers/onboarding-response.mapper.js';
import { ParseSaveOnboardingStepPipe } from './pipes/parse-save-onboarding-step.pipe.js';

type CompleteOnboardingInput = { version: number };

@Controller('onboarding')
export class OnboardingController {
    constructor(private readonly onboardingService: OnboardingService) {}

    @Get()
    async get(@CurrentUser() currentUser: JwtPayload) {
        const onboarding = await this.onboardingService.get(currentUser.sub);

        return OnboardingResponseMapper.toDto(onboarding);
    }

    @Patch()
    async saveStep(
        @CurrentUser() currentUser: JwtPayload,
        @Body(ParseSaveOnboardingStepPipe) input: SaveOnboardingStepInput,
    ) {
        const onboarding = await this.onboardingService.saveStep(currentUser.sub, input);

        return OnboardingResponseMapper.toDto(onboarding);
    }

    @Post('complete')
    @HttpCode(HttpStatus.OK)
    async complete(
        @CurrentUser() currentUser: JwtPayload,
        @Body(new StrictBodyPipe(CompleteOnboardingDto)) input: CompleteOnboardingInput,
    ) {
        const { onboarding, feedId } = await this.onboardingService.complete(currentUser.sub, input.version);

        return OnboardingResponseMapper.toCompleteDto(onboarding, feedId);
    }
}
