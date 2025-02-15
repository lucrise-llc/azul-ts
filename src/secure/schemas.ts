import { z } from 'zod';

export const threeDSChallengeResponseSchema = z
  .object({
    IsoCode: z.literal('3D'),
    AzulOrderId: z.string().nonempty(),
    ResponseMessage: z.literal('3D_SECURE_CHALLENGE'),

    ThreeDSChallenge: z.object({
      CReq: z.string(),
      RedirectPostUrl: z.string()
    })
  })
  .transform((response) => ({
    ...response,
    type: 'challenge' as const
  }));

export const threeDSMethodResponseSchema = z
  .object({
    IsoCode: z.literal('3D2METHOD'),
    AzulOrderId: z.string().nonempty(),
    ResponseMessage: z.literal('3D_SECURE_2_METHOD'),

    ThreeDSMethod: z.object({
      MethodForm: z.string().nonempty()
    })
  })
  .transform((response) => ({
    ...response,
    type: 'method' as const
  }));

export type ThreeDSChallengeResponse = z.infer<typeof threeDSChallengeResponseSchema>;
export type ThreeDSMethodResponse = z.infer<typeof threeDSMethodResponseSchema>;
