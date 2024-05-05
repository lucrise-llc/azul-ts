import z from 'zod';
export declare const channel: z.ZodDefault<z.ZodOptional<z.ZodString>>;
export declare const azulOrderId: z.ZodString;
export declare const amount: z.ZodNumber;
export declare const ITBIS: z.ZodNumber;
export declare const cardNumber: z.ZodString;
export declare const expiration: z.ZodString;
export declare const CVC: z.ZodString;
export declare const posInputMode: z.ZodDefault<z.ZodOptional<z.ZodString>>;
export declare const orderNumber: z.ZodOptional<z.ZodString>;
export declare const acquirerRefData: z.ZodDefault<z.ZodOptional<z.ZodEnum<['0', '1']>>>;
export declare const customerServicePhone: z.ZodOptional<z.ZodString>;
export declare const ECommerceURL: z.ZodOptional<z.ZodString>;
export declare const customOrderId: z.ZodOptional<z.ZodString>;
export declare const altMerchantName: z.ZodOptional<z.ZodString>;
export declare const dataVaultToken: z.ZodOptional<z.ZodString>;
export declare const saveToDataVault: z.ZodOptional<z.ZodEnum<['1', '2']>>;
export declare const forceNo3DS: z.ZodOptional<z.ZodEnum<['0', '1']>>;
export declare const PostSchema: z.ZodEffects<
  z.ZodObject<
    {
      /**
       * # de orden Azul. Identificador único de la transacción
       * tipo Hold previa.
       */
      azulOrderId: z.ZodString;
      /**
       * Monto total de la transacción (Impuestos
       * incluidos.)
       * Se envía sin coma ni punto; los dos últimos dígitos
       * representan los decimales.
       * Ej. 1000 equivale a 10.00
       * Ej. 1748321 equivale a 17,483.21
       */
      amount: z.ZodNumber;
      /**
       * Valor del ITBIS. Mismo formato que el campo
       * Amount. El valor enviado en el campo de ITBIS no
       * se carga como un monto adicional en la
       * transacción. En el campo de Amount debe enviarse
       * total a cargar incluyendo el ITBIS.
       * Si la transacción o el negocio están exentos, se
       * envía en cero colocando el valo “000”.
       *
       * Este valor deberá también ser incluido en el cálculo
       * del hash.
       */
      ITBIS: z.ZodNumber;
    },
    'strip',
    z.ZodTypeAny,
    {
      amount: number;
      ITBIS: number;
      azulOrderId: string;
    },
    {
      amount: number;
      ITBIS: number;
      azulOrderId: string;
    }
  >,
  {
    Itbis: number;
    amount: number;
    ITBIS: number;
    azulOrderId: string;
  },
  {
    amount: number;
    ITBIS: number;
    azulOrderId: string;
  }
>;
export type PostSchemaInput = z.input<typeof PostSchema>;
export declare const SearchSchema: z.ZodObject<
  {
    /**
     * Fecha de inicio del rango de búsqueda.
     * Debes tener en cuenta que el sistema *sólo*
     * tomará en cuenta la fecha, ignorando la hora.
     */
    dateFrom: z.ZodEffects<z.ZodDate, string, Date>;
    /**
     * Fecha final del rango de búsqueda.
     * Debes tener en cuenta que el sistema *sólo*
     * tomará en cuenta la fecha, ignorando la hora.
     */
    dateTo: z.ZodEffects<z.ZodDate, string, Date>;
  },
  'strip',
  z.ZodTypeAny,
  {
    dateFrom: string;
    dateTo: string;
  },
  {
    dateFrom: Date;
    dateTo: Date;
  }
>;
export type SearchSchemaInput = z.input<typeof SearchSchema>;
export type SearchResponse = Partial<{
  ErrorDescription: string;
  ResponseCode: string;
  Transactions: Partial<{
    Amount: string;
    AuthorizationCode: string;
    AzulOrderId: string;
    CardNumber: string;
    CurrencyPosCode: string;
    CustomOrderId: string;
    DateTime: string;
    ErrorDescription: string;
    Found: boolean;
    IsoCode: string;
    Itbis: string;
    LotNumber: string;
    OrderNumber: string;
    RRN: string;
    ResponseCode: string;
    Ticket: string;
    TransactionType: string;
  }>[];
}>;
//# sourceMappingURL=schemas.d.ts.map
