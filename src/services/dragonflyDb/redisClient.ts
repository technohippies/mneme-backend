import IORedis from 'ioredis';
import { config } from '../../config/environment';

console.log(`Attempting to connect to Valkey at ${config.valkeyHost}:${config.valkeyPort}`);

const redisClient = new IORedis({
  host: config.valkeyHost,
  port: config.valkeyPort,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    console.log(`Retrying connection, attempt ${times}. Next attempt in ${delay}ms`);
    return delay;
  },
  connectTimeout: 10000,
});

redisClient.on('error', (error: Error) => {
  console.log('Valkey Client Error', error);
  if (error.message.includes('ECONNREFUSED')) {
    console.error('Connection refused. Is Valkey running and accessible?');
  } else if (error.message.includes('ECONNRESET')) {
    console.error('Connection reset. Valkey might be overloaded or misconfigured.');
  } else {
    console.error('Detailed Valkey error:', error);
  }
});

redisClient.on('connect', () => console.log('Successfully connected to Valkey'));
redisClient.on('ready', () => console.log('Valkey client is ready'));
redisClient.on('close', () => console.log('Valkey connection closed'));
redisClient.on('reconnecting', () => console.log('Reconnecting to Valkey'));
redisClient.on('end', () => console.log('Valkey connection ended'));

// Add a ping function to test the connection
async function pingValkey() {
  try {
    const result = await redisClient.ping();
    console.log('Ping result:', result);
  } catch (error) {
    console.error('Ping failed:', error);
  }
}

// Ping Valkey every 5 seconds
setInterval(pingValkey, 5000);

export async function getRedisClient(): Promise<IORedis> {
  return redisClient;
}