import z from "zod";

export const PaymentPageRequest = z
  .object({
    currencyCode: z.enum(["$"]).default("$"),
    orderNumber: z.string(),
    amount: z.number().int().positive(),
    itbis: z.number().int().positive(),
    approvedUrl: z.string().url(),
    declinedUrl: z.string().url(),
    cancelUrl: z.string().url(),
    useCustomField1: z.enum(["1", "0"]).default("0"),
    customField1Label: z.string().default("").optional(),
    customField1Value: z.string().default("").optional(),
    useCustomField2: z.enum(["1", "0"]).default("0"),
    customField2Label: z.string().default("").optional(),
    customField2Value: z.string().default("").optional(),
    showTransactionResult: z.enum(["1", "0"]).default("1").optional(),
    locale: z.enum(["ES", "EN"]).default("ES").optional(),
    saveToDataVault: z.enum(["1", "0"]).default("0").optional(),
    dataVaultToken: z.string().optional(),
    altMerchantName: z
      .string()
      .max(25)
      .optional()
      .refine((value) => {
        if (value === undefined) {
          return true;
        }

        // This should only contain letters, numbers, spaces, and the following characters: . ,
        return /^[a-zA-Z0-9\s.,]*$/.test(value);
      }),
  })
  .refine(
    (data) => {
      return !(data.useCustomField1 === "1" && data.customField1Label === "");
    },
    {
      message: "Custom field label is required when using custom fields",
      path: ["customField1Label"],
    }
  )
  .refine(
    (data) => {
      return !(data.useCustomField1 === "1" && data.customField1Value === "");
    },
    {
      message: "Custom field value is required when using custom fields",
      path: ["customField1Value"],
    }
  )
  .refine(
    (data) => {
      return !(data.useCustomField2 === "1" && data.customField2Label === "");
    },
    {
      message: "Custom field label is required when using custom fields",
      path: ["customField2Label"],
    }
  )
  .refine(
    (data) => {
      return !(data.useCustomField2 === "1" && data.customField2Value === "");
    },
    {
      message: "Custom field value is required when using custom fields",
      path: ["customField2Value"],
    }
  );

export type PaymentPageRequest = z.input<typeof PaymentPageRequest>;
