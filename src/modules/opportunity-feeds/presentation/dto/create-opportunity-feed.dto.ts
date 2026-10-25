import { IsArray, IsBoolean, IsInt, IsString, ValidateIf } from 'class-validator';
import { isSent } from './is-sent.js';

export class CreateOpportunityFeedDto {
    @IsString()
    name: string;

    @ValidateIf(isSent)
    @IsString()
    description?: string;

    @ValidateIf(isSent)
    @IsString()
    color?: string;

    @IsString()
    intent: string;

    @IsString()
    targetAudience: string;

    @IsArray()
    @IsString({ each: true })
    includeTerms: string[];

    @ValidateIf(isSent)
    @IsArray()
    @IsString({ each: true })
    excludeTerms?: string[];

    @ValidateIf(isSent)
    @IsInt()
    freshnessHours?: number;

    @ValidateIf(isSent)
    @IsInt()
    minScore?: number;

    @ValidateIf(isSent)
    @IsBoolean()
    isActive?: boolean;
}
