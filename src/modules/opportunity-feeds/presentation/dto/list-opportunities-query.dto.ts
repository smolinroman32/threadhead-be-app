import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { MAX_OPPORTUNITY_PAGE } from '../../domain/discovery/discovery.constants.js';

export const LIST_STATUSES = ['new', 'saved', 'dismissed', 'replied'] as const;

export class ListOpportunitiesQueryDto {
    @IsOptional()
    @IsIn(LIST_STATUSES)
    status?: (typeof LIST_STATUSES)[number];

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(MAX_OPPORTUNITY_PAGE)
    page?: number;
}
