import { z } from 'zod';

import AzulRequester from '../request';
import { makeIdempotent } from '../utils/make-idempotent';
import { threeDSChallengeResponseSchema } from './schemas';
import { errorSaleResponseSchema, successfulSaleResponseSchema } from '../sale/schemas';

const processThreeDSMethodResponseSchema = z.union([
  threeDSChallengeResponseSchema,
  successfulSaleResponseSchema,
  errorSaleResponseSchema
]);

export type ProcessThreeDSMethodResponse = z.infer<typeof processThreeDSMethodResponseSchema>;

async function processThreeDSMethodInternal({
  azulOrderId,
  requester
}: {
  azulOrderId: string;
  requester: AzulRequester;
}): Promise<ProcessThreeDSMethodResponse> {
  const response = await requester.request({
    body: {
      AzulOrderId: azulOrderId,
      MethodNotificationStatus: 'RECEIVED'
    },
    url: requester.url + '?ProcessThreedsMethod'
  });

  return processThreeDSMethodResponseSchema.parse(response);
}

export const processThreeDSMethod = makeIdempotent(processThreeDSMethodInternal);
