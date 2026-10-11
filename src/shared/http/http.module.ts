import { Global, Module } from '@nestjs/common';
import { FetchHttpClient } from './adapters/fetch-http-client.js';
import { HttpClientPort } from './ports/http-client.port.js';

@Global()
@Module({
    providers: [{ provide: HttpClientPort, useClass: FetchHttpClient }],
    exports: [HttpClientPort],
})
export class HttpModule {}
