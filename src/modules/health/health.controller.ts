import type { Request, Response } from "express";

import { getHealthService, getReadinessService } from "./health.service";

export function getHealthController(_req: Request, res: Response) {
  res.status(200).json({
    message: "API is running",
    data: getHealthService(),
  });
}

export async function getReadinessController(_req: Request, res: Response) {
  const data = await getReadinessService();

  res.status(data.ready ? 200 : 503).json({
    message: data.ready ? "API is ready" : "API is not ready",
    data,
  });
}
