import { Injectable, ValidationPipe, type PipeTransform } from '@nestjs/common';
import { ONBOARDING_STEP, type SaveOnboardingStepInput } from '../../domain/entities/onboarding.entity.js';
import { IntentStepDto } from '../dto/intent-step.dto.js';
import { PreferencesStepDto } from '../dto/preferences-step.dto.js';
import { SaveOnboardingStepDto } from '../dto/save-onboarding-step.dto.js';

const strict = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
const DATA_DTO = {
    [ONBOARDING_STEP.INTENT]: IntentStepDto,
    [ONBOARDING_STEP.PREFERENCES]: PreferencesStepDto,
};

@Injectable()
export class ParseSaveOnboardingStepPipe implements PipeTransform<unknown, Promise<SaveOnboardingStepInput>> {
    async transform(value: unknown) {
        const body: SaveOnboardingStepDto = await strict.transform(value, {
            type: 'body',
            metatype: SaveOnboardingStepDto,
        });

        const data: object = await strict.transform(body.data, {
            type: 'body',
            metatype: DATA_DTO[body.step],
        });

        return { step: body.step, version: body.version, data: { ...data } } as SaveOnboardingStepInput;
    }
}
