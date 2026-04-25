import type { IConditionRepository } from "./conditionRepository";
import type { IWatchRepository } from "./watchRepository";

export interface IRepositories {
  watchRepository: IWatchRepository;
  conditionRepository: IConditionRepository;
}
