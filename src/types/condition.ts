export const WatchConditionTypes = ["USER", "TERM", "REGEX"] as const;
export type WatchConditionType = (typeof WatchConditionTypes)[number];

export interface WatchCondition {
  id: string;
  watchId: string;
  type: WatchConditionType;
  value: string;
}
