import { UnrecoverableError } from "bullmq";
import { type Client, PermissionFlagsBits } from "discord.js";

import { handleMessageCreate } from "../events/messageCreate";
import type { IServices } from "../services";
import type { ILogger } from "../util/logger";

export const PROCESS_MESSAGE_JOB_NAME = "process-message";

export type ProcessMessageJobData = {
  authorId: string;
  guildId: string;
  channelId: string;
  url: string;
  content: string;
};

export async function runProcessMessageJob(
  client: Client,
  services: IServices,
  logger: ILogger,
  data: ProcessMessageJobData,
): Promise<void> {
  const { authorId, guildId, channelId, url, content } = data;
  if (!authorId || !guildId || !channelId || !url || !content)
    throw new UnrecoverableError("Invalid payload for process-message job");

  const [guildScopedWatches, channelScopedWatches] = await Promise.all([
    services.watchService.getGuildScopedWatches(guildId),
    services.watchService.getChannelScopedWatches(guildId, channelId),
  ]);

  const relevantWatches = [...guildScopedWatches, ...channelScopedWatches];

  if (relevantWatches.length === 0)
    throw new UnrecoverableError(
      "No relevant watches found for process-message job",
    );

  const author = await client.guilds.cache
    .get(guildId)
    ?.members.fetch(authorId);
  if (!author)
    throw new UnrecoverableError("Author not found for process-message job");

  const messageData = { authorId, guildId, channelId, url, content };

  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild)
      throw new UnrecoverableError("Guild not found for process-message job");

    const permissionedWatches = await Promise.all(
      relevantWatches.map(async (watch) => {
        const member = await guild.members
          .fetch(watch.userId)
          .catch(() => null);
        if (!member) return;
        if (
          !member.permissionsIn(channelId).has(PermissionFlagsBits.ViewChannel)
        )
          return;
        return watch;
      }),
    ).then((watches) => watches.filter((watch) => watch !== undefined));

    if (permissionedWatches.length === 0) return;

    await handleMessageCreate(permissionedWatches, author, messageData, logger);
  } catch (error) {
    logger.error({
      message: `Failed to process message from author: ${authorId} in guild: ${guildId} ${channelId ? `and channel: ${channelId}` : ""}`,
      error,
    });
    throw new Error("Failed on handleMessageCreate in process-message job");
  }
}
