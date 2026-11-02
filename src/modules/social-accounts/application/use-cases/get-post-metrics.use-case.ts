import { Injectable } from '@nestjs/common';
import { PostPagePort } from '../../domain/ports/post-page.port.js';

@Injectable()
export class GetPostMetricsUseCase {
    constructor(private readonly postPage: PostPagePort) {}

    execute(permalink: string) {
        return this.postPage.getMetrics(permalink);
    }
}
