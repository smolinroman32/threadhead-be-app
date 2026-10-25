import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { type Processor, Queue, Worker, type WorkerOptions } from 'bullmq';
import { Redis } from 'ioredis';
import { getEnv } from '../env/get-env.js';

@Injectable()
export class QueueFactory implements OnModuleDestroy {
    private readonly connection = new Redis(getEnv('REDIS_URL'), { maxRetriesPerRequest: null });
    private readonly queues: Queue[] = [];
    private readonly workers: Worker[] = [];

    createQueue(name: string) {
        const queue = new Queue(name, { connection: this.connection });

        this.queues.push(queue);

        return queue;
    }

    createWorker<T>(name: string, processor: Processor<T>, options: Omit<WorkerOptions, 'connection'> = {}) {
        const worker = new Worker<T>(name, processor, { ...options, connection: this.connection });

        this.workers.push(worker);

        return worker;
    }

    async onModuleDestroy() {
        await Promise.all(this.workers.map((worker) => worker.close()));
        await Promise.all(this.queues.map((queue) => queue.close()));
        await this.connection.quit();
    }
}
