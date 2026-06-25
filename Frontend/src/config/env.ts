import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url().default('https://api.localshop.enterprise'),
  VITE_USE_MOCK_API: z.string().transform((val) => val === 'true').default('true'),
  VITE_APP_NAME: z.string().default('Local Shop Marketplace'),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

const getEnv = () => {
  try {
    return envSchema.parse({
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API,
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
    });
  } catch (error) {
    console.warn('Invalid environment configurations, falling back to defaults:', error);
    return envSchema.parse({});
  }
};

export const env = getEnv();
export type EnvConfig = z.infer<typeof envSchema>;
