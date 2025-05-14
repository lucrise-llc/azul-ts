import z from 'zod';

import {
  CVC,
  ITBIS,
  amount,
  cardNumber,
  customOrderId,
  expiration,
  posInputMode,
  saveToDataVault,
  forceNo3DS
} from '../schemas';

// Sale Request
export const cardPaymentSchema = z.object({
  type: z.literal('card'),
  customOrderId,
  amount,
  ITBIS,
  cardNumber,
  expiration,
  CVC,
  posInputMode,
  saveToDataVault,
  forceNo3DS
});

export const tokenPaymentSchema = z.object({
  type: z.literal('token'),
  customOrderId,
  amount,
  ITBIS,
  dataVaultToken: z.string().max(36),
  posInputMode,
  expiration: z.literal('').default(''),
  forceNo3DS
});

export const saleRequestSchema = z.union([cardPaymentSchema, tokenPaymentSchema]);
export type SaleRequest = z.input<typeof saleRequestSchema>;

// Sale Response
export const successfulSaleResponseSchema = z
  .object({
    IsoCode: z.literal('00'),
    AzulOrderId: z.string().nonempty(),
    ResponseMessage: z.literal('APROBADA'),
    AuthorizationCode: z.string().nonempty(),
    CustomOrderId: z.string(),
    DateTime: z.string().nonempty(),
    ErrorDescription: z.literal(''),
    LotNumber: z.string(),
    // RRN is always present except for post (empty string)
    RRN: z.string(),
    ResponseCode: z.literal('ISO8583'),
    Ticket: z.string()
  })
  .transform((response) => ({
    ...response,
    type: 'success' as const
  }));

export type SuccessfulSaleResponse = z.infer<typeof successfulSaleResponseSchema>;

export const errorSaleResponseSchema = z
  .object({
    IsoCode: z.string(),
    AzulOrderId: z.string().optional(),
    ResponseMessage: z.string(),
    AuthorizationCode: z.string(),
    CustomOrderId: z.string(),
    DateTime: z.string(),
    ErrorDescription: z.string(),
    LotNumber: z.string(),
    RRN: z.string(),
    ResponseCode: z.string(),
    Ticket: z.string()
  })
  .transform((response) => ({
    ...response,
    type: 'error' as const
  }));

export type ErrorSaleResponse = z.infer<typeof errorSaleResponseSchema>;

export const saleResponseSchema = z.union([successfulSaleResponseSchema, errorSaleResponseSchema]);
export type SaleResponse = z.infer<typeof saleResponseSchema>;
