import { db } from "../../db";
import { users } from "../../db/schema";
import type { CreateUserInput } from "./users.validation";

export async function getAllUsersService() {
  return db.select().from(users);
}

export async function createUserService(payload: CreateUserInput) {
  const inserted = await db
    .insert(users)
    .values({
      name: payload.name,
      email: payload.email,
    })
    .returning();

  return inserted[0];
}