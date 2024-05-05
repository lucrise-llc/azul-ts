import z from 'zod';

export const channel = z.string().max(3).optional().default('EC');
export const azulOrderId = z.string().max(8);
export const amount = z.number().int().positive();
export const ITBIS = z.number().int().positive();
export const cardNumber = z.string().max(19);
export const expiration = z.string().length(6);
export const CVC = z.string().length(3);
export const posInputMode = z.string().max(10).optional().default('E-Commerce');
export const orderNumber = z.string().max(15).optional();
export const acquirerRefData = z.enum(['0', '1']).optional();
export const customerServicePhone = z.string().max(32).optional();
export const ECommerceURL = z.string().max(32).optional();
export const customOrderId = z.string().max(75).optional();
export const altMerchantName = z.string().max(30).optional();
export const dataVaultToken = z.string().max(100).optional();
export const saveToDataVault = z.enum(['1', '2']).optional();
export const forceNo3DS = z.enum(['0', '1']).optional();

export const PostSchema = z.object({
  /**
   * Canal de pago.
   * Este valor es proporcionado por AZUL, junto a los
   * datos de acceso a cada ambiente
   */
  channel,
  /**
   * # de orden Azul. Identificador único de la transacción
   * tipo Hold previa.
   */
  azulOrderId,
  /**
   * Monto total de la transacción (Impuestos
   * incluidos.)
   * Se envía sin coma ni punto; los dos últimos dígitos
   * representan los decimales.
   * Ej. 1000 equivale a 10.00
   * Ej. 1748321 equivale a 17,483.21
   */
  amount,
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
  ITBIS
});

export type PostSchemaInput = z.infer<typeof PostSchema>;

export const SearchSchema = z.object({
  // YYYY-MM-DD
  dateFrom: z
    .string()
    .length(10)
    .regex(/^\d{4}-\d{2}-\d{2}$/),
  // YYYY-MM-DD
  dateTo: z
    .string()
    .length(10)
    .regex(/^\d{4}-\d{2}-\d{2}$/)
});

export type SearchSchemaInput = z.infer<typeof SearchSchema>;

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
