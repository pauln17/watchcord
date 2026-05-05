import { type Job, Queue, UnrecoverableError, Worker } from "bullmq";
import { type Client } from "discord.js";
import IORedis from "ioredis";

import { handleMessageCreate } from "../events/messageCreate";
import { notifyUser } from "../messages/notifyUser";
import type { IServices } from "../services";
import type { Condition } from "../types";
import type { ILogger } from "../util/logger";

export const connection = new IORedis({ maxRetriesPerRequest: null });

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
  connection,
});

export const startWorker = async (
  client: Client,
  services: IServices,
  logger: ILogger,
) => {
  const worker = new Worker(
    "watchcord-tasks",
    async (job: Job) => {
      if (job.name === "process-message") {
        const { authorId, guildId, channelId, url, content } = job.data;
        if (!authorId || !guildId || !channelId || !url || !content)
          throw new UnrecoverableError(
            "Invalid payload for process-message job",
          );

        const [guildScopedWatches, channelScopedWatches] = await Promise.all([
          services.watchService.getGuildScopedWatches(guildId),
          services.watchService.getChannelScopedWatches(guildId, channelId),
        ]);

        const relevantWatches = [
          ...guildScopedWatches,
          ...channelScopedWatches,
        ];

        if (relevantWatches.length === 0)
          throw new UnrecoverableError(
            "No relevant watches found for process-message job",
          );

        const author = await client.guilds.cache
          .get(guildId)
          ?.members.fetch(authorId);
        if (!author)
          throw new UnrecoverableError(
            "Author not found for process-message job",
          );

        const messageData = { authorId, guildId, channelId, url, content };

        try {
          await handleMessageCreate(
            relevantWatches,
            author,
            messageData,
            logger,
          );
        } catch (error) {
          logger.error({
            message: `Failed to process message from author: ${authorId} in guild: ${guildId} ${channelId ? `and channel: ${channelId}` : ""}`,
            error,
          });
          throw new Error(
            "Failed on handleMessageCreate in process-message job",
          );
        }
      }

      if (job.name === "notify-user") {
        const { watch, matchedConditionIds, messageData } = job.data;
        if (
          !watch ||
          (Array.isArray(matchedConditionIds) &&
            matchedConditionIds.length === 0) ||
          !messageData
        )
          throw new UnrecoverableError("Invalid payload for notify-user job");

        const fetchedConditions = await Promise.all(
          matchedConditionIds.map(async (conditionId: string) => {
            const condition = await services.conditionService.getUserCondition(
              conditionId,
              watch.userId,
            );
            if (!condition)
              throw new UnrecoverableError(
                "Condition not found for notify-user job",
              );
            return condition;
          }),
        ).then((conditions) =>
          conditions.filter((condition: Condition) => condition !== undefined),
        );

        if (fetchedConditions.length === 0)
          throw new UnrecoverableError(
            "No conditions found for notify-user job",
          );

        try {
          await notifyUser(
            client,
            watch,
            fetchedConditions,
            messageData,
            logger,
          );
        } catch (error) {
          logger.error({
            message: `Failed to send notification on watch: ${watch.id} to user: ${watch.userId}`,
            error,
          });
          throw new Error("Failed on notifyUser in notify-user job");
        }
      }
    },
    { concurrency: 50, connection },
  );

  return worker;
};
