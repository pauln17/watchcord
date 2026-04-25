import type { ConditionService } from "./condition";
import type { WatchService } from "./watch";

export interface IServices {
  watchService: WatchService;
  conditionService: ConditionService;
}
