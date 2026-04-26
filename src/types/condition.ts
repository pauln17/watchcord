export const WatchConditionTypes = ["TERM", "REGEX"] as const;
export type WatchConditionType = (typeof WatchConditionTypes)[number];

export interface WatchCondition {
  id: string;
  watchId: string;
  name: string;
  type: WatchConditionType;
  targetUserIds: string[];
  targetRoleIds: string[];
  value: string;
}
