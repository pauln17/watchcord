import { ExtendedClient } from "./discord/ExtendedClient";
import { prisma } from "./lib/prisma";
import { initializeServices } from "./services/initializeServices";

// Create a new client instance
const services = initializeServices(prisma);
export const client = new ExtendedClient(services);
