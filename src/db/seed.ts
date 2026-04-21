import { and, eq, isNull } from "drizzle-orm";

import { closeDb, db } from "./index";
import {
  pointConversionRates,
  rewardConfigs,
  shoeCatalog,
} from "./schema";

async function seedShoeCatalog() {
  await db.insert(shoeCatalog).values([
    {
      code: "street_basic",
      displayName: "Street Basic",
      pointsMultiplier: 1.0,
      priceCelo: 0,
      isFree: true,
      sortOrder: 1,
    },
    {
      code: "city_trainer",
      displayName: "City Trainer",
      pointsMultiplier: 1.5,
      priceCelo: 1.0,
      isFree: false,
      sortOrder: 2,
    },
    {
      code: "volt_runner",
      displayName: "Volt Runner",
      pointsMultiplier: 2.0,
      priceCelo: 2.5,
      isFree: false,
      sortOrder: 3,
    },
  ]).onConflictDoNothing();
}

async function seedRewardConfig() {
  const existingActiveConfig = await db
    .select({ id: rewardConfigs.id })
    .from(rewardConfigs)
    .where(isNull(rewardConfigs.effectiveTo))
    .limit(1);

  if (existingActiveConfig.length > 0) return;

  await db.insert(rewardConfigs).values({
    pointsPerStep: 1,
    defaultBoostMultiplier: 1.5,
    effectiveFrom: new Date(),
  });
}

async function seedPointConversionRate() {
  const existingActiveRate = await db
    .select({ id: pointConversionRates.id })
    .from(pointConversionRates)
    .where(
      and(
        eq(pointConversionRates.assetSymbol, "CELO"),
        isNull(pointConversionRates.effectiveTo)
      )
    )
    .limit(1);

  if (existingActiveRate.length > 0) return;

  await db.insert(pointConversionRates).values({
    assetSymbol: "CELO",
    pointsPerAsset: 100,
    effectiveFrom: new Date(),
  });
}

async function seed() {
  await seedShoeCatalog();
  await seedRewardConfig();
  await seedPointConversionRate();

  console.log("Seed completed");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
}).finally(async () => {
  await closeDb();
});
