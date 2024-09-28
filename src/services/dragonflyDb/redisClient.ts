import IORedis from 'ioredis';
import { config } from '../../config/environment';

const redisClient = new IORedis({
  host: config.dragonflyHost,
  port: config.dragonflyPort,
  password: config.dragonflyPassword,
  maxRetriesPerRequest: null,
  tls: config.dragonflyHost !== 'localhost' ? {
    rejectUnauthorized: false // Set to true in production for better security
  } : undefined
});

redisClient.on('error', (error: Error) => console.log('Redis Client Error', error));

export async function getRedisClient(): Promise<IORedis> {
  return redisClient;
}