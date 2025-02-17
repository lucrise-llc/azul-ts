import { z } from 'zod';

import AzulRequester from '../request';
import { ChallengeIndicator } from './types';
import { threeDSChallengeResponseSchema, threeDSMethodResponseSchema } from './schemas';
import {
  cardPaymentSchema,
  errorSaleResponseSchema,
  successfulSaleResponseSchema,
  tokenPaymentSchema
} from '../sale/schemas';

// Secure sale request
const threeDSAuthSchema = z.object({
  TermUrl: z.string().url(),
  MethodNotificationUrl: z.string().url(),
  RequestorChallengeIndicator: z.nativeEnum(ChallengeIndicator).optional()
});

export const secureSaleRequestSchema = z.union([
  cardPaymentSchema.extend({
    secureId: z.string().optional(),
    ThreeDSAuth: threeDSAuthSchema.optional()
  }),
  tokenPaymentSchema.extend({
    secureId: z.string().optional(),
    ThreeDSAuth: threeDSAuthSchema.optional()
  })
]);

export type SecureSaleRequest = z.input<typeof secureSaleRequestSchema>;

// Secure sale response
const secureSaleResponseSchema = z.union([
  successfulSaleResponseSchema,
  threeDSChallengeResponseSchema,
  threeDSMethodResponseSchema,
  errorSaleResponseSchema
]);

type SecureSaleResponse = z.infer<typeof secureSaleResponseSchema>;

// Secure sale
export async function secureSale({
  input,
  requester
}: {
  input: SecureSaleRequest;
  requester: AzulRequester;
}): Promise<SecureSaleResponse> {
  const result = await requester.request({
    url: requester.url,
    body: {
      ...secureSaleRequestSchema.parse(input),
      ForceNo3DS: '0',
      TrxType: 'Sale'
    }
  });

  return secureSaleResponseSchema.parse(result);
}
