import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../config/env";

const queryClient = postgres(env.DATABASE_URL, {
  prepare: false,
});

export const db = drizzle(queryClient);