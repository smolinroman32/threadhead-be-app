import { IsIn } from 'class-validator';

export const REVIEW_STATUSES = ['new', 'saved', 'dismissed'] as const;

export class ChangeOpportunityStatusDto {
    @IsIn(REVIEW_STATUSES)
    status: (typeof REVIEW_STATUSES)[number];
}
