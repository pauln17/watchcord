export const WatchConditionTypes = ["TERM", "REGEX"] as const;
export type WatchConditionType = (typeof WatchConditionTypes)[number];

export interface WatchCondition {
  id: string;
  watchId: string;
  type: WatchConditionType;
  targetUserId?: string | null;
  targetRoleId?: string | null;
  value: string;
}
