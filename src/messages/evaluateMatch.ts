import type { Message } from "discord.js";

import type { Condition } from "../types";

export const evaluateMatch = (
  condition: Condition,
  message: Message,
): boolean => {
  const {
    sensitive,
    type,
    include,
    exclude,
    targetUsers = [],
    targetRoles = [],
  } = condition;

  if (targetUsers.length > 0 && !targetUsers.includes(message.author.id))
    return false;
  if (
    targetRoles.length > 0 &&
    (!message.member ||
      !targetRoles.some((roleId) => message.member!.roles.cache.has(roleId)))
  )
    return false;

  switch (type) {
    case "TERM":
      if (include.length === 0 && exclude.length === 0) return false;

      if (include.length > 0) {
        if (
          !include.some((term) =>
            sensitive
              ? message.content.includes(term)
              : message.content.toLowerCase().includes(term.toLowerCase()),
          )
        )
          return false;
      }

      if (exclude.length > 0) {
        if (
          exclude.some((term) =>
            sensitive
              ? message.content.includes(term)
              : message.content.toLowerCase().includes(term.toLowerCase()),
          )
        )
          return false;
      }

      return true;
    default:
      return true;
  }
};
