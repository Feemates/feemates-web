import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_BASE_API_URL: z.string().url(),
  NEXT_PUBLIC_ENGAGESPOT_KEY: z.string(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string(),
});

const processEnv = {
  NEXT_PUBLIC_BASE_API_URL: process.env.NEXT_PUBLIC_BASE_API_URL,
  NEXT_PUBLIC_ENGAGESPOT_KEY: process.env.NEXT_PUBLIC_ENGAGESPOT_KEY,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
};

const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.warn('env missing');
}

export const env = parsed.data;
