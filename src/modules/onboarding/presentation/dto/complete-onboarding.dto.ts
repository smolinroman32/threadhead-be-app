import { IsInt, Min } from 'class-validator';

export class CompleteOnboardingDto {
    @IsInt()
    @Min(0)
    version: number;
}
