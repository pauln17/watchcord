export const ConditionTypes = ["ANY", "TERM"] as const;
export type ConditionType = (typeof ConditionTypes)[number];

export interface Condition {
  id: string;
  watchId: string;
  name: string;
  type: ConditionType;
  sensitive: boolean;
  include: string[];
  exclude: string[];
  targetUsers: string[];
  targetRoles: string[];
}
