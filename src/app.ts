import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import apiRouter from "./routes";
import { AppError } from "./lib/app-error";

export const app = express();

function isAllowedOrigin(origin: string | undefined) {
  if (!origin) return true;
  if (env.NODE_ENV !== "production") return true;
  return env.CORS_ORIGINS.includes(origin);
}

app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new AppError("CORS origin is not allowed", 403));
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Walk-to-Earn API",
    status: "ok",
  });
});

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
