import { z } from "zod";

export const createUserSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email().optional(),
  displayName: z.string().min(1).max(80),
  initials: z.string().min(1).max(8),
  avatarUrl: z.string().url().optional().nullable(),
});

export const getUserParamsSchema = z.object({
  userId: z.string().uuid(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type GetUserParams = z.infer<typeof getUserParamsSchema>;