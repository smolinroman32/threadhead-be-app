export type LlmJsonRequest = {
    model: string;
    system: string;
    user: string;
    schemaName: string;
    schema: Record<string, unknown>;
};

export abstract class LlmPort {
    abstract completeJson<T>(request: LlmJsonRequest): Promise<T>;
}
