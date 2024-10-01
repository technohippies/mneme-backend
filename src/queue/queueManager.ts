import { Queue, Worker, QueueOptions, WorkerOptions } from 'bullmq';
import { getRedisClient } from '../services/dragonflyDb/redisClient';
import { config } from '../config/environment';

console.log(`Connecting to Valkey at ${config.valkeyHost}:${config.valkeyPort}`);

export async function createQueue(name: string): Promise<Queue> {
  console.log(`Creating queue: {${name}}`);
  const connection = await getRedisClient();
  const queue = new Queue(`{${name}}`, { connection } as QueueOptions);
  
  queue.on('error', (error) => {
    console.error(`Queue {${name}} error:`, error);
  });

  return queue;
}

export async function createWorker(queueName: string, processor: (job: any) => Promise<void>): Promise<Worker> {
  console.log(`Creating worker for queue: {${queueName}}`);
  const connection = await getRedisClient();
  const worker = new Worker(`{${queueName}}`, processor, { connection } as WorkerOptions);
  
  worker.on('error', (error) => {
    console.error(`Worker for queue {${queueName}} error:`, error);
  });

  return worker;
}