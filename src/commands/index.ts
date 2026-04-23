import type { CommandType } from "../types";
import * as cmds from "./info/cmds";
import * as info from "./info/info";
import * as watch from "./watch/watch";

export const commands: Record<string, CommandType> = {
  info,
  cmds,
  watch,
};
