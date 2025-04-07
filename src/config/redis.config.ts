import { redisStore } from 'cache-manager-redis-store';

export const redisConfig = {
  store: redisStore,
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  ttl: 60 * 60 * 1000, // 1 hour default TTL
  max: 100, // Maximum number of items in cache
  isGlobal: true,
};

// Cache TTL constants (in ms)
export const CACHE_TTL = {
  HISTORY: 3600000,  // 1 hour
  SYMBOLS: 86400000, // 24 hours
  PRICES: 300000,    // 5 minutes
}; 