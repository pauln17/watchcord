import IORedis from "ioredis";

export const redis = new IORedis({ maxRetriesPerRequest: null });

export type IORedisType = InstanceType<typeof IORedis>;
