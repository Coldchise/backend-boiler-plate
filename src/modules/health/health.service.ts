import { checkDbConnection } from "../../db";
import { env } from "../../config/env";
import { checkSupabaseApiConnection } from "../../lib/supabase";

type CheckStatus = "ok" | "error";

type HealthCheck = {
  name: "database" | "supabaseApi";
  status: CheckStatus;
  message?: string;
  details?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

async function runCheck(
  name: HealthCheck["name"],
  failureMessage: string,
  check: () => Promise<void>
): Promise<HealthCheck> {
  try {
    await check();
    return { name, status: "ok" };
  } catch (error) {
    return {
      name,
      status: "error",
      message: failureMessage,
      details: env.NODE_ENV === "production" ? undefined : getErrorMessage(error),
    };
  }
}

export function getHealthService() {
  return {
    service: "walk-to-earn-api",
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}

export async function getReadinessService() {
  const checks = await Promise.all([
    runCheck("database", "Database connection failed", checkDbConnection),
    runCheck(
      "supabaseApi",
      "Supabase API connection failed",
      checkSupabaseApiConnection
    ),
  ]);

  const ready = checks.every((check) => check.status === "ok");

  return {
    ready,
    status: ready ? "ok" : "error",
    timestamp: new Date().toISOString(),
    checks,
  };
}
