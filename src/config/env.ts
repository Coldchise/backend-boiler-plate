import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_SSL: z.enum(["auto", "true", "false"]).default("auto"),
  SUPABASE_URL: z
    .string()
    .url("SUPABASE_URL must be a valid Supabase project URL")
    .transform((value) => value.replace(/\/+$/, "")),
  SUPABASE_PUBLIC_KEY: z.string().min(1, "SUPABASE_PUBLIC_KEY is required"),
  SUPABASE_SECRET_KEY: z.string().min(1, "SUPABASE_SECRET_KEY is required"),
  CORS_ORIGINS: z
    .string()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    ),
});

export const env = envSchema.parse({
  ...process.env,
  SUPABASE_PUBLIC_KEY:
    process.env.SUPABASE_PUBLIC_KEY ?? process.env.SUPABASE_ANON_KEY,
  SUPABASE_SECRET_KEY:
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
});
