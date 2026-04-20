import { db } from "./index";
import {
  pointConversionRates,
  rewardConfigs,
  shoeCatalog,
} from "./schema";

async function seed() {
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

  await db.insert(rewardConfigs).values({
    pointsPerStep: 1,
    defaultBoostMultiplier: 1.5,
    effectiveFrom: new Date(),
  });

  await db.insert(pointConversionRates).values({
    assetSymbol: "CELO",
    pointsPerAsset: 100,
    effectiveFrom: new Date(),
  });

  console.log("Seed completed");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});