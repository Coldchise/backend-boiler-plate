import { Router } from "express";

import {
  getHealthController,
  getReadinessController,
} from "./health.controller";

const healthRouter = Router();

healthRouter.get("/", getHealthController);
healthRouter.get("/ready", getReadinessController);

export default healthRouter;
