import { redis } from "../lib/redis";

export const initializeRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }

  return redis;
};
