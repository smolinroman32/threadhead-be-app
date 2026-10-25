import { IsArray, IsBoolean, IsInt, IsString, ValidateIf } from 'class-validator';
import { isSent } from './is-sent.js';

export class UpdateOpportunityFeedDto {
    @ValidateIf(isSent)
    @IsString()
    name?: string;

    @ValidateIf(isSent)
    @IsString()
    description?: string;

    @ValidateIf(isSent)
    @IsString()
    color?: string;

    @ValidateIf(isSent)
    @IsString()
    intent?: string;

    @ValidateIf(isSent)
    @IsString()
    targetAudience?: string;

    @ValidateIf(isSent)
    @IsArray()
    @IsString({ each: true })
    includeTerms?: string[];

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
