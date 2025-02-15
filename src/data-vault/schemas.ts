import { z } from 'zod';

import { CVC, cardNumber, expiration } from '../schemas';

// Create DataVault
export const createDataVaultSchema = z.object({
  cardNumber,
  expiration,
  CVC,
  trxType: z.literal('CREATE').default('CREATE'),
  saveToDataVault: z.literal('1').default('1')
});

const successCreateDataVaultResponseSchema = z
  .object({
    DataVaultToken: z.string().nonempty(),
    CardNumber: z.string().nonempty(),
    Expiration: z.string().nonempty(),
    Brand: z.string().nonempty(),
    ErrorDescription: z.literal(''),
    HasCVV: z.boolean(),
    IsoCode: z.literal('00'),
    ResponseMessage: z.literal('APROBADA')
  })
  .transform((data) => ({
    ...data,
    type: 'success' as const
  }));

const errorCreateDataVaultResponseSchema = z
  .object({
    DataVaultToken: z.literal(''),
    CardNumber: z.literal(''),
    Expiration: z.literal(''),
    Brand: z.literal(''),
    ErrorDescription: z.string().nonempty(),
    HasCVV: z.boolean(),
    IsoCode: z.string().nonempty(),
    ResponseMessage: z.string().nonempty()
  })
  .transform((data) => ({
    ...data,
    type: 'error' as const
  }));

export const createDataVaultResponseSchema = z.union([
  successCreateDataVaultResponseSchema,
  errorCreateDataVaultResponseSchema
]);

export type CreateDataVault = z.input<typeof createDataVaultSchema>;
export type CreateDataVaultResponse = z.infer<typeof createDataVaultResponseSchema>;

// Delete DataVault
export const deleteDataVaultSchema = z.object({
  dataVaultToken: z.string().max(36),
  trxType: z.literal('DELETE').default('DELETE')
});

const successDeleteDataVaultResponseSchema = z
  .object({
    ErrorDescription: z.literal(''),
    HasCVV: z.boolean(),
    IsoCode: z.literal('00'),
    ResponseMessage: z.literal('APROBADA')
  })
  .transform((data) => ({
    ...data,
    type: 'success' as const
  }));

const errorDeleteDataVaultResponseSchema = z
  .object({
    ErrorDescription: z.string().nonempty(),
    HasCVV: z.boolean(),
    IsoCode: z.string().nonempty(),
    ResponseMessage: z.string().nonempty()
  })
  .transform((data) => ({
    ...data,
    type: 'error' as const
  }));

export const deleteDataVaultResponseSchema = z.union([
  successDeleteDataVaultResponseSchema,
  errorDeleteDataVaultResponseSchema
]);

export type DeleteDataVault = z.input<typeof deleteDataVaultSchema>;
export type DeleteDataVaultResponse = z.infer<typeof deleteDataVaultResponseSchema>;
