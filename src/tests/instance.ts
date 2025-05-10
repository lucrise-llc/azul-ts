import { z } from 'zod';
import { config } from 'dotenv';

import { Azul } from '../api';

config();

const envSchema = z.object({
  AUTH1: z.string(),
  AUTH2: z.string(),
  AUTH1_3DS: z.string(),
  AUTH2_3DS: z.string(),
  MERCHANT_ID: z.string(),
  AZUL_CERT: z.string(),
  AZUL_KEY: z.string()
});

export const env = envSchema.parse(process.env);

export const azul = new Azul({
  auth1: env.AUTH1,
  auth2: env.AUTH2,
  merchantId: env.MERCHANT_ID,
  certificate: env.AZUL_CERT,
  key: env.AZUL_KEY,
  environment: 'development'
});
