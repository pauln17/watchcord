import { initializeApp } from "./lifecycle/app";
import { registerShutdown } from "./lifecycle/shutdown";
import { logger } from "./util/logger";

const { client, queue, worker } = await initializeApp().catch((error) => {
  logger.error({
    message: "The application failed to start",
    error,
  });
  process.exit(1);
});

logger.info({
  message: "The application started successfully",
});

registerShutdown(client, queue, worker, logger);
