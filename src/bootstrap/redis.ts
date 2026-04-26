import { SCHEMA_FIELD_TYPE } from "redis";

import { redis } from "../lib/redis";

export const initializeRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }

  try {
    await redis.ft.create(
      "idx:watches",
      {
        "$.id": { type: SCHEMA_FIELD_TYPE.TAG, AS: "id" },
        "$.userId": { type: SCHEMA_FIELD_TYPE.TAG, AS: "userId" },
        "$.guildId": { type: SCHEMA_FIELD_TYPE.TAG, AS: "guildId" },
        "$.scope": { type: SCHEMA_FIELD_TYPE.TAG, AS: "scope" },
        "$.channelId": { type: SCHEMA_FIELD_TYPE.TAG, AS: "channelId" },
      },
      {
        ON: "JSON",
        PREFIX: "wc:watches:",
      },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    if (!/already exists/i.test(msg)) {
      throw err;
    }
  }

  return redis;
};
