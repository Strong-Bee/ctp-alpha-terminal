import { z } from "zod";

const schema = z.object({
  API_PORT: z.coerce.number().int().positive().default(4000),
  API_HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().default("postgresql://ctp:ctp@localhost:5432/ctp_alpha"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  NVIDIA_API_KEY: z.string().min(1).optional(),
  NVIDIA_BASE_URL: z.string().url().default("https://integrate.api.nvidia.com/v1"),
  NVIDIA_MODEL: z.string().min(1).default("nvidia/nemotron-3-ultra-550b-a55b"),
  NVIDIA_ENABLE_THINKING: z.coerce.boolean().default(true),
  NVIDIA_TIMEOUT_MS: z.coerce.number().int().positive().default(120000),
});

export const env = schema.parse(process.env);
