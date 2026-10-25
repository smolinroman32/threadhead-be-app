import type { OpportunityFeedFields } from './opportunity-feed-fields.js';

export interface OpportunityFeedProps extends OpportunityFeedFields {
    userId: string;
    languages: string[];
    socialAccountId: string | null;
    scoringVersion: number;
    createdAt: Date;
    updatedAt: Date;
}

export class OpportunityFeedEntity {
    constructor(
        public readonly id: string,
        private readonly props: OpportunityFeedProps,
    ) {}

    get userId() {
        return this.props.userId;
    }

    get name() {
        return this.props.name;
    }

    get description() {
        return this.props.description;
    }

    get color() {
        return this.props.color;
    }

    get intent() {
        return this.props.intent;
    }

    get targetAudience() {
        return this.props.targetAudience;
    }

    get includeTerms() {
        return this.props.includeTerms;
    }

    get excludeTerms() {
        return this.props.excludeTerms;
    }

    get languages() {
        return this.props.languages;
    }

    get freshnessHours() {
        return this.props.freshnessHours;
    }

    get minScore() {
        return this.props.minScore;
    }

    get isActive() {
        return this.props.isActive;
    }

    get socialAccountId() {
        return this.props.socialAccountId;
    }

    get scoringVersion() {
        return this.props.scoringVersion;
    }

    get createdAt() {
        return this.props.createdAt;
    }

    get updatedAt() {
        return this.props.updatedAt;
    }

    get fields(): OpportunityFeedFields {
        return {
            name: this.props.name,
            description: this.props.description,
            color: this.props.color,
            intent: this.props.intent,
            targetAudience: this.props.targetAudience,
            includeTerms: this.props.includeTerms,
            excludeTerms: this.props.excludeTerms,
            freshnessHours: this.props.freshnessHours,
            minScore: this.props.minScore,
            isActive: this.props.isActive,
        };
    }
}
