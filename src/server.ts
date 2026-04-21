import { app } from "./app";
import { env } from "./config/env";
import { closeDb } from "./db";

const server = app.listen(env.PORT, () => {
  console.log(`Walk-to-Earn API running on http://localhost:${env.PORT}`);
});

let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`${signal} received. Shutting down API server...`);

  server.close(async (error) => {
    if (error) {
      console.error("HTTP server shutdown failed:", error);
      process.exitCode = 1;
    }

    try {
      await closeDb();
    } catch (dbError) {
      console.error("Database shutdown failed:", dbError);
      process.exitCode = 1;
    }

    process.exit();
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  void shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  void shutdown("SIGTERM");
});
