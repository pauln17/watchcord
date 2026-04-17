import * as info from "./info/info";
import * as cmds from "./info/cmds";
import type { CommandType } from "../types/command";

export const commands: Record<string, CommandType> = {
  info,
  cmds,
};
