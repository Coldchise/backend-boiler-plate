import { and, eq } from "drizzle-orm";

import { db } from "../../db";
import {
  profiles,
  userBalances,
  userLeaderboardStats,
  userStreaks,
} from "../../db/schema";
import type { CreateUserInput } from "./users.validation";
import type { UserProfileResponse } from "./users.types";

const ALL_TIME_DATE = "1970-01-01";

export async function createUserService(
  payload: CreateUserInput
): Promise<UserProfileResponse | null> {
  await db.transaction(async (tx) => {
    await tx.insert(profiles).values({
      userId: payload.userId,
      email: payload.email ?? null,
      displayName: payload.displayName,
      initials: payload.initials,
      avatarUrl: payload.avatarUrl ?? null,
    });

    await tx.insert(userBalances).values({
      userId: payload.userId,
      pointsBalance: 0,
      celoBalance: 0,
    });

    await tx.insert(userStreaks).values({
      userId: payload.userId,
      currentStreakDays: 0,
      longestStreakDays: 0,
      lastActiveDate: null,
    });
  });

  return getUserProfileService(payload.userId);
}

export async function getUserProfileService(
  userId: string
): Promise<UserProfileResponse | null> {
  const rows = await db
    .select({
      userId: profiles.userId,
      email: profiles.email,
      displayName: profiles.displayName,
      initials: profiles.initials,
      avatarUrl: profiles.avatarUrl,
      rankTitle: profiles.rankTitle,
      currentRankNumber: profiles.currentRankNumber,
      pointsBalance: userBalances.pointsBalance,
      celoBalance: userBalances.celoBalance,
      currentStreakDays: userStreaks.currentStreakDays,
      longestStreakDays: userStreaks.longestStreakDays,
      totalSteps: userLeaderboardStats.totalSteps,
      totalPoints: userLeaderboardStats.totalPoints,
    })
    .from(profiles)
    .leftJoin(userBalances, eq(userBalances.userId, profiles.userId))
    .leftJoin(userStreaks, eq(userStreaks.userId, profiles.userId))
    .leftJoin(
      userLeaderboardStats,
      and(
        eq(userLeaderboardStats.userId, profiles.userId),
        eq(userLeaderboardStats.periodType, "all_time"),
        eq(userLeaderboardStats.periodStartDate, ALL_TIME_DATE)
      )
    )
    .where(eq(profiles.userId, userId))
    .limit(1);

  if (!rows.length) return null;

  const row = rows[0];

  return {
    userId: row.userId,
    email: row.email ?? null,
    displayName: row.displayName,
    initials: row.initials,
    avatarUrl: row.avatarUrl ?? null,
    rankTitle: row.rankTitle ?? null,
    currentRankNumber: row.currentRankNumber ?? null,
    pointsBalance: row.pointsBalance ?? 0,
    celoBalance: row.celoBalance ?? 0,
    currentStreakDays: row.currentStreakDays ?? 0,
    longestStreakDays: row.longestStreakDays ?? 0,
    totalSteps: row.totalSteps ?? 0,
    totalPoints: row.totalPoints ?? 0,
  };
}