import { z } from 'zod';

import AzulRequester from '../request';
import { makeIdempotent } from '../utils/make-idempotent';
import { SaleResponse, saleResponseSchema } from '../sale/schemas';

const processThreeDSChallengeRequestSchema = z.object({
  azulOrderId: z.string(),
  CRes: z.string()
});

export type ProcessThreeDSChallengeRequest = z.infer<typeof processThreeDSChallengeRequestSchema>;

async function processThreeDSChallengeInternal({
  body,
  requester
}: {
  body: ProcessThreeDSChallengeRequest;
  requester: AzulRequester;
}): Promise<SaleResponse> {
  const response = await requester.request({
    body: processThreeDSChallengeRequestSchema.parse(body),
    url: requester.url + '?ProcessThreedsChallenge'
  });

  return saleResponseSchema.parse(response);
}

export const processThreeDSChallenge = makeIdempotent(processThreeDSChallengeInternal);
