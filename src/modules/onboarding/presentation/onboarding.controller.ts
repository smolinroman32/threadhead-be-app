import { Body, Controller, Get, Patch } from '@nestjs/common';
import type { JwtPayload } from '../../auth/domain/jwt-payload.js';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator.js';
import { OnboardingService } from '../application/onboarding.service.js';
import type { SaveOnboardingStepInput } from '../domain/entities/onboarding.entity.js';
import { OnboardingResponseMapper } from './mappers/onboarding-response.mapper.js';
import { ParseSaveOnboardingStepPipe } from './pipes/parse-save-onboarding-step.pipe.js';

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
}
