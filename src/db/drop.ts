import postgres from "postgres";

import { env } from "../config/env";

const REQUIRED_CONFIRM_FLAG = "--confirm";

const appTables = [
  "public.user_badges",
  "public.badges",
  "public.celo_ledger",
  "public.points_ledger",
  "public.withdrawal_requests",
  "public.user_leaderboard_stats",
  "public.user_daily_stats",
  "public.walk_sessions",
  "public.boost_activations",
  "public.user_shoes",
  "public.shoe_catalog",
  "public.point_conversion_rates",
  "public.reward_configs",
  "public.wallet_connections",
  "public.user_streaks",
  "public.user_balances",
  "public.profiles",
];

const appEnums = [
  "public.leaderboard_period",
  "public.leaderboard_metric",
  "public.boost_status",
  "public.boost_source",
  "public.transaction_direction",
  "public.points_transaction_type",
  "public.celo_transaction_type",
  "public.withdrawal_status",
  "public.wallet_provider",
  "public.wallet_status",
  "public.shoe_acquisition_type",
  "public.walk_session_status",
];

function getDatabaseTarget() {
  try {
    const parsed = new URL(env.DATABASE_URL);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return "configured database";
  }
}

function assertDropAllowed() {
  if (env.NODE_ENV === "production") {
    throw new Error("Refusing to drop tables when NODE_ENV=production.");
  }

  if (!process.argv.includes(REQUIRED_CONFIRM_FLAG)) {
    throw new Error(
      `Refusing to drop tables without ${REQUIRED_CONFIRM_FLAG}. Run npm run drop -- ${REQUIRED_CONFIRM_FLAG} when you are sure.`
    );
  }
}

async function dropDatabaseObjects() {
  assertDropAllowed();

  const queryClient = postgres(env.DATABASE_URL, {
    prepare: false,
    ssl: env.DATABASE_SSL === "false" ? false : "require",
  });

  try {
    console.log(`Dropping Walk-to-Earn tables on ${getDatabaseTarget()}...`);
    await queryClient.unsafe(`drop table if exists ${appTables.join(", ")} cascade`);
    await queryClient.unsafe(`drop schema if exists drizzle cascade`);
    await queryClient.unsafe(`drop table if exists public.__drizzle_migrations cascade`);

    for (const enumName of appEnums) {
      await queryClient.unsafe(`drop type if exists ${enumName} cascade`);
    }

    console.log("Drop completed");
  } finally {
    await queryClient.end({ timeout: 5 });
  }
}

dropDatabaseObjects().catch((error) => {
  console.error("Drop failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
