import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:5173,http://localhost:4173")
    .transform((value, ctx) => {
      const origins = value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
        .map((origin) => {
          if (origin === "*") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "CORS_ORIGIN must not use wildcard (*)",
            });
            return z.NEVER;
          }

          try {
            return new URL(origin).origin;
          } catch {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Invalid CORS origin: ${origin}`,
            });
            return z.NEVER;
          }
        });

      if (origins.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CORS_ORIGIN must include at least one origin",
        });
      }

      return origins;
    }),
  DB_HOST: z.string().min(1, "DB_HOST is required"),
  DB_PORT: z.coerce.number().int().positive(),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_NAME: z.string().min(1, "DB_NAME is required"),
  JWT_SECRET: z.string().min(12, "JWT_SECRET must be at least 12 characters"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = {
  port: parsedEnv.data.PORT,
  corsOrigins: parsedEnv.data.CORS_ORIGIN,
  db: {
    host: parsedEnv.data.DB_HOST,
    port: parsedEnv.data.DB_PORT,
    user: parsedEnv.data.DB_USER,
    password: parsedEnv.data.DB_PASSWORD,
    name: parsedEnv.data.DB_NAME,
  },
  jwtSecret: parsedEnv.data.JWT_SECRET,
};
