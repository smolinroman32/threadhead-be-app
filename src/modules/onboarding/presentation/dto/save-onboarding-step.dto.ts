import { IsIn, IsInt, IsObject, Min } from 'class-validator';
import type { EditableOnboardingStep } from '../../domain/entities/onboarding.entity.js';

export class SaveOnboardingStepDto {
    @IsIn(['INTENT', 'PREFERENCES'])
    step: EditableOnboardingStep;

    @IsInt()
    @Min(0)
    version: number;

    @IsObject()
    data: Record<string, unknown>;
}
