import z from 'zod';

export const verifySchema = z.object({
  Found: z.boolean(),
  TransactionType: z.string()
});

export type VerifyResponse = z.infer<typeof verifySchema>;
