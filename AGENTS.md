# Walk-to-Earn Backend Agent Guide

This folder is the backend API for the Walk-to-Earn Celo MVP. Treat it as the authoritative system for users, walking sessions, valid reward settlement, shoes, boosts, wallet state, CELO ledgers, and leaderboard data.

The frontend may estimate live progress for a good user experience, but the backend must decide what is persisted, what is rewarded, what is paid, and what is shown as verified.

## Product Definition

Walk-to-Earn is a movement-first rewards app:

"A walk-to-earn app where users earn rewards only through valid walking or jogging activity, improve earnings by buying better shoes through CELO and MiniPay, and activate temporary walking boosts by watching ads."

The backend must protect this product loop:

1. User logs in or registers.
2. User starts a walking session.
3. App records steps and speed data.
4. Backend validates movement rules.
5. Backend settles rewards only for valid walking or jogging.
6. Backend applies equipped shoe multiplier.
7. Backend applies active ad-based boost modifier.
8. Backend verifies MiniPay/CELO shoe purchases and upgrades.
9. Backend records balances, ledgers, streaks, ranks, and transaction history.

## Non-Negotiable Product Rules

- No passive earning, mining, idle reward generation, offline reward generation, staking, or background income.
- Rewards can be created only from valid active walking sessions.
- Vehicle-speed movement, unrealistic motion, standing still, and movement above the speed cap must not create rewards.
- Client-submitted reward totals are never authoritative.
- CELO through MiniPay is used only for shoe purchases and shoe upgrades.
- Temporary boosts are activated through ads, not CELO.
- Boosts apply only during active valid movement.
- Shoes affect valid movement earnings only. They do not generate rewards by themselves.
- Every balance-changing action must be ledgered.
- Payment success must be verified server-side before granting or upgrading shoes.

## Current Stack

- Node.js, TypeScript strict mode.
- Express 5 for HTTP.
- Drizzle ORM with Postgres.
- Zod for input and environment validation.
- `dotenv` for local environment loading.
- `helmet` and `cors` are available and should be wired in the app.

The existing module pattern is:

- `src/modules/<domain>/<domain>.route.ts`
- `src/modules/<domain>/<domain>.controller.ts`
- `src/modules/<domain>/<domain>.service.ts`
- `src/modules/<domain>/<domain>.validation.ts`
- `src/modules/<domain>/<domain>.types.ts`

Keep using that pattern.

## Expected API Domains

Build toward these backend domains:

- `auth`: session verification or integration with the chosen auth provider.
- `users`: profile, balances, streaks, current shoe, totals.
- `walk-sessions`: start, update, validate, pause, complete, and settle sessions.
- `rewards`: reward configs, reward calculation, points ledger entries.
- `shoes`: catalog, owned shoes, equip, purchase, upgrade.
- `boosts`: available boosts, ad-proof activation, expiration, active boost lookup.
- `wallet`: MiniPay connection, wallet state, CELO balance snapshots.
- `payments`: CELO purchase quotes, transaction verification, idempotent purchase completion.
- `leaderboard`: weekly, monthly, all-time rankings.
- `daily-stats`: daily goals, streaks, milestones, and aggregate user progress.
- `health`: liveness and readiness checks.

## Architecture Rules

- Keep `src/app.ts` responsible for Express app setup only: JSON parsing, CORS, Helmet, routes, not-found handler, and error handler.
- Keep `src/server.ts` responsible for reading env, starting the HTTP server, and graceful shutdown.
- Controllers handle HTTP I/O only.
- Services own business logic and transactions.
- Database access should stay in services or dedicated repository/query helpers when a module grows.
- Validation schemas live beside the route module and must be applied before controllers.
- Shared errors belong in `src/lib`.
- Shared schemas and enums belong in `src/db/schema`.
- Do not put business logic in route files, seed files, or migrations.
- Do not let frontend route names dictate backend module boundaries; model the product domain.

## Environment And Configuration

- Validate all required env vars with Zod in `src/config/env.ts`.
- Keep `.env` out of git and maintain `.env.example` when adding configuration.
- Expected production env categories include:
  - `DATABASE_URL`
  - `PORT`
  - allowed CORS origins
  - auth/JWT or auth provider settings
  - CELO network/RPC settings
  - MiniPay/payment recipient settings
  - ad verification secrets or provider keys
  - logging level
- Never hardcode private keys, RPC secrets, ad secrets, or production wallet addresses in source files.
- Fail fast on missing production configuration.

## Database And Migrations

- Use Drizzle schemas as the source of truth for database structure.
- Keep foreign keys, indexes, unique constraints, and enum values explicit.
- Add indexes for leaderboard, transaction history, session lookup, active boosts, and wallet lookups when adding queries.
- Generate migrations with `npm run db:generate` after schema changes.
- Review generated SQL before applying it.
- Do not run migrations against shared, staging, or production databases without explicit human approval.
- Do not use `db:push` for production or shared databases.
- Seed files are for deterministic local/demo data only. Do not seed fake production balances or unverifiable transactions.

## Reward Settlement Rules

- Store rewards in integer point units. Avoid floating-point arithmetic for persisted balances.
- Treat CELO values as fixed decimal values and be careful with precision.
- Keep reward configuration versioned or time-effective so historical sessions can be explained.
- The settlement formula should stay clear: `Final Reward = Base Reward x Shoe Multiplier x Active Boost Modifier`.
- `Base Reward` must come only from valid steps.
- Store the multiplier values used on each settled walk session.
- Use database transactions when settling a walk session so session status, points ledger, balance, daily stats, streaks, and leaderboard updates stay consistent.
- Make session completion idempotent. Retrying a completion request must not double-award points.
- Record invalid or paused movement separately enough for audit/debugging when practical.

## Movement Validation Rules

- Define a maximum allowed speed threshold in one backend constant/config location.
- Reward earning must pause above the threshold and resume only when movement returns to valid range.
- Validate that submitted step deltas, speed samples, timestamps, and distance are plausible.
- Reject or ignore impossible jumps, negative deltas, duplicated samples, stale sessions, and updates outside an active session.
- Do not trust client device time blindly when calculating final rewards.
- Keep MVP validation simple but real: step count, GPS speed, active session state, and reward pause on invalid speed.
- Design the schema so later anti-abuse systems can be added without rewriting reward history.

## Shoes And Progression

- Shoe catalog data should come from the database.
- A free starter shoe can be granted on account creation or onboarding completion.
- Only one user shoe may be equipped at a time.
- Buying or upgrading a shoe requires verified CELO payment.
- Record acquisition type, CELO amount, transaction hash, and related ledger entry.
- Do not allow users to equip shoes they do not own.
- Do not allow duplicate ownership unless the product explicitly adds durability or multiple copies.

## MiniPay And CELO Payment Rules

- The server must quote the purchase or upgrade amount from current catalog data.
- The server must verify transaction hash, chain/network, recipient address, token/asset, amount, and user intent before granting the shoe.
- Payment completion endpoints must be idempotent. A repeated transaction hash must not grant duplicate benefits.
- Store pending, verified, failed, refunded, and cancelled states as needed.
- Do not rely on a frontend "success" redirect as proof of payment.
- Log enough metadata for support and judging demos without storing secrets.

## Boost And Ad Rules

- Boosts are activated only through verified ad completion or a clearly marked development/demo override.
- Boost source should remain `ad_reward` for normal MVP boosts.
- Store start time, expiry time, multiplier, status, and consumption/session links.
- Expired boosts should not apply to new reward settlement.
- Active boosts should stop increasing rewards when movement is invalid.
- Boost purchase with CELO is out of scope for this MVP.

## API Contract Rules

- Prefix routes under `/api`.
- Return consistent JSON shapes with `data`, `message`, and `errors` where appropriate.
- Use Zod for body, params, and query validation.
- Use pagination for lists such as transactions, leaderboards, and session history.
- Never expose stack traces or raw database errors in production responses.
- Use appropriate HTTP statuses: `400` validation, `401` unauthenticated, `403` unauthorized, `404` missing, `409` conflict/idempotency mismatch, `422` invalid business state, `500` unexpected.
- Add request body size limits before accepting sensor/session update payloads.

## Security And Reliability

- Wire `helmet`, CORS origin restrictions, JSON body limits, not-found handling, and error handling in `src/app.ts`.
- Add rate limiting before public auth, payment, and session update endpoints go live.
- If this backend owns passwords, hash with a production password hashing library and never store plaintext.
- If auth is external, verify tokens server-side and derive `userId` from auth context, not request body.
- Protect all user-owned resources with authenticated user scope.
- Use database transactions for balance, ledger, purchase, and reward settlement changes.
- Add graceful shutdown for the Postgres client and HTTP server.
- Add structured logging before production deployment.

## Testing And Verification

- At minimum, run `npm run build` before finishing backend changes.
- Add a test runner when behavior grows beyond the current boilerplate. Prefer Vitest plus Supertest for routes and service tests.
- Cover these high-risk cases:
  - invalid speed produces no rewards
  - completing a session twice does not double-award
  - shoe multiplier applies only to valid steps
  - boost applies only while active and valid
  - expired boost does not apply
  - unverified MiniPay transaction does not grant a shoe
  - duplicate transaction hash is idempotent
  - user cannot equip another user's shoe
  - ledger and balance stay consistent after settlement
- For schema changes, run generation and review migration SQL.
- For seed changes, confirm repeated seeding is safe and does not duplicate catalog/config records.

## Production Readiness Checklist

Before calling a backend feature complete, confirm:

- Inputs are validated with Zod.
- Auth/user ownership is enforced.
- Business rules match the Walk-to-Earn MVP.
- Database changes are transactional where balances or ledgers change.
- Errors are user-safe and logs are useful.
- API response types are documented through TypeScript types.
- Migrations and seed behavior are understood.
- Build passes with `npm run build`.
- Frontend integration needs are clear: endpoint path, payload, response, error states, and loading states.

