import { Queue, Worker, QueueOptions, WorkerOptions } from 'bullmq';
import { getRedisClient } from '../services/dragonflyDb/redisClient';
import { config } from '../config/environment';

console.log(`Connecting to Dragonfly at ${config.dragonflyHost}:${config.dragonflyPort}`);

export async function createQueue(name: string): Promise<Queue> {
  console.log(`Creating queue: {${name}}`);
  const connection = await getRedisClient();
  return new Queue(`{${name}}`, { connection } as QueueOptions);
}

export async function createWorker(queueName: string, processor: (job: any) => Promise<void>): Promise<Worker> {
  console.log(`Creating worker for queue: {${queueName}}`);
  const connection = await getRedisClient();
  return new Worker(`{${queueName}}`, processor, { connection } as WorkerOptions);
}