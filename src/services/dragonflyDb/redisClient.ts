import IORedis from 'ioredis';
import { config } from '../../config/environment';

console.log(`Attempting to connect to Valkey at ${config.valkeyHost}:${config.valkeyPort}`);
console.log(`Using password: ${config.valkeyPassword ? 'Yes' : 'No'}`);

const redisClient = new IORedis({
  host: config.valkeyHost,
  port: config.valkeyPort,
  password: config.valkeyPassword,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 1000, 15000);
    console.log(`Retrying connection, attempt ${times}. Next attempt in ${delay}ms`);
    return delay;
  },
  reconnectOnError: (err) => {
    console.log('Reconnect on error:', err.message);
    return true; // Always reconnect on error
  },
  connectTimeout: 30000,
  enableReadyCheck: false,
  lazyConnect: true,
});

redisClient.on('error', (error: Error) => {
  console.error('Valkey Client Error:', error.message);
  console.error('Error stack:', error.stack);
});

redisClient.on('connect', () => console.log('Successfully connected to Valkey'));
redisClient.on('ready', () => console.log('Valkey client is ready'));
redisClient.on('close', () => console.log('Valkey connection closed'));
redisClient.on('reconnecting', () => console.log('Reconnecting to Valkey'));
redisClient.on('end', () => console.log('Valkey connection ended'));

export async function getRedisClient(): Promise<IORedis> {
  if (!redisClient.status || redisClient.status === 'wait') {
    console.log('Connecting to Redis...');
    try {
      await redisClient.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }
  return redisClient;
}