import z from 'zod';

export const channel = z.string().max(3).optional().default('EC');
export const azulOrderId = z.string().max(8);
export const amount = z.number().int().positive();
export const ITBIS = z.number().int().nonnegative();
export const cardNumber = z.string().max(19).optional();
export const expiration = z.string().length(6).optional();
export const CVC = z.string().length(3).optional();
export const posInputMode = z.string().max(10).optional().default('E-Commerce');
export const orderNumber = z.string().max(15).optional();
export const acquirerRefData = z.enum(['0', '1']).optional().default('1');
export const customerServicePhone = z.string().max(32).optional();
export const ECommerceURL = z.string().max(32).optional();
export const customOrderId = z.string().max(75).optional();
export const altMerchantName = z.string().max(25).optional();
export const dataVaultToken = z.string().max(36).optional();
export const saveToDataVault = z.enum(['1', '2']).optional();
export const forceNo3DS = z.enum(['0', '1']).optional();

export const PostSchema = z
  .object({
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
     * envía en cero colocando el valo "000".
     *
     * Este valor deberá también ser incluido en el cálculo
     * del hash.
     */
    ITBIS
  })
  .transform((data) => {
    return {
      ...data,
      Itbis: data.ITBIS
    };
  });

export type PostSchemaInput = z.input<typeof PostSchema>;

export const SearchSchema = z.object({
  /**
   * Fecha de inicio del rango de búsqueda.
   * Debes tener en cuenta que el sistema *sólo*
   * tomará en cuenta la fecha, ignorando la hora.
   */
  dateFrom: z.date().transform((date) => date.toISOString().split('T')[0]),
  /**
   * Fecha final del rango de búsqueda.
   * Debes tener en cuenta que el sistema *sólo*
   * tomará en cuenta la fecha, ignorando la hora.
   */
  dateTo: z.date().transform((date) => date.toISOString().split('T')[0])
});

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
