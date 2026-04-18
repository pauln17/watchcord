import type { PrismaClient } from "../../generated/prisma/client";

export class WatchConditionService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
}
