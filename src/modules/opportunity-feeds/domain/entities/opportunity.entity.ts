import { OpportunityRepliedError } from '../errors/opportunity-replied.error.js';

export const OPPORTUNITY_STATUSES = ['NEW', 'SAVED', 'DISMISSED', 'REPLIED'] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];
export type ReviewStatus = Exclude<OpportunityStatus, 'REPLIED'>;

export interface OpportunityProps {
    opportunityFeedId: string;
    externalPostId: string;
    authorUsername: string;
    text: string;
    permalink: string;
    publishedAt: Date;
    relevanceScore: number;
    reason: string;
    status: OpportunityStatus;
    excludedTerm: string | null;
    stale: boolean;
    matchedQueries: string[];
}

export class OpportunityEntity {
    constructor(
        public readonly id: string,
        private readonly props: OpportunityProps,
    ) {}

    get opportunityFeedId() {
        return this.props.opportunityFeedId;
    }

    get externalPostId() {
        return this.props.externalPostId;
    }

    get authorUsername() {
        return this.props.authorUsername;
    }

    get text() {
        return this.props.text;
    }

    get permalink() {
        return this.props.permalink;
    }

    get publishedAt() {
        return this.props.publishedAt;
    }

    get relevanceScore() {
        return this.props.relevanceScore;
    }

    get reason() {
        return this.props.reason;
    }

    get status() {
        return this.props.status;
    }

    get excludedTerm() {
        return this.props.excludedTerm;
    }

    get stale() {
        return this.props.stale;
    }

    get matchedQueries() {
        return this.props.matchedQueries;
    }
}

export function nextOpportunityStatus(current: OpportunityStatus, requested: ReviewStatus): ReviewStatus {
    if (current === 'REPLIED') throw new OpportunityRepliedError();

    return requested;
}
