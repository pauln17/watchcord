import type { ConditionService } from "./conditionService";
import type { WatchService } from "./watchService";

export interface IServices {
  watchService: WatchService;
  conditionService: ConditionService;
}
