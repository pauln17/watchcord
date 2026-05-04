import type { GuildMember } from "discord.js";

import type { Condition } from "../types";

export const evaluateMatch = (
  condition: Condition,
  author: GuildMember,
  content: string,
): boolean => {
  const {
    sensitive,
    type,
    include,
    exclude,
    targetUsers = [],
    targetRoles = [],
  } = condition;

  if (targetUsers.length > 0 && !targetUsers.includes(author.id)) return false;
  if (
    targetRoles.length > 0 &&
    (!author || !targetRoles.some((roleId) => author.roles.cache.has(roleId)))
  )
    return false;

  switch (type) {
    case "ANY":
      return true;
    case "TERM":
      if (include.length === 0 && exclude.length === 0) return false;

      if (include.length > 0) {
        if (
          !include.some((term) =>
            sensitive
              ? content.includes(term)
              : content.toLowerCase().includes(term.toLowerCase()),
          )
        )
          return false;
      }

      if (exclude.length > 0) {
        if (
          exclude.some((term) =>
            sensitive
              ? content.includes(term)
              : content.toLowerCase().includes(term.toLowerCase()),
          )
        )
          return false;
      }

      return true;
    default:
      return false;
  }
};
