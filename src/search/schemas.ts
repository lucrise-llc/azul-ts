import { z } from 'zod';

export const searchRequestSchema = z.object({
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

export type SearchRequest = z.input<typeof searchRequestSchema>;

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
