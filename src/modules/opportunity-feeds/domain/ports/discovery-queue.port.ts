export abstract class DiscoveryQueuePort {
    abstract enqueue(runId: string, delayMs?: number): Promise<void>;
}
