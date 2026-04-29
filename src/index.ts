import { initializeApp } from "./bootstrap/app";
import { logger } from "./util/logger";

initializeApp()
  .catch((error) => {
    logger.error({
      message: "The application failed to start",
      error,
    });
    process.exit(1);
  })
  .then(() => {
    logger.info({
      message: "The application started successfully",
    });
  });
