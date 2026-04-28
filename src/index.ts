import { initializeApp } from "./bootstrap/app";
import { logger } from "./util/logger";

initializeApp().catch((error) => {
  logger.error({
    message: "Failed to initialize application",
    error,
  });
  process.exit(1);
});
