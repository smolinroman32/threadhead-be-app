import { IsArray, IsOptional, IsString } from 'class-validator';

export class PreferencesStepDto {
    @IsArray()
    @IsString({ each: true })
    includeTerms: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    excludeTerms?: string[] | null;
}
