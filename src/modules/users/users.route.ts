import { Router } from "express";
import {
  createUserController,
  getUsersController,
} from "./users.controller";
import { createUserSchema } from "./users.validation";
import { validate } from "../../middlewares/validate.middleware";

const usersRouter = Router();

usersRouter.get("/", getUsersController);
usersRouter.post("/", validate({ body: createUserSchema }), createUserController);

export default usersRouter;