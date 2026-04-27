export const ConditionTypes = ["TERM", "REGEX"] as const;
export type ConditionType = (typeof ConditionTypes)[number];

export interface Condition {
  id: string;
  watchId: string;
  name: string;
  type: ConditionType | null;
  targetUserIds: string[];
  targetRoleIds: string[];
  value: string | null;
}
