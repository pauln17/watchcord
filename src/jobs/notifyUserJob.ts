import { UnrecoverableError } from "bullmq";
import type { Client } from "discord.js";

import { notifyUser } from "../messages/notifyUser";
import type { IServices } from "../services";
import type { Condition, Watch } from "../types";
import type { ILogger } from "../util/logger";

export const NOTIFY_USER_JOB_NAME = "notify-user";

export type NotifyUserJobData = {
  watch: Watch;
  matchedConditionIds: string[];
  messageData: {
    authorId: string;
    guildId: string;
    channelId: string;
    url: string;
    content: string;
  };
};

export async function runNotifyUserJob(
  client: Client,
  services: IServices,
  logger: ILogger,
  data: NotifyUserJobData,
): Promise<void> {
  const { watch, matchedConditionIds, messageData } = data;
  if (
    !watch ||
    (Array.isArray(matchedConditionIds) && matchedConditionIds.length === 0) ||
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
        throw new UnrecoverableError("Condition not found for notify-user job");
      return condition;
    }),
  ).then((conditions) =>
    conditions.filter((condition: Condition) => condition !== undefined),
  );

  if (fetchedConditions.length === 0)
    throw new UnrecoverableError("No conditions found for notify-user job");

  try {
    await notifyUser(client, watch, fetchedConditions, messageData, logger);
  } catch (error) {
    logger.error({
      message: `Failed to send notification on watch: ${watch.id} to user: ${watch.userId}`,
      error,
    });

    throw error;
  }
}
