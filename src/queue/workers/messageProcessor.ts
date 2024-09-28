import { createWorker } from '../queueManager';
import { setupXMTP } from '../../services/xmtp/client';
import { handleMessage } from '../../services/xmtp/messageHandler';
import { scoreAudio } from '../../utils/scoreAudio';

import { DecodedMessage } from '@xmtp/xmtp-js';
import { Job } from 'bullmq';

async function processMessage(job: Job) {
  const { senderAddress, content, sent } = job.data;
  console.log(`[processMessage] Received job:`, { senderAddress, content, sent });

  try {
    const [xmtp] = await Promise.all([
      setupXMTP(),
    ]);

    console.log(`[processMessage] XMTP client address: ${xmtp.address}`);

    if (senderAddress === xmtp.address) {
      console.log('[processMessage] Skipping message from self');
      return;
    }

    const partialMessage: Partial<DecodedMessage> = {
      senderAddress,
      content,
      sent: new Date(sent),
    };

    console.log('[processMessage] Calling handleMessage with:', partialMessage);
    const updatedUser = await handleMessage(partialMessage as DecodedMessage, content);
    if (updatedUser) {
      console.log('[processMessage] User updated:', updatedUser);
    } else {
      console.log('[processMessage] No user update required');
    }
  } catch (error) {
    console.error(`[processMessage] Error processing job ${job.id}:`, error);
    throw error;
  }
}

async function main() {
  const worker = await createWorker('xmtp-messages', processMessage);

  worker.on('completed', (job) => {
    if (job) {
      console.log(`Job ${job.id} completed successfully`);
    } else {
      console.log('Job completed, but job details are not available.');
    }
  });

  worker.on('failed', (job, err) => {
    if (job) {
      console.error(`Failed to process message ${job.id}:`, err);
    } else {
      console.error('Job failed, but job details are not available:', err);
    }
  });

  console.log('Worker started');
}

main().catch(error => {
  console.error('Error in main function:', error);
  process.exit(1);
});