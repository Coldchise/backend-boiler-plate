export type UserProfileResponse = {
  userId: string;
  email: string | null;
  displayName: string;
  initials: string;
  avatarUrl: string | null;
  rankTitle: string | null;
  currentRankNumber: number | null;
  pointsBalance: number;
  celoBalance: number;
  currentStreakDays: number;
  longestStreakDays: number;
  totalSteps: number;
  totalPoints: number;
};