import { ExtendedClient } from "./discord/ExtendedClient";
import { prisma } from "./lib/prisma";
import { redis } from "./lib/redis";
import { initializeServices } from "./services/initializeServices";

await redis.connect();

const services = await initializeServices(prisma, redis);
export const client = new ExtendedClient(services, redis);
