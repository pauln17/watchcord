import type { WatchCondition } from "./condition";

export interface Watch {
  id: string;
  name: string;
  userId: string;
  guildId: string;
  channelId: string;
  conditions: WatchCondition[];
}
