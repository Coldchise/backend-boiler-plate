import {
  bigint,
  bigserial,
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { profiles } from "./user.table";
import {
  boostSourceEnum,
  boostStatusEnum,
  celoTransactionTypeEnum,
  leaderboardPeriodEnum,
  pointsTransactionTypeEnum,
  shoeAcquisitionTypeEnum,
  transactionDirectionEnum,
  walletProviderEnum,
  walletStatusEnum,
  walkSessionStatusEnum,
  withdrawalStatusEnum,
} from "./enum";

export const walletConnections = pgTable(
  "wallet_connections",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    provider: walletProviderEnum("provider").notNull().default("minipay"),
    walletAddress: varchar("wallet_address", { length: 128 }).notNull(),
    status: walletStatusEnum("status").notNull().default("connected"),
    isPrimary: boolean("is_primary").notNull().default(false),
    lastSyncedCeloBalance: numeric("last_synced_celo_balance", {
      precision: 20,
      scale: 8,
      mode: "number",
    })
      .notNull()
      .default(0),
    connectedAt: timestamp("connected_at", { withTimezone: true }).defaultNow().notNull(),
    disconnectedAt: timestamp("disconnected_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userCreatedIdx: index("idx_wallet_connections_user_created").on(
      table.userId,
      table.createdAt
    ),
  })
);

export const rewardConfigs = pgTable(
  "reward_configs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    pointsPerStep: numeric("points_per_step", {
      precision: 12,
      scale: 6,
      mode: "number",
    })
      .notNull()
      .default(1),
    defaultBoostMultiplier: numeric("default_boost_multiplier", {
      precision: 8,
      scale: 4,
      mode: "number",
    })
      .notNull()
      .default(1.5),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    effectiveIdx: index("idx_reward_configs_effective").on(table.effectiveFrom),
  })
);

export const pointConversionRates = pgTable(
  "point_conversion_rates",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    assetSymbol: varchar("asset_symbol", { length: 16 }).notNull().default("CELO"),
    pointsPerAsset: numeric("points_per_asset", {
      precision: 20,
      scale: 8,
      mode: "number",
    }).notNull(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    effectiveIdx: index("idx_conversion_rates_effective").on(
      table.assetSymbol,
      table.effectiveFrom
    ),
  })
);

export const shoeCatalog = pgTable(
  "shoe_catalog",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    code: varchar("code", { length: 40 }).notNull().unique(),
    displayName: varchar("display_name", { length: 80 }).notNull(),
    pointsMultiplier: numeric("points_multiplier", {
      precision: 8,
      scale: 4,
      mode: "number",
    }).notNull(),
    priceCelo: numeric("price_celo", {
      precision: 20,
      scale: 8,
      mode: "number",
    })
      .notNull()
      .default(0),
    isFree: boolean("is_free").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

export const userShoes = pgTable(
  "user_shoes",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    shoeId: bigserial("shoe_id", { mode: "number" })
      .notNull()
      .references(() => shoeCatalog.id),
    acquisitionType: shoeAcquisitionTypeEnum("acquisition_type").notNull(),
    acquiredAt: timestamp("acquired_at", { withTimezone: true }).defaultNow().notNull(),
    purchaseCeloAmount: numeric("purchase_celo_amount", {
      precision: 20,
      scale: 8,
      mode: "number",
    }),
    purchaseTxHash: varchar("purchase_tx_hash", { length: 128 }),
    isEquipped: boolean("is_equipped").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userAcquiredIdx: index("idx_user_shoes_user_acquired").on(table.userId, table.acquiredAt),
    userShoeIdx: index("idx_user_shoes_user_shoe").on(table.userId, table.shoeId),
    uniqueOwnedShoeIdx: uniqueIndex("uq_user_owned_shoe").on(table.userId, table.shoeId),
  })
);

export const boostActivations = pgTable(
  "boost_activations",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    source: boostSourceEnum("source").notNull().default("ad_reward"),
    multiplier: numeric("multiplier", {
      precision: 8,
      scale: 4,
      mode: "number",
    }).notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    status: boostStatusEnum("status").notNull().default("active"),
    consumedByWalkId: bigint("consumed_by_walk_id", { mode: "number" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userStatusExpiryIdx: index("idx_boost_user_status_expiry").on(
      table.userId,
      table.status,
      table.expiresAt
    ),
  })
);

export const walkSessions = pgTable(
  "walk_sessions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),

    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationSeconds: integer("duration_seconds").notNull().default(0),

    steps: integer("steps").notNull().default(0),
    distanceKm: numeric("distance_km", {
      precision: 10,
      scale: 3,
      mode: "number",
    })
      .notNull()
      .default(0),
    avgSpeedKmh: numeric("avg_speed_kmh", {
      precision: 10,
      scale: 3,
      mode: "number",
    })
      .notNull()
      .default(0),

    equippedUserShoeId: bigint("equipped_user_shoe_id", { mode: "number" }).references(
      () => userShoes.id
    ),
    shoeMultiplier: numeric("shoe_multiplier", {
      precision: 8,
      scale: 4,
      mode: "number",
    })
      .notNull()
      .default(1),

    boostActivationId: bigint("boost_activation_id", { mode: "number" }).references(
      () => boostActivations.id
    ),
    boostMultiplier: numeric("boost_multiplier", {
      precision: 8,
      scale: 4,
      mode: "number",
    })
      .notNull()
      .default(1),

    pointsPerStep: numeric("points_per_step", {
      precision: 12,
      scale: 6,
      mode: "number",
    })
      .notNull()
      .default(1),
    basePoints: bigint("base_points", { mode: "number" }).notNull().default(0),
    totalPoints: bigint("total_points", { mode: "number" }).notNull().default(0),

    status: walkSessionStatusEnum("status").notNull().default("completed"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userStartedIdx: index("idx_walk_sessions_user_started").on(table.userId, table.startedAt),
    userEndedIdx: index("idx_walk_sessions_user_ended").on(table.userId, table.endedAt),
    leaderboardTimeIdx: index("idx_walk_sessions_leaderboard_time").on(
      table.endedAt,
      table.userId
    ),
  })
);

export const userDailyStats = pgTable(
  "user_daily_stats",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    activityDate: date("activity_date", { mode: "string" }).notNull(),
    walkCount: integer("walk_count").notNull().default(0),
    totalSteps: integer("total_steps").notNull().default(0),
    totalDistanceKm: numeric("total_distance_km", {
      precision: 12,
      scale: 3,
      mode: "number",
    })
      .notNull()
      .default(0),
    totalPoints: bigint("total_points", { mode: "number" }).notNull().default(0),
    activeMinutes: integer("active_minutes").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({
      name: "user_daily_stats_pk",
      columns: [table.userId, table.activityDate],
    }),
    activityDateIdx: index("idx_user_daily_stats_date").on(table.activityDate),
  })
);

export const userLeaderboardStats = pgTable(
  "user_leaderboard_stats",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    periodType: leaderboardPeriodEnum("period_type").notNull(),
    periodStartDate: date("period_start_date", { mode: "string" }).notNull(),
    totalSteps: bigint("total_steps", { mode: "number" }).notNull().default(0),
    totalDistanceKm: numeric("total_distance_km", {
      precision: 14,
      scale: 3,
      mode: "number",
    })
      .notNull()
      .default(0),
    totalPoints: bigint("total_points", { mode: "number" }).notNull().default(0),
    walkCount: integer("walk_count").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({
      name: "user_leaderboard_stats_pk",
      columns: [table.userId, table.periodType, table.periodStartDate],
    }),
    periodStepsIdx: index("idx_leaderboard_period_steps").on(
      table.periodType,
      table.periodStartDate,
      table.totalSteps,
      table.userId
    ),
    periodPointsIdx: index("idx_leaderboard_period_points").on(
      table.periodType,
      table.periodStartDate,
      table.totalPoints,
      table.userId
    ),
  })
);

export const withdrawalRequests = pgTable(
  "withdrawal_requests",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    walletConnectionId: bigint("wallet_connection_id", { mode: "number" })
      .notNull()
      .references(() => walletConnections.id),

    pointsAmount: bigint("points_amount", { mode: "number" }).notNull(),
    pointsPerCelo: numeric("points_per_celo", {
      precision: 20,
      scale: 8,
      mode: "number",
    }).notNull(),
    celoAmount: numeric("celo_amount", {
      precision: 20,
      scale: 8,
      mode: "number",
    }).notNull(),

    destinationAddress: varchar("destination_address", { length: 128 }).notNull(),
    status: withdrawalStatusEnum("status").notNull().default("pending"),
    blockchainTxHash: varchar("blockchain_tx_hash", { length: 128 }),
    failureReason: text("failure_reason"),

    requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userStatusRequestedIdx: index("idx_withdrawal_requests_user_status").on(
      table.userId,
      table.status,
      table.requestedAt
    ),
  })
);

export const pointsLedger = pgTable(
  "points_ledger",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    direction: transactionDirectionEnum("direction").notNull(),
    transactionType: pointsTransactionTypeEnum("transaction_type").notNull(),
    amountPoints: bigint("amount_points", { mode: "number" }).notNull(),
    balanceAfter: bigint("balance_after", { mode: "number" }),
    relatedWalkId: bigint("related_walk_id", { mode: "number" }).references(() => walkSessions.id),
    relatedWithdrawalId: bigint("related_withdrawal_id", {
      mode: "number",
    }).references(() => withdrawalRequests.id),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userCreatedIdx: index("idx_points_ledger_user_created").on(table.userId, table.createdAt),
  })
);

export const celoLedger = pgTable(
  "celo_ledger",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    direction: transactionDirectionEnum("direction").notNull(),
    transactionType: celoTransactionTypeEnum("transaction_type").notNull(),
    amountCelo: numeric("amount_celo", {
      precision: 20,
      scale: 8,
      mode: "number",
    }).notNull(),
    balanceAfter: numeric("balance_after", {
      precision: 20,
      scale: 8,
      mode: "number",
    }),
    txHash: varchar("tx_hash", { length: 128 }),
    relatedUserShoeId: bigint("related_user_shoe_id", { mode: "number" }).references(
      () => userShoes.id
    ),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userCreatedIdx: index("idx_celo_ledger_user_created").on(table.userId, table.createdAt),
  })
);

export const badges = pgTable("badges", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  displayName: varchar("display_name", { length: 80 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userBadges = pgTable(
  "user_badges",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    badgeId: bigint("badge_id", { mode: "number" })
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({
      name: "user_badges_pk",
      columns: [table.userId, table.badgeId],
    }),
  })
);