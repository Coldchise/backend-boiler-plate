import type { Request, Response } from "express";
import {
  createUserService,
  getAllUsersService,
} from "./users.service";
import type { CreateUserInput } from "./users.validation";

export async function getUsersController(_req: Request, res: Response) {
  const data = await getAllUsersService();

  res.status(200).json({
    data,
  });
}

export async function createUserController(
  req: Request<unknown, unknown, CreateUserInput>,
  res: Response
) {
  const data = await createUserService(req.body);

  res.status(201).json({
    message: "User created successfully",
    data,
  });
}