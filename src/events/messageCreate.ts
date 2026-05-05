import { GuildMember } from "discord.js";

import { NOTIFY_USER_JOB_NAME } from "../jobs";
import { queue } from "../lib/bullmq";
import { evaluateMatch } from "../messages/evaluateMatch";
import type { Watch } from "../types";
import type { ILogger } from "../util/logger";

export async function handleMessageCreate(
  relevantWatches: Watch[],
  author: GuildMember,
  messageData: {
    authorId: string;
    guildId: string;
    channelId: string;
    url: string;
    content: string;
  },
  logger: ILogger,
) {
  await Promise.all(
    relevantWatches.map(async (watch) => {
      // if (watch.userId === message.author.id) return;
      if (!watch.enabled) return;

      const matchedConditionIds = watch.conditions
        .filter((condition) =>
          evaluateMatch(condition, author, messageData.content),
        )
        .map((condition) => condition.id);

      if (matchedConditionIds.length === 0) return;
      try {
        await queue.add(NOTIFY_USER_JOB_NAME, {
          watch,
          matchedConditionIds,
          messageData,
        });
      } catch (error) {
        logger.error({
          message: "Failed to enqueue notification for user",
          error,
        });
      }
    }),
  );
}
