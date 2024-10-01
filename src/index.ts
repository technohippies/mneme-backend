import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { startXMTPListener } from './services/xmtp/xmtpListener';
import { createQueue } from './queue/queueManager';
import './queue/workers/messageProcessor';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';

console.log('Current working directory:', process.cwd());
console.log('Attempting to load .env file...');
const result = dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}

const redis = new Redis({
  host: process.env.DRAGONFLY_HOST || 'localhost',
  port: parseInt(process.env.DRAGONFLY_PORT || '6379'),
  password: process.env.DRAGONFLY_PASSWORD, // Only if you've set a password
});

async function main() {
  const app = new Hono();

  // Create Queue
  const xmtpQueue = await createQueue('xmtp-messages');

  // Start XMTP listener
  startXMTPListener().catch(error => {
    console.error('Error starting XMTP listener:', error);
  });

  // Start server
  const port = 3002;
  serve({
    fetch: app.fetch,
    port: port
  }, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await xmtpQueue.close();
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Error in main function:', error);
  process.exit(1);
});