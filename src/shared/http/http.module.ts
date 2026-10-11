import { Global, Module } from '@nestjs/common';
import { FetchHttpClient } from './fetch-http-client.js';
import { HttpClientPort } from './ports/http-client.port.js';

// Global so any module can inject HttpClientPort; swap FetchHttpClient here to change the client.
@Global()
@Module({
    providers: [{ provide: HttpClientPort, useClass: FetchHttpClient }],
    exports: [HttpClientPort],
})
export class HttpModule {}
