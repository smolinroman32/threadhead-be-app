import { IsString } from 'class-validator';

export class IntentStepDto {
    @IsString()
    intent: string;

    @IsString()
    targetAudience: string;
}
