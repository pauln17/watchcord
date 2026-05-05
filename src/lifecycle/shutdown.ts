import type { Queue, Worker } from "bullmq";
import type { Client } from "discord.js";

import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import type { ILogger } from "../util/logger";

export const registerShutdown = (
  client: Client,
  queue: Queue,
  worker: Worker,
  logger: ILogger,
): void => {
  let isShuttingDown = false;

  const gracefulShutdown = async () => {
    if (isShuttingDown) {
      process.exit(1);
    }
    isShuttingDown = true;

    try {
      await worker.close();
      await queue.close();
      await redis.quit();
      await prisma.$disconnect();
      await client.destroy();
      process.exit(0);
    } catch (error) {
      logger.error({
        message: "Failed to shutdown the application",
        error,
      });
      process.exit(1);
    }
  };

  process.on(
    "SIGINT",
    () =>
      void gracefulShutdown().catch((error) => {
        logger.error({ message: "Shutdown handler rejected", error });
        process.exit(1);
      }),
  );
  process.on(
    "SIGTERM",
    () =>
      void gracefulShutdown().catch((error) => {
        logger.error({ message: "Shutdown handler rejected", error });
        process.exit(1);
      }),
  );
};
