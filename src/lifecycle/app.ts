import type { Queue, Worker } from "bullmq";
import { Client, Collection, GatewayIntentBits } from "discord.js";

import { WatchCache } from "../cache/watchCache";
import { commandModules } from "../commands";
import { handleInteractionCreate } from "../events/interactionCreate";
import { queue, startWorker } from "../lib/bullmq";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import {
  ConditionRepository,
  type IRepositories,
  WatchRepository,
} from "../repositories";
import { ConditionService, type IServices, WatchService } from "../services";
import type { Command } from "../types";
import { logger } from "../util/logger";

export const initializeApp = async (): Promise<{
  client: Client;
  queue: Queue;
  worker: Worker;
}> => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  const cache = new WatchCache(redis, logger);

  const repositories: IRepositories = {
    watchRepository: new WatchRepository(prisma),
    conditionRepository: new ConditionRepository(prisma),
  };

  const services: IServices = {
    watchService: new WatchService(repositories, cache),
    conditionService: new ConditionService(repositories, cache),
  };

  const commands = new Collection<string, Command>(
    Object.values(commandModules).map((command) => [
      command.data.name,
      command,
    ]),
  );

  const worker = await startWorker(client, services, logger);

  client.on("interactionCreate", async (interaction) => {
    await handleInteractionCreate(
      client,
      interaction,
      services,
      commands,
      logger,
    );
  });

  client.on("messageCreate", async (message) => {
    const messageData = {
      authorId: message.author.id,
      guildId: message.guildId,
      channelId: message.channelId,
      url: message.url,
      content: message.content,
    };

    try {
      await queue.add("process-message", messageData);
    } catch (error) {
      logger.error({
        message: "Failed to enqueue message for processing",
        error,
      });
    }
  });

  worker.on("error", (err) => {
    logger.error({
      message: "Worker Error",
      error: err,
    });
  });

  await client.login(process.env.DISCORD_TOKEN);

  return { client, queue, worker };
};
