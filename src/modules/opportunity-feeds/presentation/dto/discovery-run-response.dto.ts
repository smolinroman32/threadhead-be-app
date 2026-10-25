export class DiscoveryRunResponseDto {
    id: string;
    status: 'queued' | 'running' | 'succeeded' | 'failed';
    error: string | null;
    stats: Record<string, unknown>;
    createdAt: Date;
    startedAt: Date | null;
    finishedAt: Date | null;
}
