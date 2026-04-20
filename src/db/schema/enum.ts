import { pgEnum } from "drizzle-orm/pg-core";

export const leaderboardPeriodEnum = pgEnum("leaderboard_period", [
  "weekly",
  "monthly",
  "all_time",
]);

export const leaderboardMetricEnum = pgEnum("leaderboard_metric", [
  "steps",
  "points",
]);

export const boostStatusEnum = pgEnum("boost_status", [
  "active",
  "consumed",
  "expired",
  "cancelled",
]);

export const boostSourceEnum = pgEnum("boost_source", [
  "ad_reward",
  "promo",
  "manual",
]);

export const transactionDirectionEnum = pgEnum("transaction_direction", [
  "in",
  "out",
]);

export const pointsTransactionTypeEnum = pgEnum("points_transaction_type", [
  "walk_reward",
  "withdrawal",
  "bonus",
  "refund",
  "adjustment",
]);

export const celoTransactionTypeEnum = pgEnum("celo_transaction_type", [
  "wallet_sync",
  "shoe_purchase",
  "withdrawal_payout",
  "deposit",
  "refund",
  "adjustment",
]);

export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
]);

export const walletProviderEnum = pgEnum("wallet_provider", ["minipay"]);

export const walletStatusEnum = pgEnum("wallet_status", [
  "connected",
  "disconnected",
]);

export const shoeAcquisitionTypeEnum = pgEnum("shoe_acquisition_type", [
  "starter",
  "purchase",
  "reward",
  "admin_grant",
]);

export const walkSessionStatusEnum = pgEnum("walk_session_status", [
  "active",
  "completed",
  "cancelled",
]);