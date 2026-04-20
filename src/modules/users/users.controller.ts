import type { Request, Response } from "express";

import {
  createUserService,
  getUserProfileService,
} from "./users.service";
import type {
  CreateUserInput,
  GetUserParams,
} from "./users.validation";

export async function createUserController(
  req: Request<unknown, unknown, CreateUserInput>,
  res: Response
) {
  const data = await createUserService(req.body);

  res.status(201).json({
    message: "User profile created successfully",
    data,
  });
}

export async function getUserProfileController(
  req: Request<GetUserParams>,
  res: Response
) {
  const data = await getUserProfileService(req.params.userId);

  if (!data) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    data,
  });
}