import { z } from 'zod';

import { azulOrderId, amount, ITBIS } from '../schemas';

export const PostRequestSchema = z
  .object({
    azulOrderId,
    amount,
    ITBIS
  })
  .transform((data) => {
    return {
      ...data,
      Itbis: data.ITBIS
    };
  });

export type PostRequest = z.input<typeof PostRequestSchema>;
