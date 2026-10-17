import { IsIn, IsInt, IsObject, Min } from 'class-validator';
import { ONBOARDING_STEP, type EditableOnboardingStep } from '../../domain/entities/onboarding.entity.js';

export class SaveOnboardingStepDto {
    @IsIn([ONBOARDING_STEP.INTENT, ONBOARDING_STEP.PREFERENCES])
    step: EditableOnboardingStep;

    @IsInt()
    @Min(0)
    version: number;

    @IsObject()
    data: Record<string, unknown>;
}
