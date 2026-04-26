import type { PrismaClient } from "../../generated/prisma/client";
import type { Watch } from "../types";

export interface IWatchRepository {
  findAll: () => Promise<Watch[]>;
  findManyGuildScopedByGuildId: (guildId: string) => Promise<Watch[]>;
  findManyChannelScopedByGuildIdAndChannelId: (
    guildId: string,
    channelId: string,
  ) => Promise<Watch[]>;
  findByIdAndUserId: (id: string, userId: string) => Promise<Watch | null>;
  findManyByUserIdAndGuildId: (
    userId: string,
    guildId: string,
  ) => Promise<Watch[]>;
  create: (data: Omit<Watch, "id" | "conditions">) => Promise<Watch>;
  updateById: (
    id: string,
    data: Partial<Omit<Watch, "id" | "conditions">>,
  ) => Promise<Watch>;
  deleteById: (id: string) => Promise<Watch>;
}

export class WatchRepository implements IWatchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll = async (): Promise<Watch[]> => {
    return await this.prisma.watch.findMany({
      include: { conditions: true },
    });
  };

  findManyGuildScopedByGuildId = async (guildId: string): Promise<Watch[]> => {
    return await this.prisma.watch.findMany({
      where: { scope: "GUILD", guildId },
      include: { conditions: true },
    });
  };

  findManyChannelScopedByGuildIdAndChannelId = async (
    guildId: string,
    channelId: string,
  ): Promise<Watch[]> => {
    return await this.prisma.watch.findMany({
      where: { scope: "CHANNEL", guildId, channelId },
      include: { conditions: true },
    });
  };

  findByIdAndUserId = async (
    id: string,
    userId: string,
  ): Promise<Watch | null> => {
    return await this.prisma.watch.findFirst({
      where: { id, userId },
      include: { conditions: true },
    });
  };

  findManyByUserIdAndGuildId = async (
    userId: string,
    guildId: string,
  ): Promise<Watch[]> => {
    return await this.prisma.watch.findMany({
      where: { userId, guildId },
      include: { conditions: true },
    });
  };

  create = async (data: Omit<Watch, "id" | "conditions">): Promise<Watch> => {
    return await this.prisma.watch.create({
      data,
      include: { conditions: true },
    });
  };

  updateById = async (
    id: string,
    data: Partial<Omit<Watch, "id" | "conditions">>,
  ): Promise<Watch> => {
    return await this.prisma.watch.update({
      where: { id },
      data,
      include: { conditions: true },
    });
  };

  deleteById = async (id: string): Promise<Watch> => {
    return await this.prisma.watch.delete({
      where: { id },
      include: { conditions: true },
    });
  };
}
