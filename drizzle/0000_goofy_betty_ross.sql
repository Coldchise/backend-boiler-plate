CREATE TYPE "public"."boost_source" AS ENUM('ad_reward', 'promo', 'manual');--> statement-breakpoint
CREATE TYPE "public"."boost_status" AS ENUM('active', 'consumed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."celo_transaction_type" AS ENUM('wallet_sync', 'shoe_purchase', 'withdrawal_payout', 'deposit', 'refund', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."leaderboard_metric" AS ENUM('steps', 'points');--> statement-breakpoint
CREATE TYPE "public"."leaderboard_period" AS ENUM('weekly', 'monthly', 'all_time');--> statement-breakpoint
CREATE TYPE "public"."points_transaction_type" AS ENUM('walk_reward', 'withdrawal', 'bonus', 'refund', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."shoe_acquisition_type" AS ENUM('starter', 'purchase', 'reward', 'admin_grant');--> statement-breakpoint
CREATE TYPE "public"."transaction_direction" AS ENUM('in', 'out');--> statement-breakpoint
CREATE TYPE "public"."walk_session_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."wallet_provider" AS ENUM('minipay');--> statement-breakpoint
CREATE TYPE "public"."wallet_status" AS ENUM('connected', 'disconnected');--> statement-breakpoint
CREATE TYPE "public"."withdrawal_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"email" text,
	"display_name" varchar(80) NOT NULL,
	"initials" varchar(8) NOT NULL,
	"avatar_url" text,
	"rank_title" varchar(40),
	"current_rank_number" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_balances" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"points_balance" bigint DEFAULT 0 NOT NULL,
	"celo_balance" numeric(20, 8) DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_streaks" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"current_streak_days" integer DEFAULT 0 NOT NULL,
	"longest_streak_days" integer DEFAULT 0 NOT NULL,
	"last_active_date" date,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(40) NOT NULL,
	"display_name" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "badges_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "boost_activations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"source" "boost_source" DEFAULT 'ad_reward' NOT NULL,
	"multiplier" numeric(8, 4) NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"status" "boost_status" DEFAULT 'active' NOT NULL,
	"consumed_by_walk_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "celo_ledger" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"direction" "transaction_direction" NOT NULL,
	"transaction_type" "celo_transaction_type" NOT NULL,
	"amount_celo" numeric(20, 8) NOT NULL,
	"balance_after" numeric(20, 8),
	"tx_hash" varchar(128),
	"related_user_shoe_id" bigint,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "point_conversion_rates" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"asset_symbol" varchar(16) DEFAULT 'CELO' NOT NULL,
	"points_per_asset" numeric(20, 8) NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "points_ledger" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"direction" "transaction_direction" NOT NULL,
	"transaction_type" "points_transaction_type" NOT NULL,
	"amount_points" bigint NOT NULL,
	"balance_after" bigint,
	"related_walk_id" bigint,
	"related_withdrawal_id" bigint,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reward_configs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"points_per_step" numeric(12, 6) DEFAULT 1 NOT NULL,
	"default_boost_multiplier" numeric(8, 4) DEFAULT 1.5 NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shoe_catalog" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(40) NOT NULL,
	"display_name" varchar(80) NOT NULL,
	"points_multiplier" numeric(8, 4) NOT NULL,
	"price_celo" numeric(20, 8) DEFAULT 0 NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shoe_catalog_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"user_id" uuid NOT NULL,
	"badge_id" bigint NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_badges_pk" PRIMARY KEY("user_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "user_daily_stats" (
	"user_id" uuid NOT NULL,
	"activity_date" date NOT NULL,
	"walk_count" integer DEFAULT 0 NOT NULL,
	"total_steps" integer DEFAULT 0 NOT NULL,
	"total_distance_km" numeric(12, 3) DEFAULT 0 NOT NULL,
	"total_points" bigint DEFAULT 0 NOT NULL,
	"active_minutes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_daily_stats_pk" PRIMARY KEY("user_id","activity_date")
);
--> statement-breakpoint
CREATE TABLE "user_leaderboard_stats" (
	"user_id" uuid NOT NULL,
	"period_type" "leaderboard_period" NOT NULL,
	"period_start_date" date NOT NULL,
	"total_steps" bigint DEFAULT 0 NOT NULL,
	"total_distance_km" numeric(14, 3) DEFAULT 0 NOT NULL,
	"total_points" bigint DEFAULT 0 NOT NULL,
	"walk_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_leaderboard_stats_pk" PRIMARY KEY("user_id","period_type","period_start_date")
);
--> statement-breakpoint
CREATE TABLE "user_shoes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"shoe_id" bigserial NOT NULL,
	"acquisition_type" "shoe_acquisition_type" NOT NULL,
	"acquired_at" timestamp with time zone DEFAULT now() NOT NULL,
	"purchase_celo_amount" numeric(20, 8),
	"purchase_tx_hash" varchar(128),
	"is_equipped" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "walk_sessions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"steps" integer DEFAULT 0 NOT NULL,
	"distance_km" numeric(10, 3) DEFAULT 0 NOT NULL,
	"avg_speed_kmh" numeric(10, 3) DEFAULT 0 NOT NULL,
	"equipped_user_shoe_id" bigint,
	"shoe_multiplier" numeric(8, 4) DEFAULT 1 NOT NULL,
	"boost_activation_id" bigint,
	"boost_multiplier" numeric(8, 4) DEFAULT 1 NOT NULL,
	"points_per_step" numeric(12, 6) DEFAULT 1 NOT NULL,
	"base_points" bigint DEFAULT 0 NOT NULL,
	"total_points" bigint DEFAULT 0 NOT NULL,
	"status" "walk_session_status" DEFAULT 'completed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_connections" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "wallet_provider" DEFAULT 'minipay' NOT NULL,
	"wallet_address" varchar(128) NOT NULL,
	"status" "wallet_status" DEFAULT 'connected' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"last_synced_celo_balance" numeric(20, 8) DEFAULT 0 NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"disconnected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "withdrawal_requests" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_connection_id" bigint NOT NULL,
	"points_amount" bigint NOT NULL,
	"points_per_celo" numeric(20, 8) NOT NULL,
	"celo_amount" numeric(20, 8) NOT NULL,
	"destination_address" varchar(128) NOT NULL,
	"status" "withdrawal_status" DEFAULT 'pending' NOT NULL,
	"blockchain_tx_hash" varchar(128),
	"failure_reason" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_balances" ADD CONSTRAINT "user_balances_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boost_activations" ADD CONSTRAINT "boost_activations_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "celo_ledger" ADD CONSTRAINT "celo_ledger_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "celo_ledger" ADD CONSTRAINT "celo_ledger_related_user_shoe_id_user_shoes_id_fk" FOREIGN KEY ("related_user_shoe_id") REFERENCES "public"."user_shoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_ledger" ADD CONSTRAINT "points_ledger_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_ledger" ADD CONSTRAINT "points_ledger_related_walk_id_walk_sessions_id_fk" FOREIGN KEY ("related_walk_id") REFERENCES "public"."walk_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_ledger" ADD CONSTRAINT "points_ledger_related_withdrawal_id_withdrawal_requests_id_fk" FOREIGN KEY ("related_withdrawal_id") REFERENCES "public"."withdrawal_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_stats" ADD CONSTRAINT "user_daily_stats_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_leaderboard_stats" ADD CONSTRAINT "user_leaderboard_stats_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_shoes" ADD CONSTRAINT "user_shoes_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_shoes" ADD CONSTRAINT "user_shoes_shoe_id_shoe_catalog_id_fk" FOREIGN KEY ("shoe_id") REFERENCES "public"."shoe_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walk_sessions" ADD CONSTRAINT "walk_sessions_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walk_sessions" ADD CONSTRAINT "walk_sessions_equipped_user_shoe_id_user_shoes_id_fk" FOREIGN KEY ("equipped_user_shoe_id") REFERENCES "public"."user_shoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walk_sessions" ADD CONSTRAINT "walk_sessions_boost_activation_id_boost_activations_id_fk" FOREIGN KEY ("boost_activation_id") REFERENCES "public"."boost_activations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_connections" ADD CONSTRAINT "wallet_connections_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_wallet_connection_id_wallet_connections_id_fk" FOREIGN KEY ("wallet_connection_id") REFERENCES "public"."wallet_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_profiles_display_name" ON "profiles" USING btree ("display_name");--> statement-breakpoint
CREATE INDEX "idx_boost_user_status_expiry" ON "boost_activations" USING btree ("user_id","status","expires_at");--> statement-breakpoint
CREATE INDEX "idx_celo_ledger_user_created" ON "celo_ledger" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_conversion_rates_effective" ON "point_conversion_rates" USING btree ("asset_symbol","effective_from");--> statement-breakpoint
CREATE INDEX "idx_points_ledger_user_created" ON "points_ledger" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_reward_configs_effective" ON "reward_configs" USING btree ("effective_from");--> statement-breakpoint
CREATE INDEX "idx_user_daily_stats_date" ON "user_daily_stats" USING btree ("activity_date");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_period_steps" ON "user_leaderboard_stats" USING btree ("period_type","period_start_date","total_steps","user_id");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_period_points" ON "user_leaderboard_stats" USING btree ("period_type","period_start_date","total_points","user_id");--> statement-breakpoint
CREATE INDEX "idx_user_shoes_user_acquired" ON "user_shoes" USING btree ("user_id","acquired_at");--> statement-breakpoint
CREATE INDEX "idx_user_shoes_user_shoe" ON "user_shoes" USING btree ("user_id","shoe_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_owned_shoe" ON "user_shoes" USING btree ("user_id","shoe_id");--> statement-breakpoint
CREATE INDEX "idx_walk_sessions_user_started" ON "walk_sessions" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "idx_walk_sessions_user_ended" ON "walk_sessions" USING btree ("user_id","ended_at");--> statement-breakpoint
CREATE INDEX "idx_walk_sessions_leaderboard_time" ON "walk_sessions" USING btree ("ended_at","user_id");--> statement-breakpoint
CREATE INDEX "idx_wallet_connections_user_created" ON "wallet_connections" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_requests_user_status" ON "withdrawal_requests" USING btree ("user_id","status","requested_at");