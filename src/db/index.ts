import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../config/env";

function isSupabaseDatabaseUrl(databaseUrl: string) {
  try {
    const hostname = new URL(databaseUrl).hostname;
    return hostname.endsWith(".supabase.com");
  } catch {
    return false;
  }
}

function resolveDatabaseSsl() {
  if (env.DATABASE_SSL === "true") return "require";
  if (env.DATABASE_SSL === "false") return false;
  return isSupabaseDatabaseUrl(env.DATABASE_URL) ? "require" : false;
}

const queryClient = postgres(env.DATABASE_URL, {
  prepare: false,
  ssl: resolveDatabaseSsl(),
});

export const db = drizzle(queryClient);

export async function checkDbConnection() {
  await queryClient`select 1`;
}

export async function closeDb() {
  await queryClient.end({ timeout: 5 });
}
