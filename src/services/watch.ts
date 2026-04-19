import type { PrismaClient } from "../../generated/prisma/client";
import type { Watch } from "../types/watch";

export interface IWatchService {
  getWatchById: (id: string, userId: string) => Promise<Watch | null>;
  getWatchesByName: (name: string, userId: string) => Promise<Watch[] | null>;
  createWatch: (watch: Watch) => Promise<Watch>;
  updateWatch: (
    id: string,
    userId: string,
    watch: Partial<Watch>,
  ) => Promise<Watch | null>;
  deleteWatch: (id: string, userId: string) => Promise<void>;
}

export class WatchService implements IWatchService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  getWatchById = async (id: string, userId: string): Promise<Watch | null> => {
    return await this.prisma.watch.findUnique({
      where: { id, userId },
    });
  };

  getWatchesByName = async (
    name: string,
    userId: string,
  ): Promise<Watch[] | null> => {
    return await this.prisma.watch.findMany({
      where: { name, userId },
    });
  };

  createWatch = async (watch: Watch): Promise<Watch> => {
    return await this.prisma.watch.create({
      data: {
        name: watch.name,
        userId: watch.userId,
        guildId: watch.guildId,
        channelId: watch.channelId,
      },
    });
  };

  updateWatch = async (
    id: string,
    userId: string,
    watch: Partial<Watch>,
  ): Promise<Watch | null> => {
    return await this.prisma.watch.update({
      where: { id, userId },
      data: watch,
    });
  };

  deleteWatch = async (id: string, userId: string): Promise<void> => {
    await this.prisma.watch.delete({
      where: { id, userId },
    });
  };
}
