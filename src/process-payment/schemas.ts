import z from 'zod';

import {
  CVC,
  ITBIS,
  amount,
  cardNumber,
  customOrderId,
  dataVaultToken,
  expiration,
  posInputMode,
  saveToDataVault
} from '../schemas';

const cardPaymentSchema = z.object({
  type: z.literal('card'),
  customOrderId,
  amount,
  ITBIS,
  cardNumber,
  expiration,
  CVC,
  posInputMode,
  saveToDataVault
});

const tokenPaymentSchema = z.object({
  type: z.literal('token'),
  customOrderId,
  amount,
  ITBIS,
  dataVaultToken,
  posInputMode,
  expiration: z.literal('').default('')
});

export const processPaymentSchema = z.union([cardPaymentSchema, tokenPaymentSchema]);

const successfulPaymentResponseSchema = z
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

const errorPaymentResponseSchema = z
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

export const paymentResponseSchema = z.union([
  successfulPaymentResponseSchema,
  errorPaymentResponseSchema
]);

export const refundRequestSchema = z.union([
  cardPaymentSchema.merge(
    z.object({
      azulOrderId: z.string()
    })
  ),
  tokenPaymentSchema.merge(
    z.object({
      azulOrderId: z.string()
    })
  )
]);

export const refundResponseSchema = z.object({
  IsoCode: z.literal('00'),
  AzulOrderId: z.string().nonempty(),
  ResponseMessage: z.literal('APROBADA'),
  AuthorizationCode: z.literal(''),
  CustomOrderId: z.string(),
  DateTime: z.string().nonempty(),
  ErrorDescription: z.literal(''),
  LotNumber: z.string(),
  RRN: z.string().nonempty(),
  ResponseCode: z.literal('ISO8583'),
  Ticket: z.string()
});

export type ProcessPaymentInput = z.input<typeof processPaymentSchema>;
export type RefundRequestInput = z.input<typeof refundRequestSchema>;
export type RefundResponse = z.infer<typeof refundResponseSchema>;
export type PaymentResponse = z.infer<typeof paymentResponseSchema>;

export const verifySchema = z.object({
  Found: z.boolean(),
  TransactionType: z.string()
});

export type VerifyResponse = z.infer<typeof verifySchema>;
