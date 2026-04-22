import type { WatchCondition } from "./condition";

export const ScopeTypes = ["GUILD", "CHANNEL"] as const;
export type ScopeType = (typeof ScopeTypes)[number];

export interface Watch {
  id: string;
  name: string;
  userId: string;
  scope: ScopeType;
  guildId: string;
  channelId?: string | null;
  conditions: WatchCondition[];
}
