import { type Job, Queue, UnrecoverableError, Worker } from "bullmq";
import { type Client } from "discord.js";

import {
  NOTIFY_USER_JOB_NAME,
  PROCESS_MESSAGE_JOB_NAME,
  runNotifyUserJob,
  runProcessMessageJob,
} from "../jobs";
import type { IServices } from "../services";
import type { ILogger } from "../util/logger";
import { redis } from "./redis";

export const queue = new Queue("watchcord-tasks", {
  defaultJobOptions: {
    attempts: 8,
    backoff: {
      type: "exponential",
      delay: 5000,
      jitter: 0.5,
    },
    removeOnComplete: true,
    removeOnFail: {
      age: 24 * 3600, // 24 hours
    },
  },
  connection: redis,
});

export const startWorker = async (
  client: Client,
  services: IServices,
  logger: ILogger,
) => {
  const worker = new Worker(
    "watchcord-tasks",
    async (job: Job) => {
      if (job.name === PROCESS_MESSAGE_JOB_NAME) {
        await runProcessMessageJob(client, services, logger, job.data);
        return;
      }

      if (job.name === NOTIFY_USER_JOB_NAME) {
        await runNotifyUserJob(client, services, logger, job.data);
        return;
      }

      throw new UnrecoverableError(`Unknown job name: ${job.name}`);
    },
    { concurrency: 10, connection: redis },
  );

  return worker;
};
