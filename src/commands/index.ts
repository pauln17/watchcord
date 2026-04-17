import type { CommandType } from "../types/command";
import * as cmds from "./info/cmds";
import * as info from "./info/info";

export const commands: Record<string, CommandType> = {
  info,
  cmds,
};
