import { Router } from "express";

import { validate } from "../../middlewares/validate.middleware";
import {
  createUserController,
  getUserProfileController,
} from "./users.controller";
import {
  createUserSchema,
  getUserParamsSchema,
} from "./users.validation";

const usersRouter = Router();

usersRouter.post("/", validate({ body: createUserSchema }), createUserController);
usersRouter.get(
  "/:userId",
  validate({ params: getUserParamsSchema }),
  getUserProfileController
);

export default usersRouter;