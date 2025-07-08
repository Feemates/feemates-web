import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_BASE_API_URL: z.string().url(),
  NEXT_PUBLIC_ENGAGESPOT_KEY: z.string(),
});

const processEnv = {
  NEXT_PUBLIC_BASE_API_URL: process.env.NEXT_PUBLIC_BASE_API_URL,
  NEXT_PUBLIC_ENGAGESPOT_KEY: process.env.NEXT_PUBLIC_ENGAGESPOT_KEY,
};

const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.warn('env missing');
}

export const env = parsed.data;
