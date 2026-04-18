import { ExtendedClient } from "./classes/ExtendedClient";
import { prisma } from "./lib/prisma";
import { initializeServices } from "./services";

// Create a new client instance
const services = initializeServices(prisma);
export const client = new ExtendedClient(services);
