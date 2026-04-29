import { Client, Collection, GatewayIntentBits } from "discord.js";

import { WatchCache } from "../cache/watchCache";
import { commandModules } from "../commands";
import { handleInteractionCreate } from "../events/interactionCreate";
import { handleMessageCreate } from "../events/messageCreate";
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

export const initializeApp = async (): Promise<void> => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  if (!redis.isOpen) {
    await redis.connect();
  }

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
    await handleMessageCreate(client, message, services, logger);
  });

  await client.login(process.env.DISCORD_TOKEN);
};
