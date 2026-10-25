import type { DiscoveryRun } from '../../../../generated/prisma/client.js';
import { DiscoveryRunEntity, type DiscoveryRunStats } from '../../domain/entities/discovery-run.entity.js';

export class DiscoveryRunMapper {
    static toDomain(raw: DiscoveryRun): DiscoveryRunEntity {
        return new DiscoveryRunEntity(raw.id, {
            opportunityFeedId: raw.opportunityFeedId,
            status: raw.status,
            scoringVersion: raw.scoringVersion,
            attempt: raw.attempt,
            heartbeatAt: raw.heartbeatAt,
            notBefore: raw.notBefore,
            error: raw.error,
            stats: raw.stats as DiscoveryRunStats,
            createdAt: raw.createdAt,
            startedAt: raw.startedAt,
            finishedAt: raw.finishedAt,
        });
    }
}
