import { Client, type Message } from "discord.js";

import { evaluateMatch } from "../messages/evaluateMatch";
import { sendAlert } from "../messages/sendAlert";
import type { IServices } from "../services";
import type { ILogger } from "../util/logger";

export async function handleMessageCreate(
  client: Client,
  message: Message,
  services: IServices,
  logger: ILogger,
) {
  const { guildId, channelId, content } = message;
  if (!guildId || !channelId || !content) return;

  try {
    const [guildScopedWatches, channelScopedWatches] = await Promise.all([
      services.watchService.getGuildScopedWatches(guildId),
      services.watchService.getChannelScopedWatches(guildId, channelId),
    ]);

    const watches = [...guildScopedWatches, ...channelScopedWatches];

    await Promise.all(
      watches.map(async (watch) => {
        // if (watch.userId === message.author.id) return;
        if (!watch.enabled) return;

        const filteredConditions = watch.conditions.filter((condition) =>
          evaluateMatch(condition, message),
        );

        if (filteredConditions.length > 0) {
          try {
            await sendAlert(client, watch, filteredConditions, message);
          } catch (error) {
            logger.error({
              message: `Failed to send notification on watch: ${watch.id} to user: ${watch.userId}`,
              error,
            });
          }
        }
      }),
    );
  } catch (error) {
    logger.error({
      message: "An error occurred on message create event handler",
      error,
    });
  }
}
