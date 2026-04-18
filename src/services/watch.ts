import type { PrismaClient } from "../../generated/prisma/client";

export interface IWatchService {}

export class WatchService implements IWatchService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
}
