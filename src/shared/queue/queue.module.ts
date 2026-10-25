import { Module } from '@nestjs/common';
import { QueueFactory } from './queue.factory.js';

@Module({
    providers: [QueueFactory],
    exports: [QueueFactory],
})
export class QueueModule {}
