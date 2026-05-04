import { Queue, Worker } from "bullmq";
import { type Client } from "discord.js";
import IORedis from "ioredis";

import { handleMessageCreate } from "../events/messageCreate";
import { notifyUser } from "../messages/notifyUser";
import type { IServices } from "../services";
import type { Condition } from "../types";
import type { ILogger } from "../util/logger";

export const connection = new IORedis({ maxRetriesPerRequest: null });

export const queue = new Queue("watchcord-tasks", {
  defaultJobOptions: {},
  connection,
});

export const startWorker = async (
  client: Client,
  services: IServices,
  logger: ILogger,
) => {
  const worker = new Worker(
    "watchcord-tasks",
    async (job) => {
      if (job.name === "process-message") {
        const { authorId, guildId, channelId, url, content } = job.data;
        if (!authorId || !guildId || !channelId || !url || !content) return;

        const [guildScopedWatches, channelScopedWatches] = await Promise.all([
          services.watchService.getGuildScopedWatches(guildId),
          services.watchService.getChannelScopedWatches(guildId, channelId),
        ]);

        const relevantWatches = [
          ...guildScopedWatches,
          ...channelScopedWatches,
        ];

        const author = await client.guilds.cache
          .get(guildId)
          ?.members.fetch(authorId);
        if (!author) return;

        const messageData = { author, guildId, channelId, url, content };

        try {
          await handleMessageCreate(relevantWatches, messageData, logger);
        } catch (error) {
          logger.error({
            message: `Failed to process message from author: ${authorId} in guild: ${guildId} ${channelId ? `and channel: ${channelId}` : ""}`,
            error,
          });
        }
      }

      if (job.name === "notify-user") {
        const { watch, matchedConditionIds, messageData } = job.data;

        const fetchedConditions = await Promise.all(
          matchedConditionIds.map(async (conditionId: string) => {
            const condition = await services.conditionService.getUserCondition(
              conditionId,
              watch.userId,
            );
            if (!condition) return;
            return condition;
          }),
        ).then((conditions) =>
          conditions.filter((condition: Condition) => condition !== undefined),
        );

        if (fetchedConditions.length === 0) return;

        try {
          await notifyUser(client, watch, fetchedConditions, messageData);
        } catch (error) {
          logger.error({
            message: `Failed to send notification on watch: ${watch.id} to user: ${watch.userId}`,
            error,
          });
        }
      }
    },
    { concurrency: 50, connection },
  );

  return worker;
};
