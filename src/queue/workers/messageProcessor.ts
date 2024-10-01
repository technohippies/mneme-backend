import { createWorker } from '../queueManager';
import { setupXMTP } from '../../services/xmtp/client';
import { handleMessage } from '../../services/xmtp/messageHandler';
import { Job } from 'bullmq';

console.log('messageProcessor.ts is being executed');

async function processMessage(job: Job) {
  console.log(`[processMessage] Received job:`, job.data);
  // ... rest of the function
}

async function main() {
  console.log('Starting worker in messageProcessor.ts');
  try {
    const worker = await createWorker('xmtp-messages', processMessage);

    worker.on('completed', (job) => {
      console.log(`Job ${job?.id || 'unknown'} completed successfully`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Failed to process message ${job?.id || 'unknown'}:`, err);
    });

    worker.on('error', (err) => {
      console.error('Worker error:', err);
    });

    console.log('Worker started successfully in messageProcessor.ts');
  } catch (error) {
    console.error('Error creating worker:', error);
  }
}

main().catch(error => {
  console.error('Error in messageProcessor main function:', error);
});

console.log('End of messageProcessor.ts file');