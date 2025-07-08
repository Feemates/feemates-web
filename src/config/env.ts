import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().url(),
});

const processEnv = {
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
};

const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.warn('env missing');
}

export const env = parsed.data;
