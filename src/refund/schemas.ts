import z from 'zod';

import { cardPaymentSchema, tokenPaymentSchema } from '../sale/schemas';

const refund = z.object({
  azulOrderId: z.string(),
  trxType: z.literal('Refund').default('Refund')
});

export const refundRequestSchema = z.union([
  cardPaymentSchema.merge(refund).omit({ CVC: true }),
  tokenPaymentSchema.merge(refund)
]);

export type RefundRequestInput = z.input<typeof refundRequestSchema>;

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

export type RefundResponse = z.infer<typeof refundResponseSchema>;
