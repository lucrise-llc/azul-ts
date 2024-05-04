import z from "zod";
import crypto from "crypto";

export const PaymentRequesSchema = z
  .object({
    currencyCode: z.enum(["$"]).default("$"),
    orderNumber: z.string(),
    amount: z.number().int().positive(),
    ITBIS: z.number().int().positive(),
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
    saveToDataVault: z.enum(["1", "2"]).default("2").optional(),
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

export type PaymentPageRequestInput = z.input<typeof PaymentRequesSchema>;
export type PaymentPageRequestOutput = z.infer<typeof PaymentRequesSchema>;

type AzulPageConfig = {
  merchantId: string;
  merchantName: string;
  merchantType: string;
  authKey: string;
  environment: "dev" | "prod";
};

class AzulPage {
  private readonly config: AzulPageConfig;
  private azulURL: string;

  constructor(config: AzulPageConfig) {
    this.config = config;

    if (config.environment === "dev") {
      this.azulURL = "https://pruebas.azul.com.do/PaymentPage/";
    } else {
      this.azulURL = "https://pagos.azul.com.do/PaymentPage/";
    }
  }

  private authHash(paymentPageRequest: PaymentPageRequestOutput): string {
    const request = [
      this.config.merchantId,
      this.config.merchantName,
      this.config.merchantType,
      paymentPageRequest.currencyCode,
      paymentPageRequest.orderNumber,
      paymentPageRequest.amount,
      paymentPageRequest.ITBIS,

      paymentPageRequest.approvedUrl,
      paymentPageRequest.declinedUrl,
      paymentPageRequest.cancelUrl,

      paymentPageRequest.useCustomField1,
      paymentPageRequest.customField1Label,
      paymentPageRequest.customField1Value,

      paymentPageRequest.useCustomField2,
      paymentPageRequest.customField2Label,
      paymentPageRequest.customField2Value,

      this.config.authKey,
    ].join("");

    return crypto
      .createHmac("sha512", this.config.authKey)
      .update(request)
      .digest("hex");
  }

  createForm(userRequest: PaymentPageRequestInput): string {
    const paymentRequest = PaymentRequesSchema.parse(userRequest);
    const authHash = this.authHash(paymentRequest);

    return `<html>
<head>
<script>
  window.onload = function() {
    document.forms[0].submit();
  }
</script>
</head>
<body>
<form method="POST" action="${this.azulURL}">
<input type="hidden" id="MerchantId" name="MerchantId" value="${this.config.merchantId}" />
<input type="hidden" id="MerchantName" name="MerchantName" value="${this.config.merchantName}" />
<input type="hidden" id="MerchantType" name="MerchantType" value="${this.config.merchantType}" />
<input type="hidden" id="CurrencyCode" name="CurrencyCode" value="${paymentRequest.currencyCode}" />
<input type="hidden" id="OrderNumber" name="OrderNumber" value="${paymentRequest.orderNumber}" />
<input type="hidden" id="Amount" name="Amount" value="${paymentRequest.amount}" />
<input type="hidden" id="ITBIS" name="ITBIS" value="${paymentRequest.ITBIS}" />
<input type="hidden" id="ApprovedUrl" name="ApprovedUrl" value="${paymentRequest.approvedUrl}" />
<input type="hidden" id="DeclinedUrl" name="DeclinedUrl" value="${paymentRequest.declinedUrl}" />
<input type="hidden" id="CancelUrl" name="CancelUrl" value="${paymentRequest.cancelUrl}" />
<input type="hidden" id="UseCustomField1" name="UseCustomField1" value="${paymentRequest.useCustomField1}" />
<input type="hidden" id="UseCustomField2" name="UseCustomField2" value="${paymentRequest.useCustomField2}" />
<input type="hidden" id="AuthHash" name="AuthHash" value="${authHash}" />
</form>
</body>
<html>`;
  }
}

export default AzulPage;
