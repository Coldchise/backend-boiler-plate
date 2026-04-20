import {
  bigint,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const profiles = pgTable(
  "profiles",
  {
    userId: uuid("user_id").primaryKey(),
    email: text("email").unique(),
    displayName: varchar("display_name", { length: 80 }).notNull(),
    initials: varchar("initials", { length: 8 }).notNull(),
    avatarUrl: text("avatar_url"),
    rankTitle: varchar("rank_title", { length: 40 }),
    currentRankNumber: integer("current_rank_number"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    displayNameIdx: index("idx_profiles_display_name").on(table.displayName),
  })
);

export const userBalances = pgTable("user_balances", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => profiles.userId, { onDelete: "cascade" }),
  pointsBalance: bigint("points_balance", { mode: "number" }).notNull().default(0),
  celoBalance: numeric("celo_balance", {
    precision: 20,
    scale: 8,
    mode: "number",
  })
    .notNull()
    .default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userStreaks = pgTable("user_streaks", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => profiles.userId, { onDelete: "cascade" }),
  currentStreakDays: integer("current_streak_days").notNull().default(0),
  longestStreakDays: integer("longest_streak_days").notNull().default(0),
  lastActiveDate: date("last_active_date", { mode: "string" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});