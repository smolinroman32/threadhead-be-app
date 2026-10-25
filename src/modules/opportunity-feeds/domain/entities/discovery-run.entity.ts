export const DISCOVERY_RUN_STATUSES = ['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED'] as const;
export type DiscoveryRunStatus = (typeof DISCOVERY_RUN_STATUSES)[number];

export type DiscoveryRunStats = Record<string, unknown>;

export interface DiscoveryRunProps {
    opportunityFeedId: string;
    status: DiscoveryRunStatus;
    scoringVersion: number | null;
    attempt: number;
    heartbeatAt: Date | null;
    notBefore: Date | null;
    error: string | null;
    stats: DiscoveryRunStats;
    createdAt: Date;
    startedAt: Date | null;
    finishedAt: Date | null;
}

export class DiscoveryRunEntity {
    constructor(
        public readonly id: string,
        private readonly props: DiscoveryRunProps,
    ) {}

    get opportunityFeedId() {
        return this.props.opportunityFeedId;
    }

    get status() {
        return this.props.status;
    }

    get scoringVersion() {
        return this.props.scoringVersion;
    }

    get attempt() {
        return this.props.attempt;
    }

    get heartbeatAt() {
        return this.props.heartbeatAt;
    }

    get notBefore() {
        return this.props.notBefore;
    }

    get error() {
        return this.props.error;
    }

    get stats() {
        return this.props.stats;
    }

    get createdAt() {
        return this.props.createdAt;
    }

    get startedAt() {
        return this.props.startedAt;
    }

    get finishedAt() {
        return this.props.finishedAt;
    }
}
