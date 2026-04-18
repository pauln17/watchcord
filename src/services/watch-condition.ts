import type { PrismaClient } from "../../generated/prisma/client";

export interface IWatchConditionService {}

export class WatchConditionService implements IWatchConditionService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
}
