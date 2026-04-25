import type { WatchConditionService } from "./watch-condition";
import type { WatchService } from "./watch";

export interface IServices {
  watchService: WatchService;
  watchConditionService: WatchConditionService;
}
