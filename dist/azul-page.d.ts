import z from 'zod';
export declare const PaymentRequesSchema: z.ZodEffects<
  z.ZodEffects<
    z.ZodEffects<
      z.ZodEffects<
        z.ZodObject<
          {
            currencyCode: z.ZodDefault<z.ZodEnum<['$']>>;
            orderNumber: z.ZodString;
            amount: z.ZodNumber;
            ITBIS: z.ZodNumber;
            approvedUrl: z.ZodString;
            declinedUrl: z.ZodString;
            cancelUrl: z.ZodString;
            useCustomField1: z.ZodDefault<z.ZodEnum<['1', '0']>>;
            customField1Label: z.ZodOptional<z.ZodDefault<z.ZodString>>;
            customField1Value: z.ZodOptional<z.ZodDefault<z.ZodString>>;
            useCustomField2: z.ZodDefault<z.ZodEnum<['1', '0']>>;
            customField2Label: z.ZodOptional<z.ZodDefault<z.ZodString>>;
            customField2Value: z.ZodOptional<z.ZodDefault<z.ZodString>>;
            showTransactionResult: z.ZodOptional<z.ZodDefault<z.ZodEnum<['1', '0']>>>;
            locale: z.ZodOptional<z.ZodDefault<z.ZodEnum<['ES', 'EN']>>>;
            saveToDataVault: z.ZodOptional<z.ZodDefault<z.ZodEnum<['1', '2']>>>;
            dataVaultToken: z.ZodOptional<z.ZodString>;
            altMerchantName: z.ZodEffects<
              z.ZodOptional<z.ZodString>,
              string | undefined,
              string | undefined
            >;
          },
          'strip',
          z.ZodTypeAny,
          {
            currencyCode: '$';
            orderNumber: string;
            amount: number;
            ITBIS: number;
            approvedUrl: string;
            declinedUrl: string;
            cancelUrl: string;
            useCustomField1: '0' | '1';
            useCustomField2: '0' | '1';
            customField1Label?: string | undefined;
            customField1Value?: string | undefined;
            customField2Label?: string | undefined;
            customField2Value?: string | undefined;
            showTransactionResult?: '0' | '1' | undefined;
            locale?: 'ES' | 'EN' | undefined;
            saveToDataVault?: '1' | '2' | undefined;
            dataVaultToken?: string | undefined;
            altMerchantName?: string | undefined;
          },
          {
            orderNumber: string;
            amount: number;
            ITBIS: number;
            approvedUrl: string;
            declinedUrl: string;
            cancelUrl: string;
            currencyCode?: '$' | undefined;
            useCustomField1?: '0' | '1' | undefined;
            customField1Label?: string | undefined;
            customField1Value?: string | undefined;
            useCustomField2?: '0' | '1' | undefined;
            customField2Label?: string | undefined;
            customField2Value?: string | undefined;
            showTransactionResult?: '0' | '1' | undefined;
            locale?: 'ES' | 'EN' | undefined;
            saveToDataVault?: '1' | '2' | undefined;
            dataVaultToken?: string | undefined;
            altMerchantName?: string | undefined;
          }
        >,
        {
          currencyCode: '$';
          orderNumber: string;
          amount: number;
          ITBIS: number;
          approvedUrl: string;
          declinedUrl: string;
          cancelUrl: string;
          useCustomField1: '0' | '1';
          useCustomField2: '0' | '1';
          customField1Label?: string | undefined;
          customField1Value?: string | undefined;
          customField2Label?: string | undefined;
          customField2Value?: string | undefined;
          showTransactionResult?: '0' | '1' | undefined;
          locale?: 'ES' | 'EN' | undefined;
          saveToDataVault?: '1' | '2' | undefined;
          dataVaultToken?: string | undefined;
          altMerchantName?: string | undefined;
        },
        {
          orderNumber: string;
          amount: number;
          ITBIS: number;
          approvedUrl: string;
          declinedUrl: string;
          cancelUrl: string;
          currencyCode?: '$' | undefined;
          useCustomField1?: '0' | '1' | undefined;
          customField1Label?: string | undefined;
          customField1Value?: string | undefined;
          useCustomField2?: '0' | '1' | undefined;
          customField2Label?: string | undefined;
          customField2Value?: string | undefined;
          showTransactionResult?: '0' | '1' | undefined;
          locale?: 'ES' | 'EN' | undefined;
          saveToDataVault?: '1' | '2' | undefined;
          dataVaultToken?: string | undefined;
          altMerchantName?: string | undefined;
        }
      >,
      {
        currencyCode: '$';
        orderNumber: string;
        amount: number;
        ITBIS: number;
        approvedUrl: string;
        declinedUrl: string;
        cancelUrl: string;
        useCustomField1: '0' | '1';
        useCustomField2: '0' | '1';
        customField1Label?: string | undefined;
        customField1Value?: string | undefined;
        customField2Label?: string | undefined;
        customField2Value?: string | undefined;
        showTransactionResult?: '0' | '1' | undefined;
        locale?: 'ES' | 'EN' | undefined;
        saveToDataVault?: '1' | '2' | undefined;
        dataVaultToken?: string | undefined;
        altMerchantName?: string | undefined;
      },
      {
        orderNumber: string;
        amount: number;
        ITBIS: number;
        approvedUrl: string;
        declinedUrl: string;
        cancelUrl: string;
        currencyCode?: '$' | undefined;
        useCustomField1?: '0' | '1' | undefined;
        customField1Label?: string | undefined;
        customField1Value?: string | undefined;
        useCustomField2?: '0' | '1' | undefined;
        customField2Label?: string | undefined;
        customField2Value?: string | undefined;
        showTransactionResult?: '0' | '1' | undefined;
        locale?: 'ES' | 'EN' | undefined;
        saveToDataVault?: '1' | '2' | undefined;
        dataVaultToken?: string | undefined;
        altMerchantName?: string | undefined;
      }
    >,
    {
      currencyCode: '$';
      orderNumber: string;
      amount: number;
      ITBIS: number;
      approvedUrl: string;
      declinedUrl: string;
      cancelUrl: string;
      useCustomField1: '0' | '1';
      useCustomField2: '0' | '1';
      customField1Label?: string | undefined;
      customField1Value?: string | undefined;
      customField2Label?: string | undefined;
      customField2Value?: string | undefined;
      showTransactionResult?: '0' | '1' | undefined;
      locale?: 'ES' | 'EN' | undefined;
      saveToDataVault?: '1' | '2' | undefined;
      dataVaultToken?: string | undefined;
      altMerchantName?: string | undefined;
    },
    {
      orderNumber: string;
      amount: number;
      ITBIS: number;
      approvedUrl: string;
      declinedUrl: string;
      cancelUrl: string;
      currencyCode?: '$' | undefined;
      useCustomField1?: '0' | '1' | undefined;
      customField1Label?: string | undefined;
      customField1Value?: string | undefined;
      useCustomField2?: '0' | '1' | undefined;
      customField2Label?: string | undefined;
      customField2Value?: string | undefined;
      showTransactionResult?: '0' | '1' | undefined;
      locale?: 'ES' | 'EN' | undefined;
      saveToDataVault?: '1' | '2' | undefined;
      dataVaultToken?: string | undefined;
      altMerchantName?: string | undefined;
    }
  >,
  {
    currencyCode: '$';
    orderNumber: string;
    amount: number;
    ITBIS: number;
    approvedUrl: string;
    declinedUrl: string;
    cancelUrl: string;
    useCustomField1: '0' | '1';
    useCustomField2: '0' | '1';
    customField1Label?: string | undefined;
    customField1Value?: string | undefined;
    customField2Label?: string | undefined;
    customField2Value?: string | undefined;
    showTransactionResult?: '0' | '1' | undefined;
    locale?: 'ES' | 'EN' | undefined;
    saveToDataVault?: '1' | '2' | undefined;
    dataVaultToken?: string | undefined;
    altMerchantName?: string | undefined;
  },
  {
    orderNumber: string;
    amount: number;
    ITBIS: number;
    approvedUrl: string;
    declinedUrl: string;
    cancelUrl: string;
    currencyCode?: '$' | undefined;
    useCustomField1?: '0' | '1' | undefined;
    customField1Label?: string | undefined;
    customField1Value?: string | undefined;
    useCustomField2?: '0' | '1' | undefined;
    customField2Label?: string | undefined;
    customField2Value?: string | undefined;
    showTransactionResult?: '0' | '1' | undefined;
    locale?: 'ES' | 'EN' | undefined;
    saveToDataVault?: '1' | '2' | undefined;
    dataVaultToken?: string | undefined;
    altMerchantName?: string | undefined;
  }
>;
export type PaymentPageRequestInput = z.input<typeof PaymentRequesSchema>;
export type PaymentPageRequestOutput = z.infer<typeof PaymentRequesSchema>;
type AzulPageConfig = {
  merchantId: string;
  merchantName: string;
  merchantType: string;
  authKey: string;
  environment: 'dev' | 'prod';
};
declare class AzulPage {
  private readonly config;
  private azulURL;
  constructor(config: AzulPageConfig);
  private authHash;
  createForm(userRequest: PaymentPageRequestInput): string;
}
export default AzulPage;
//# sourceMappingURL=azul-page.d.ts.map
