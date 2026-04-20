import { Router } from "express";

import healthRouter from "../modules/health/health.route";
import usersRouter from "../modules/users/users.route";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/users", usersRouter);

export default apiRouter;