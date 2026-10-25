import { Module } from '@nestjs/common';
import { OpenAiLlmClient } from './adapters/openai-llm.client.js';
import { LlmPort } from './ports/llm.port.js';

@Module({
    providers: [{ provide: LlmPort, useClass: OpenAiLlmClient }],
    exports: [LlmPort],
})
export class LlmModule {}
