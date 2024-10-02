import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { startXMTPListener } from './services/xmtp/xmtpListener';
import dotenv from 'dotenv';
import path from 'path';

// Add this type assertion
(globalThis as any).Response = Response;

console.log('Current working directory:', process.cwd());
console.log('Attempting to load .env file...');
const result = dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}

const app = new Hono();

serve(app, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});

// Start XMTP listener with retry
async function startXMTPListenerWithRetry() {
  while (true) {
    try {
      await startXMTPListener();
    } catch (error) {
      console.error('XMTP listener failed:', error);
      console.log('Restarting XMTP listener in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

startXMTPListenerWithRetry().catch(error => {
  console.error('Fatal error in XMTP listener retry loop:', error);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  // Add any necessary cleanup here
  process.exit(0);
});