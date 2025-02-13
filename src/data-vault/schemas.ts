import { z } from 'zod';

import { CVC, cardNumber, expiration } from '../schemas';

export const createDataVaultSchema = z.object({
  cardNumber,
  expiration,
  CVC,
  trxType: z.literal('CREATE').default('CREATE'),
  saveToDataVault: z.literal('1').default('1')
});

export const createDataVaultResponseSchema = z.object({
  DataVaultToken: z.string().nonempty(),
  CardNumber: z.string(),
  Expiration: z.string(),
  Brand: z.string(),
  ErrorDescription: z.literal(''),
  HasCVV: z.boolean(),
  IsoCode: z.literal('00'),
  ResponseMessage: z.literal('APROBADA')
});

export const deleteDataVaultSchema = z.object({
  dataVaultToken: z.string().max(36),
  trxType: z.literal('DELETE').default('DELETE')
});

export const deleteDataVaultResponseSchema = z.object({
  ErrorDescription: z.literal(''),
  HasCVV: z.boolean(),
  IsoCode: z.literal('00'),
  ResponseMessage: z.literal('APROBADA')
});

export type CreateDataVault = z.input<typeof createDataVaultSchema>;
export type DeleteDataVault = z.input<typeof deleteDataVaultSchema>;
export type CreateDataVaultResponse = z.infer<typeof createDataVaultResponseSchema>;
export type DeleteDataVaultResponse = z.infer<typeof deleteDataVaultResponseSchema>;
