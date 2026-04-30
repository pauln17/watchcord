import type { Condition } from "./condition";

export const ScopeTypes = ["GUILD", "CHANNEL"] as const;
export type ScopeType = (typeof ScopeTypes)[number];

export interface Watch {
  id: string;
  name: string;
  userId: string;
  enabled: boolean;
  scope: ScopeType;
  conditions: Condition[];
  guildId: string;
  channelId: string | null;
}
